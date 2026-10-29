<?php

namespace App\Http\Controllers\Api\POS;

use App\Actions\POS\RegisterSaleAction;
use App\DTOs\POS\SaleData;
use App\Http\Controllers\Controller;
use App\Http\Requests\POS\RegisterSaleRequest;
use App\Http\Resources\POS\SaleResource;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SaleController extends Controller
{
    /**
     * Lista de ventas con eager loading para evitar el problema N+1.
     */
    public function index(): AnonymousResourceCollection
    {
        $sales = Sale::with(['items.product', 'user', 'cashShift'])
            ->latest('id')
            ->paginate(25);

        return SaleResource::collection($sales);
    }

    /**
     * Registra una venta POS atómica a través de RegisterSaleAction.
     */
    public function store(RegisterSaleRequest $request, RegisterSaleAction $action): JsonResponse
    {
        // En un entorno de demostración o producción, obtener el ID del usuario autenticado
        $userId = $request->user()?->id ?? (User::first()?->id ?? 1);

        $dto = SaleData::fromRequest($request->validated(), $userId);
        $sale = $action->execute($dto);

        return (new SaleResource($sale))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Detalle de una factura o venta con sus líneas asociadas.
     */
    public function show(int $id): SaleResource
    {
        $sale = Sale::with(['items.product', 'user', 'cashShift'])->findOrFail($id);

        return new SaleResource($sale);
    }
}
