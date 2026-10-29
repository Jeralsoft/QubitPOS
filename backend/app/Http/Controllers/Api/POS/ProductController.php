<?php

namespace App\Http\Controllers\Api\POS;

use App\Http\Controllers\Controller;
use App\Http\Resources\POS\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Catálogo optimizado de productos vendibles para mostrador POS.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()
            ->where('is_active', true)
            ->select([
                'id',
                'code',
                'barcode',
                'name',
                'category',
                'brand',
                'purchase_price',
                'sale_price',
                'stock',
                'min_stock',
                'tax_rate',
                'color',
                'is_active',
            ]);

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('barcode', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            });
        }

        $products = $query->orderBy('name')->get();

        return ProductResource::collection($products);
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
                    ->orWhere('code', $clean);
            })
            ->firstOrFail();

        return new ProductResource($product);
    }
}
