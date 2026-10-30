<?php

namespace App\Actions\Cartera;

use App\Models\AccountReceivable;
use App\Models\CashShift;
use App\Models\ReceivablePayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegisterReceivablePaymentAction
{
    /**
     * Registra un abono a cartera reduciendo el saldo con bloqueo pesimista.
     *
     * @throws ValidationException
     */
    public function execute(array $data, int $userId): ReceivablePayment
    {
        return DB::transaction(function () use ($data, $userId) {
            $receivable = AccountReceivable::where('id', $data['account_receivable_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $amount = round((float) $data['amount'], 2);

            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => ['El monto del abono debe ser mayor a cero.'],
                ]);
            }

            if ($amount > (float) $receivable->current_balance) {
                throw ValidationException::withMessages([
                    'amount' => ["El abono ({$amount}) no puede ser superior al saldo pendiente ({$receivable->current_balance})."],
                ]);
            }

            $newBalance = round((float) $receivable->current_balance - $amount, 2);
            $newStatus = ($newBalance <= 0.001) ? 'PAID' : 'PARTIAL';

            $receivable->update([
                'current_balance' => $newBalance,
                'status' => $newStatus,
            ]);

            $payment = ReceivablePayment::create([
                'account_receivable_id' => $receivable->id,
                'user_id' => $userId,
                'cash_shift_id' => $data['cash_shift_id'] ?? null,
                'amount' => $amount,
                'payment_method' => $data['payment_method'],
                'reference_code' => $data['reference_code'] ?? null,
                'notes' => $data['notes'] ?? null,
                'payment_date' => now(),
            ]);

            // Generar Asiento Contable Automático de Recaudo (Fase 5)
            app(\App\Actions\Accounting\GenerateAccountingEntryAction::class)->forReceivablePayment($payment);

            return $payment->load(['accountReceivable', 'user', 'cashShift']);
        });
    }
}
