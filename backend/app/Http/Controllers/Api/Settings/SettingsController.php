<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CashRegister;
use App\Models\CompanySetting;
use App\Models\DianResolution;
use App\Models\DianSetting;
use App\Models\SystemPermission;
use App\Models\SystemRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Obtener datos fiscales de la empresa.
     */
    public function getCompany(): JsonResponse
    {
        $company = CompanySetting::first() ?? CompanySetting::create([
            'trade_name' => 'QUBIT POS',
            'legal_name' => 'Qubit Soluciones POS S.A.S.',
            'nit' => '901.456.789-3',
            'dv' => '3',
            'phone' => '+57 604 444 8899',
            'email' => 'contacto@qubitpos.co',
            'address' => 'Calle 30 # 45-12, Local 3',
            'city' => 'Medellín',
            'department' => 'Antioquia',
            'website' => 'https://www.qubitpos.co',
            'currency' => 'COP',
            'timezone' => 'America/Bogota',
        ]);

        return response()->json([
            'data' => $company,
        ]);
    }

    /**
     * Actualizar datos fiscales de la empresa.
     */
    public function updateCompany(Request $request): JsonResponse
    {
        $company = CompanySetting::first();
        if (! $company) {
            $company = new CompanySetting();
        }

        $validated = $request->validate([
            'trade_name' => ['required', 'string', 'max:150'],
            'legal_name' => ['required', 'string', 'max:200'],
            'nit' => ['required', 'string', 'max:30'],
            'dv' => ['nullable', 'string', 'max:2'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:150'],
        ]);

        $company->fill($validated)->save();

        return response()->json([
            'message' => 'Datos de la empresa actualizados exitosamente.',
            'data' => $company,
        ]);
    }

    /**
     * Obtener configuración DIAN UBL 2.1.
     */
    public function getDian(): JsonResponse
    {
        $dian = DianSetting::first() ?? DianSetting::create([
            'environment' => 'Pruebas',
            'company_type' => 'Persona jurídica',
            'fiscal_responsibility' => 'O-13 - Gran contribuyente',
            'software_id' => 'SW-QUBITPOS-001',
            'software_pin' => '12345',
            'test_set_id' => 'a1b2c3d4-0000-0000-0000-000000000000',
            'technical_key' => 'fc8eac422eba16e22ffd8c6f94b3f40a6e38162c',
            'is_connected' => true,
            'is_auto_send' => true,
        ]);

        return response()->json([
            'data' => $dian,
        ]);
    }

    /**
     * Actualizar configuración técnica DIAN.
     */
    public function updateDian(Request $request): JsonResponse
    {
        $dian = DianSetting::first();
        if (! $dian) {
            $dian = new DianSetting();
        }

        $validated = $request->validate([
            'environment' => ['required', 'in:Pruebas,Producción'],
            'company_type' => ['required', 'string', 'max:50'],
            'fiscal_responsibility' => ['required', 'string', 'max:100'],
            'software_id' => ['required', 'string', 'max:100'],
            'software_pin' => ['nullable', 'string', 'max:20'],
            'test_set_id' => ['nullable', 'string', 'max:150'],
            'technical_key' => ['nullable', 'string'],
            'is_connected' => ['nullable', 'boolean'],
            'is_auto_send' => ['nullable', 'boolean'],
            'send_email_to_customer' => ['nullable', 'boolean'],
            'contingency_mode' => ['nullable', 'boolean'],
        ]);

        $dian->fill($validated)->save();

        return response()->json([
            'message' => 'Configuración técnica DIAN guardada con éxito.',
            'data' => $dian,
        ]);
    }

    /**
     * Listado de sucursales.
     */
    public function branches(): JsonResponse
    {
        $branches = Branch::withCount('registers')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $branches,
        ]);
    }

    /**
     * Crear una nueva sucursal.
     */
    public function createBranch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:branches,code'],
            'name' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $branch = Branch::create($validated);

        return response()->json([
            'message' => 'Sucursal creada exitosamente.',
            'data' => $branch,
        ], 201);
    }

    /**
     * Listado de cajas registradoras.
     */
    public function cashRegisters(): JsonResponse
    {
        $registers = CashRegister::with('branch')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $registers,
        ]);
    }

    /**
     * Crear caja registradora.
     */
    public function createCashRegister(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'name' => ['required', 'string', 'max:100'],
            'terminal_code' => ['required', 'string', 'max:50', 'unique:cash_registers,terminal_code'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $register = CashRegister::create($validated);

        return response()->json([
            'message' => 'Caja registradora vinculada.',
            'data' => $register,
        ], 201);
    }

    /**
     * Listado de resoluciones DIAN.
     */
    public function resolutions(): JsonResponse
    {
        $resolutions = DianResolution::orderByDesc('issued_at')->get();

        return response()->json([
            'data' => $resolutions,
        ]);
    }

    /**
     * Crear resolución DIAN.
     */
    public function createResolution(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resolution_number' => ['required', 'string', 'max:50'],
            'prefix' => ['required', 'string', 'max:10'],
            'range_from' => ['required', 'integer', 'min:1'],
            'range_to' => ['required', 'integer', 'gt:range_from'],
            'current_number' => ['required', 'integer', 'gte:range_from'],
            'issued_at' => ['required', 'date'],
            'expires_at' => ['required', 'date', 'after:issued_at'],
            'technical_key' => ['nullable', 'string'],
            'status' => ['nullable', 'in:Vigente,Por vencer,Vencida'],
        ]);

        $resolution = DianResolution::create($validated);

        return response()->json([
            'message' => 'Resolución DIAN registrada exitosamente.',
            'data' => $resolution,
        ], 201);
    }

    /**
     * Listado de roles del sistema.
     */
    public function roles(): JsonResponse
    {
        $roles = SystemRole::with('permissions')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $roles,
        ]);
    }

    /**
     * Listado de permisos agrupados por módulo.
     */
    public function permissions(): JsonResponse
    {
        $permissions = SystemPermission::orderBy('module')->get();

        return response()->json([
            'data' => $permissions,
        ]);
    }
}
