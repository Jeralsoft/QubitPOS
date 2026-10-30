<?php

namespace App\Http\Controllers\Api\POS;

use App\Http\Controllers\Controller;
use App\Http\Resources\POS\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Catálogo optimizado de productos con filtros por categoría, búsqueda y estado.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($request->has('active_only') && filter_var($request->query('active_only'), FILTER_VALIDATE_BOOLEAN)) {
            $query->where('is_active', true);
        }

        if ($request->filled('category') && $request->query('category') !== 'all') {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            if ($request->query('status') === 'activo') {
                $query->where('is_active', true);
            } elseif ($request->query('status') === 'inactivo') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('barcode', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%")
                    ->orWhere('category', 'like', "%{$q}%");
            });
        }

        $products = $query->orderBy('name')->get();

        return response()->json([
            'data' => $products,
        ]);
    }

    /**
     * Registrar un nuevo producto en catálogo.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:products,code'],
            'barcode' => ['required', 'string', 'max:50', 'unique:products,barcode'],
            'name' => ['required', 'string', 'max:200'],
            'category' => ['required', 'string', 'max:100'],
            'brand' => ['nullable', 'string', 'max:100'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'numeric', 'min:0'],
            'min_stock' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'color' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $product = Product::create([
            ...$validated,
            'stock' => $validated['stock'] ?? 0,
            'min_stock' => $validated['min_stock'] ?? 5,
            'tax_rate' => $validated['tax_rate'] ?? 0.19,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Producto registrado exitosamente.',
            'data' => $product,
        ], 201);
    }

    /**
     * Búsqueda instantánea por lector de código de barras o código interno.
     */
    public function show(string $barcode): ProductResource
    {
        $clean = trim($barcode);

        $product = Product::where('is_active', true)
            ->where(function ($q) use ($clean) {
                $q->where('barcode', $clean)
                    ->orWhere('code', $clean)
                    ->orWhere('id', $clean);
            })
            ->firstOrFail();

        return new ProductResource($product);
    }

    /**
     * Actualizar producto existente.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', "unique:products,code,{$id}"],
            'barcode' => ['required', 'string', 'max:50', "unique:products,barcode,{$id}"],
            'name' => ['required', 'string', 'max:200'],
            'category' => ['required', 'string', 'max:100'],
            'brand' => ['nullable', 'string', 'max:100'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'numeric', 'min:0'],
            'min_stock' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'color' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Producto actualizado exitosamente.',
            'data' => $product,
        ]);
    }

    /**
     * Alternar estado activo / inactivo de un producto.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->is_active = ! $product->is_active;
        $product->save();

        return response()->json([
            'message' => $product->is_active ? 'Producto activado.' : 'Producto desactivado.',
            'data' => $product,
        ]);
    }

    /**
     * Eliminar un producto si no tiene ventas asociadas.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        if ($product->saleItems()->count() > 0) {
            // Si tiene ventas registradas, desactivar en lugar de romper integridad referencial
            $product->update(['is_active' => false]);
            return response()->json([
                'message' => 'El producto tiene transacciones registradas. Se ha desactivado para proteger el historial.',
            ]);
        }

        $product->delete();

        return response()->json([
            'message' => 'Producto eliminado exitosamente.',
        ]);
    }
}
