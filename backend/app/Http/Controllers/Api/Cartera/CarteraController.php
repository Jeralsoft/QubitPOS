<?php

namespace App\Http\Controllers\Api\Cartera;

use App\Actions\Cartera\RegisterReceivablePaymentAction;
use App\Http\Controllers\Controller;
use App\Models\AccountReceivable;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarteraController extends Controller
{
    /**
     * Lista de cuentas por cobrar (cartera de clientes) con filtros por estado o mora.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AccountReceivable::with(['payments.user', 'sale']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('customer_name', 'like', "%{$q}%")
                    ->orWhere('customer_tax_id', 'like', "%{$q}%")
                    ->orWhere('customer_phone', 'like', "%{$q}%");
            });
        }

        $records = $query->orderBy('due_date', 'asc')->get();

        return response()->json([
            'data' => $records,
        ]);
    }

    /**
     * Detalle de una cuenta por cobrar con historial de abonos.
     */
    public function show(int $id): JsonResponse
    {
        $record = AccountReceivable::with(['payments.user', 'sale.items.product'])->findOrFail($id);

        return response()->json([
            'data' => $record,
        ]);
    }

    /**
     * Registrar un abono o pago a una cuenta por cobrar.
     */
    public function recordPayment(Request $request, RegisterReceivablePaymentAction $action): JsonResponse
    {
        $validated = $request->validate([
            'account_receivable_id' => ['required', 'exists:accounts_receivable,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:efectivo,tarjeta,transferencia,otro'],
            'reference_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'cash_shift_id' => ['nullable', 'exists:cash_shifts,id'],
        ]);

        $userId = $request->user()?->id ?? (User::first()?->id ?? 1);

        $payment = $action->execute($validated, $userId);

        return response()->json([
            'message' => 'Abono a cartera registrado con éxito.',
            'data' => $payment,
        ], 201);
    }
}
