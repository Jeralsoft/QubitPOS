<?php

namespace App\Http\Controllers\Api\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Listado de clientes con filtros de búsqueda y estado.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('full_name', 'like', "%{$q}%")
                    ->orWhere('document_number', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $customers = $query->orderBy('full_name')->get();

        return response()->json([
            'data' => $customers,
        ]);
    }

    /**
     * Registrar un nuevo cliente.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_type' => ['nullable', 'string', 'max:10'],
            'document_number' => ['required', 'string', 'max:30', 'unique:customers,document_number'],
            'dv' => ['nullable', 'string', 'max:2'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'trade_name' => ['nullable', 'string', 'max:150'],
            'full_name' => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'customer_type' => ['nullable', 'string', 'max:30'],
            'fiscal_regime' => ['nullable', 'string', 'max:100'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'credit_days' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:activo,inactivo,bloqueado,moroso'],
            'notes' => ['nullable', 'string'],
        ]);

        $customer = Customer::create([
            ...$validated,
            'status' => $validated['status'] ?? 'activo',
            'credit_limit' => $validated['credit_limit'] ?? 0,
            'credit_days' => $validated['credit_days'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Cliente registrado exitosamente.',
            'data' => $customer,
        ], 201);
    }

    /**
     * Detalle del cliente con su historial y saldo de cartera.
     */
    public function show(int $id): JsonResponse
    {
        $customer = Customer::with(['sales', 'receivables'])->findOrFail($id);

        return response()->json([
            'data' => $customer,
        ]);
    }

    /**
     * Actualizar datos del cliente.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'document_type' => ['nullable', 'string', 'max:10'],
            'document_number' => ['required', 'string', 'max:30', "unique:customers,document_number,{$id}"],
            'dv' => ['nullable', 'string', 'max:2'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'trade_name' => ['nullable', 'string', 'max:150'],
            'full_name' => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'customer_type' => ['nullable', 'string', 'max:30'],
            'fiscal_regime' => ['nullable', 'string', 'max:100'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'credit_days' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:activo,inactivo,bloqueado,moroso'],
            'notes' => ['nullable', 'string'],
        ]);

        $customer->update($validated);

        return response()->json([
            'message' => 'Cliente actualizado exitosamente.',
            'data' => $customer,
        ]);
    }

    /**
     * Cambiar estado activo/inactivo del cliente.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);
        $customer->status = ($customer->status === 'activo') ? 'inactivo' : 'activo';
        $customer->save();

        return response()->json([
            'message' => "Estado de cliente cambiado a {$customer->status}.",
            'data' => $customer,
        ]);
    }

    /**
     * Eliminar un cliente.
     */
    public function destroy(int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'message' => 'Cliente eliminado exitosamente.',
        ]);
    }
}
