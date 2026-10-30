<?php

namespace App\Http\Controllers\Api\Payroll;

use App\Actions\Payroll\LiquidatePayrollPeriodAction;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PayrollNovelty;
use App\Models\PayrollPeriod;
use App\Models\PayrollSlip;
use App\Services\DIAN\DianPayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PayrollController extends Controller
{
    /**
     * Lista de periodos de nómina.
     */
    public function periods(): JsonResponse
    {
        $periods = PayrollPeriod::withCount('slips')
            ->latest('id')
            ->get();

        return response()->json([
            'data' => $periods,
        ]);
    }

    /**
     * Crear un nuevo periodo de nómina.
     */
    public function createPeriod(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'period_type' => ['nullable', 'in:mensual,quincenal'],
        ]);

        $period = PayrollPeriod::create([
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'period_type' => $validated['period_type'] ?? 'mensual',
            'status' => 'DRAFT',
        ]);

        return response()->json([
            'message' => 'Periodo de nómina creado.',
            'data' => $period,
        ], 201);
    }

    /**
     * Ejecuta la liquidación completa del periodo, generando desprendibles, CUNE y asiento NIIF.
     */
    public function liquidate(int $id, LiquidatePayrollPeriodAction $action): JsonResponse
    {
        $period = $action->execute($id);

        return response()->json([
            'message' => 'Nómina liquidada exitosamente con CUNE DIAN y asiento contable generado.',
            'data' => $period,
        ]);
    }

    /**
     * Lista de desprendibles de un periodo de nómina.
     */
    public function slips(int $id): JsonResponse
    {
        $slips = PayrollSlip::with(['employee', 'period'])
            ->where('payroll_period_id', $id)
            ->get();

        return response()->json([
            'data' => $slips,
        ]);
    }

    /**
     * Descarga del XML UBL 2.1 oficial DIAN de Nómina Individual.
     */
    public function downloadSlipXml(int $slipId, DianPayrollService $dianService): Response
    {
        $slip = PayrollSlip::with(['employee', 'period'])->findOrFail($slipId);
        $xmlContent = $dianService->generatePayrollXml($slip);

        return response($xmlContent, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$slip->consecutive}.xml\"",
        ]);
    }

    /**
     * Catálogo de Empleados.
     */
    public function employees(Request $request): JsonResponse
    {
        $query = Employee::query();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('document_number', 'like', "%{$q}%")
                    ->orWhere('role', 'like', "%{$q}%");
            });
        }

        $employees = $query->orderBy('last_name')->get();

        return response()->json([
            'data' => $employees,
        ]);
    }

    /**
     * Registro de nuevo empleado.
     */
    public function createEmployee(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'document_type' => ['nullable', 'string', 'max:10'],
            'document_number' => ['required', 'string', 'max:30', 'unique:employees,document_number'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'role' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'branch' => ['nullable', 'string', 'max:100'],
            'contract_type' => ['nullable', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'has_transport_allowance' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:activo,inactivo,vacaciones,suspendido'],
            'eps' => ['nullable', 'string'],
            'pension_fund' => ['nullable', 'string'],
            'arl' => ['nullable', 'string'],
            'bank_name' => ['nullable', 'string'],
            'account_number' => ['nullable', 'string'],
        ]);

        $nextNum = (Employee::max('id') ?? 0) + 1;
        $code = 'EMP-' . str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);

        $employee = Employee::create([
            ...$validated,
            'code' => $code,
            'status' => $validated['status'] ?? 'activo',
        ]);

        return response()->json([
            'message' => 'Empleado registrado con éxito.',
            'data' => $employee,
        ], 201);
    }

    /**
     * Lista de novedades registradas.
     */
    public function novelties(): JsonResponse
    {
        $novelties = PayrollNovelty::with(['employee', 'period'])
            ->latest('id')
            ->get();

        return response()->json([
            'data' => $novelties,
        ]);
    }

    /**
     * Registrar novedad de nómina (Horas extras, recargos, comisiones).
     */
    public function createNovelty(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'payroll_period_id' => ['nullable', 'exists:payroll_periods,id'],
            'novelty_type' => ['required', 'string'],
            'quantity' => ['nullable', 'numeric'],
            'amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $novelty = PayrollNovelty::create([
            ...$validated,
            'status' => 'APROBADA',
        ]);

        return response()->json([
            'message' => 'Novedad de nómina registrada con éxito.',
            'data' => $novelty,
        ], 201);
    }
}
