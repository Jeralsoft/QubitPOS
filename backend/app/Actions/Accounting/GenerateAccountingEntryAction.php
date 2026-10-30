<?php

namespace App\Actions\Accounting;

use App\Models\AccountingAccount;
use App\Models\AccountingEntry;
use App\Models\AccountingEntryLine;
use App\Models\Purchase;
use App\Models\ReceivablePayment;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GenerateAccountingEntryAction
{
    /**
     * Registra un comprobante contable validando rigurosamente el cuadre de partida doble (Debe = Haber).
     *
     * @param array{
     *   entry_type: string,
     *   reference_type?: string,
     *   reference_id?: string,
     *   user_id?: int,
     *   entry_date?: string,
     *   concept: string,
     *   lines: array<array{
     *     account_code: string,
     *     debit: float,
     *     credit: float,
     *     third_party_name?: string,
     *     third_party_tax_id?: string,
     *     notes?: string
     *   }>
     * } $data
     * @throws ValidationException
     */
    public function execute(array $data): AccountingEntry
    {
        return DB::transaction(function () use ($data) {
            $totalDebit = 0.0;
            $totalCredit = 0.0;

            foreach ($data['lines'] as $line) {
                $totalDebit += round((float) ($line['debit'] ?? 0), 2);
                $totalCredit += round((float) ($line['credit'] ?? 0), 2);
            }

            $totalDebit = round($totalDebit, 2);
            $totalCredit = round($totalCredit, 2);

            // Regla Innegociable NIIF: Partida Doble Cuadrada al centavo
            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw ValidationException::withMessages([
                    'balance' => ["El asiento contable no cuadra: Total Débitos ($totalDebit) != Total Créditos ($totalCredit). Diferencia: " . round($totalDebit - $totalCredit, 2)],
                ]);
            }

            $consecutiveNum = (AccountingEntry::max('id') ?? 0) + 1;
            $consecutive = 'CC-' . str_pad((string) $consecutiveNum, 6, '0', STR_PAD_LEFT);

            $entry = AccountingEntry::create([
                'consecutive' => $consecutive,
                'entry_type' => $data['entry_type'],
                'reference_type' => $data['reference_type'] ?? null,
                'reference_id' => $data['reference_id'] ?? null,
                'user_id' => $data['user_id'] ?? 1,
                'entry_date' => $data['entry_date'] ?? now()->toDateString(),
                'concept' => $data['concept'],
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'is_balanced' => true,
                'status' => 'POSTED',
            ]);

            foreach ($data['lines'] as $line) {
                $account = AccountingAccount::where('code', $line['account_code'])->first();
                if (! $account) {
                    // Si no existe la cuenta auxiliar en catálogo, auto-crearla con base en el código
                    $nature = in_array(substr($line['account_code'], 0, 1), ['1', '5', '6', '7']) ? 'D' : 'C';
                    $type = match (substr($line['account_code'], 0, 1)) {
                        '1' => 'ACTIVO',
                        '2' => 'PASIVO',
                        '3' => 'PATRIMONIO',
                        '4' => 'INGRESO',
                        '5' => 'GASTO',
                        '6', '7' => 'COSTO',
                        default => 'ACTIVO',
                    };

                    $account = AccountingAccount::create([
                        'code' => $line['account_code'],
                        'name' => $line['account_name'] ?? "Cuenta {$line['account_code']}",
                        'nature' => $nature,
                        'type' => $type,
                        'level' => strlen($line['account_code']),
                        'is_movement' => true,
                        'is_active' => true,
                    ]);
                }

                AccountingEntryLine::create([
                    'accounting_entry_id' => $entry->id,
                    'accounting_account_id' => $account->id,
                    'third_party_name' => $line['third_party_name'] ?? null,
                    'third_party_tax_id' => $line['third_party_tax_id'] ?? null,
                    'debit' => round((float) ($line['debit'] ?? 0), 2),
                    'credit' => round((float) ($line['credit'] ?? 0), 2),
                    'notes' => $line['notes'] ?? null,
                ]);
            }

            return $entry->load(['lines.account', 'user']);
        });
    }

    /**
     * Genera automáticamente el asiento contable estándar de una venta POS.
     */
    public function forSale(Sale $sale, float $kardexCost = 0.0): AccountingEntry
    {
        $taxBase = (float) $sale->tax_base;
        $taxAmount = (float) $sale->tax_amount;
        $total = (float) $sale->total;

        $lines = [];

        // 1. Medio de Pago / Cobro
        if ($sale->payment_method === 'credito') {
            $lines[] = [
                'account_code' => '130505',
                'account_name' => 'Clientes Nacionales',
                'debit' => $total,
                'credit' => 0,
                'third_party_name' => $sale->customer_name,
                'third_party_tax_id' => $sale->customer_tax_id,
                'notes' => "Venta a crédito {$sale->invoice_number}",
            ];
        } elseif ($sale->payment_method === 'efectivo') {
            $lines[] = [
                'account_code' => '110505',
                'account_name' => 'Caja General',
                'debit' => $total,
                'credit' => 0,
                'third_party_name' => $sale->customer_name,
                'third_party_tax_id' => $sale->customer_tax_id,
                'notes' => "Cobro en efectivo mostrador {$sale->invoice_number}",
            ];
        } else {
            $lines[] = [
                'account_code' => '111005',
                'account_name' => 'Bancos / Datáfono',
                'debit' => $total,
                'credit' => 0,
                'third_party_name' => $sale->customer_name,
                'third_party_tax_id' => $sale->customer_tax_id,
                'notes' => "Cobro digital / tarjeta {$sale->invoice_number}",
            ];
        }

        // 2. Ingresos Operacionales (Comercio al por mayor y menor)
        $lines[] = [
            'account_code' => '413501',
            'account_name' => 'Comercio al por mayor y menor',
            'debit' => 0,
            'credit' => $taxBase,
            'third_party_name' => $sale->customer_name,
            'third_party_tax_id' => $sale->customer_tax_id,
            'notes' => "Venta neta {$sale->invoice_number}",
        ];

        // 3. IVA Generado por Pagar (19%)
        if ($taxAmount > 0) {
            $lines[] = [
                'account_code' => '240801',
                'account_name' => 'Impuesto a las ventas (IVA) por pagar',
                'debit' => 0,
                'credit' => $taxAmount,
                'third_party_name' => 'Dirección de Impuestos y Aduanas Nacionales DIAN',
                'third_party_tax_id' => '800197268',
                'notes' => "IVA 19% generado {$sale->invoice_number}",
            ];
        }

        // 4. Costo de Ventas e Inventario (si se suministra costo Kárdex)
        if ($kardexCost > 0) {
            $lines[] = [
                'account_code' => '613501',
                'account_name' => 'Costo de Ventas - Comercio',
                'debit' => $kardexCost,
                'credit' => 0,
                'notes' => "Costo mercancía vendida {$sale->invoice_number}",
            ];
            $lines[] = [
                'account_code' => '143501',
                'account_name' => 'Inventario de Mercancías',
                'debit' => 0,
                'credit' => $kardexCost,
                'notes' => "Salida de inventario a costo {$sale->invoice_number}",
            ];
        }

        return $this->execute([
            'entry_type' => 'VENTA',
            'reference_type' => 'Sale',
            'reference_id' => $sale->invoice_number,
            'user_id' => $sale->user_id,
            'entry_date' => $sale->created_at->toDateString(),
            'concept' => "Contabilización automática de venta POS {$sale->invoice_number}",
            'lines' => $lines,
        ]);
    }

    /**
     * Genera automáticamente el asiento contable estándar de una compra a proveedor.
     */
    public function forPurchase(Purchase $purchase): AccountingEntry
    {
        $purchase->loadMissing(['supplier']);

        $subtotal = (float) $purchase->subtotal;
        $taxAmount = (float) $purchase->tax_amount;
        $total = (float) $purchase->total;

        $lines = [];

        // 1. Débito a Inventario de Mercancías
        $lines[] = [
            'account_code' => '143501',
            'account_name' => 'Inventario de Mercancías',
            'debit' => $subtotal,
            'credit' => 0,
            'third_party_name' => $purchase->supplier->name,
            'third_party_tax_id' => $purchase->supplier->tax_id,
            'notes' => "Ingreso inventario Fac. {$purchase->invoice_number}",
        ];

        // 2. Débito a IVA Descontable
        if ($taxAmount > 0) {
            $lines[] = [
                'account_code' => '240802',
                'account_name' => 'IVA Descontable en Compras',
                'debit' => $taxAmount,
                'credit' => 0,
                'third_party_name' => 'Dirección de Impuestos y Aduanas Nacionales DIAN',
                'third_party_tax_id' => '800197268',
                'notes' => "IVA descontable Fac. {$purchase->invoice_number}",
            ];
        }

        // 3. Crédito a Proveedores (CxP) o Caja/Bancos (Contado)
        if ($purchase->payment_method === 'credito') {
            $lines[] = [
                'account_code' => '220505',
                'account_name' => 'Proveedores Nacionales',
                'debit' => 0,
                'credit' => $total,
                'third_party_name' => $purchase->supplier->name,
                'third_party_tax_id' => $purchase->supplier->tax_id,
                'notes' => "Cuenta por pagar Fac. {$purchase->invoice_number}",
            ];
        } else {
            $lines[] = [
                'account_code' => '111005',
                'account_name' => 'Bancos / Tesorería',
                'debit' => 0,
                'credit' => $total,
                'third_party_name' => $purchase->supplier->name,
                'third_party_tax_id' => $purchase->supplier->tax_id,
                'notes' => "Pago contado Fac. {$purchase->invoice_number}",
            ];
        }

        return $this->execute([
            'entry_type' => 'COMPRA',
            'reference_type' => 'Purchase',
            'reference_id' => $purchase->invoice_number,
            'user_id' => $purchase->user_id,
            'entry_date' => $purchase->purchase_date->toDateString(),
            'concept' => "Contabilización automática compra Fac. {$purchase->invoice_number} - {$purchase->supplier->name}",
            'lines' => $lines,
        ]);
    }

    /**
     * Genera automáticamente el asiento contable de un abono a cartera.
     */
    public function forReceivablePayment(ReceivablePayment $payment): AccountingEntry
    {
        $payment->loadMissing(['accountReceivable']);
        $amount = (float) $payment->amount;

        $lines = [];

        // 1. Débito a Caja o Banco
        $accountCode = ($payment->payment_method === 'efectivo') ? '110505' : '111005';
        $accountName = ($payment->payment_method === 'efectivo') ? 'Caja General' : 'Bancos';

        $lines[] = [
            'account_code' => $accountCode,
            'account_name' => $accountName,
            'debit' => $amount,
            'credit' => 0,
            'third_party_name' => $payment->accountReceivable->customer_name,
            'third_party_tax_id' => $payment->accountReceivable->customer_tax_id,
            'notes' => "Ingreso por recaudo {$payment->reference_code}",
        ];

        // 2. Crédito a Clientes Nacionales (CxC)
        $lines[] = [
            'account_code' => '130505',
            'account_name' => 'Clientes Nacionales',
            'debit' => 0,
            'credit' => $amount,
            'third_party_name' => $payment->accountReceivable->customer_name,
            'third_party_tax_id' => $payment->accountReceivable->customer_tax_id,
            'notes' => "Abono a cartera {$payment->reference_code}",
        ];

        return $this->execute([
            'entry_type' => 'COBRO',
            'reference_type' => 'ReceivablePayment',
            'reference_id' => $payment->reference_code ?? (string) $payment->id,
            'user_id' => $payment->user_id,
            'entry_date' => now()->toDateString(),
            'concept' => "Recaudo de cartera - {$payment->accountReceivable->customer_name}",
            'lines' => $lines,
        ]);
    }
}
