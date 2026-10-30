<?php

namespace App\Http\Controllers\Api\Purchases;

use App\Actions\Purchases\RegisterPurchaseAction;
use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    /**
     * Lista de compras con eager loading para evitar N+1.
     */
    public function index(): JsonResponse
    {
        $purchases = Purchase::with(['supplier', 'items.product', 'user', 'accountPayable'])
            ->latest('id')
            ->paginate(20);

        return response()->json($purchases);
    }

    /**
     * Registra una compra a proveedor atómica con actualización de stock y costo promedio.
     */
    public function store(Request $request, RegisterPurchaseAction $action): JsonResponse
    {
        $validated = $request->validate([
            'invoice_number' => ['required', 'string', 'max:50'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'purchase_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'payment_method' => ['required', 'in:contado,credito'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.0001'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $userId = $request->user()?->id ?? (User::first()?->id ?? 1);

        $purchase = $action->execute($validated, $userId);

        return response()->json([
            'message' => 'Compra registrada con éxito. Inventario y costo promedio actualizados.',
            'data' => $purchase,
        ], 201);
    }

    /**
     * Detalle de una compra con sus líneas.
     */
    public function show(int $id): JsonResponse
    {
        $purchase = Purchase::with(['supplier', 'items.product', 'user', 'accountPayable'])
            ->findOrFail($id);

        return response()->json([
            'data' => $purchase,
        ]);
    }
}
