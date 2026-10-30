<?php

namespace App\Actions\Payroll;

use App\Actions\Accounting\GenerateAccountingEntryAction;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\PayrollSlip;
use App\Services\DIAN\DianPayrollService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LiquidatePayrollPeriodAction
{
    public function __construct(
        protected DianPayrollService $dianService,
        protected GenerateAccountingEntryAction $accountingAction
    ) {}

    /**
     * Liquida integralmente el periodo de nómina bajo la legislación colombiana (CST / PILA),
     * calcula los CUNE reglamentarios y genera el comprobante contable de partida doble.
     *
     * @throws ValidationException
     */
    public function execute(int $periodId): PayrollPeriod
    {
        return DB::transaction(function () use ($periodId) {
            $period = PayrollPeriod::where('id', $periodId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($period->status === 'PAID') {
                throw ValidationException::withMessages([
                    'period' => ['Este periodo de nómina ya fue liquidado y pagado.'],
                ]);
            }

            // Eliminar desprendibles previos si era un borrador
            $period->slips()->delete();

            $employees = Employee::where('status', 'activo')->get();
            if ($employees->isEmpty()) {
                throw ValidationException::withMessages([
                    'employees' => ['No existen empleados activos para liquidar en este periodo.'],
                ]);
            }

            $periodTotalDevengado = 0.0;
            $periodTotalDeducciones = 0.0;
            $periodTotalNeto = 0.0;
            $periodTotalSalarios = 0.0;
            $periodTotalTransporte = 0.0;
            $periodTotalSalud = 0.0;
            $periodTotalPension = 0.0;

            $slipCounter = (PayrollSlip::max('id') ?? 0) + 1;
            $issueDate = now()->toDateString();
            $issueTime = now()->format('H:i:s') . '-05:00';

            foreach ($employees as $emp) {
                $baseSalary = (float) $emp->base_salary;

                // Auxilio de transporte legal Colombia 2026 (aplica si salario <= 2 SMMLV ~ $2.600.000)
                $transportAllowance = ($emp->has_transport_allowance && $baseSalary <= 2600000.0)
                    ? 162000.00
                    : 0.00;

                // Novedades adicionales del empleado en este periodo
                $novelties = $emp->novelties()
                    ->where('status', 'APROBADA')
                    ->where(function ($q) use ($periodId) {
                        $q->whereNull('payroll_period_id')->orWhere('payroll_period_id', $periodId);
                    })
                    ->get();

                $overtime = (float) $novelties->whereIn('novelty_type', ['HORA_EXTRA_DIURNA', 'HORA_EXTRA_NOCTURNA', 'RECARGO_NOCTURNO'])->sum('amount');
                $commissions = (float) $novelties->where('novelty_type', 'COMISION')->sum('amount');
                $bonuses = (float) $novelties->where('novelty_type', 'BONIFICACION')->sum('amount');

                $totalDevengado = round($baseSalary + $transportAllowance + $overtime + $commissions + $bonuses, 2);

                // IBC para seguridad social (devengado excepto auxilio de transporte según Art. 127 CST)
                $ibc = max(0, $totalDevengado - $transportAllowance);
                $health = round($ibc * 0.04, 2);  // 4% empleado
                $pension = round($ibc * 0.04, 2); // 4% empleado
                $totalDeducciones = round($health + $pension, 2);
                $netPaid = round($totalDevengado - $totalDeducciones, 2);

                $consecutive = 'NE-' . str_pad((string) $slipCounter, 6, '0', STR_PAD_LEFT);
                $slipCounter++;

                $cune = $this->dianService->calculateCune(
                    $consecutive,
                    $issueDate,
                    $issueTime,
                    $totalDevengado,
                    $totalDeducciones,
                    $netPaid,
                    $emp->document_number
                );

                $qrData = "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey={$cune}";

                PayrollSlip::create([
                    'payroll_period_id' => $period->id,
                    'employee_id' => $emp->id,
                    'consecutive' => $consecutive,
                    'worked_days' => 30,
                    'base_salary' => $baseSalary,
                    'transport_allowance' => $transportAllowance,
                    'overtime_amount' => $overtime,
                    'commissions' => $commissions,
                    'bonuses' => $bonuses,
                    'total_devengado' => $totalDevengado,
                    'health_deduction' => $health,
                    'pension_deduction' => $pension,
                    'other_deductions' => 0,
                    'total_deducciones' => $totalDeducciones,
                    'net_paid' => $netPaid,
                    'cune' => $cune,
                    'qr_data' => $qrData,
                    'dian_status' => 'APROBADO',
                ]);

                // Acumular para totales del periodo
                $periodTotalDevengado += $totalDevengado;
                $periodTotalDeducciones += $totalDeducciones;
                $periodTotalNeto += $netPaid;
                $periodTotalSalarios += ($baseSalary + $overtime + $commissions + $bonuses);
                $periodTotalTransporte += $transportAllowance;
                $periodTotalSalud += $health;
                $periodTotalPension += $pension;
            }

            $period->update([
                'status' => 'APPROVED',
                'total_devengado' => $periodTotalDevengado,
                'total_deducciones' => $periodTotalDeducciones,
                'total_neto' => $periodTotalNeto,
            ]);

            // Generar Comprobante Contable de Partida Doble (NIIF Colombia - Fase 5 Engine)
            $accountingLines = [
                // Débito: 510506 Sueldos y Salarios
                [
                    'account_code' => '510506',
                    'account_name' => 'Sueldos y Salarios',
                    'debit' => $periodTotalSalarios,
                    'credit' => 0,
                    'notes' => "Costo salarial nómina {$period->name}",
                ],
            ];

            if ($periodTotalTransporte > 0) {
                // Débito: 510527 Auxilio de Transporte
                $accountingLines[] = [
                    'account_code' => '510527',
                    'account_name' => 'Auxilio de Transporte',
                    'debit' => $periodTotalTransporte,
                    'credit' => 0,
                    'notes' => "Auxilio legal transporte {$period->name}",
                ];
            }

            // Crédito: 237005 Aportes a Salud EPS por pagar
            $accountingLines[] = [
                'account_code' => '237005',
                'account_name' => 'Aportes a Entidades Promotoras de Salud (EPS)',
                'debit' => 0,
                'credit' => $periodTotalSalud,
                'notes' => "Retención salud 4% nómina {$period->name}",
            ];

            // Crédito: 238030 Fondos de Pensiones y Cesantías
            $accountingLines[] = [
                'account_code' => '238030',
                'account_name' => 'Fondos de Pensiones y/o Cesantías',
                'debit' => 0,
                'credit' => $periodTotalPension,
                'notes' => "Retención pensión 4% nómina {$period->name}",
            ];

            // Crédito: 250505 Salarios por Pagar (Neto a pagar a empleados)
            $accountingLines[] = [
                'account_code' => '250505',
                'account_name' => 'Salarios por Pagar a Empleados',
                'debit' => 0,
                'credit' => $periodTotalNeto,
                'notes' => "Neto a pagar nómina {$period->name}",
            ];

            $this->accountingAction->execute([
                'entry_type' => 'NOMINA',
                'reference_type' => 'PayrollPeriod',
                'reference_id' => (string) $period->id,
                'concept' => "Liquidación y causación contable de {$period->name}",
                'lines' => $accountingLines,
            ]);

            return $period->load(['slips.employee']);
        });
    }
}
