<?php

namespace App\Http\Controllers\Api\POS;

use App\Actions\POS\OpenCashShiftAction;
use App\DTOs\POS\OpenShiftData;
use App\Http\Controllers\Controller;
use App\Http\Requests\POS\OpenShiftRequest;
use App\Http\Resources\POS\CashShiftResource;
use App\Models\CashShift;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashShiftController extends Controller
{
    /**
     * Consulta el turno de caja actualmente abierto.
     */
    public function current(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ?? (User::first()?->id ?? 1);

        $shift = CashShift::where('user_id', $userId)
            ->where('status', 'OPEN')
            ->latest('id')
            ->first();

        if (! $shift) {
            return response()->json([
                'isOpen' => false,
                'session' => null,
            ]);
        }

        return response()->json([
            'isOpen' => true,
            'session' => new CashShiftResource($shift),
        ]);
    }

    /**
     * Abre un nuevo turno de caja.
     */
    public function store(OpenShiftRequest $request, OpenCashShiftAction $action): JsonResponse
    {
        $userId = $request->user()?->id ?? (User::first()?->id ?? 1);

        $dto = OpenShiftData::fromRequest($request->validated(), $userId);
        $shift = $action->execute($dto);

        return (new CashShiftResource($shift))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Cierra el turno de caja con arqueo físico.
     */
    public function close(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'counted_cash' => ['required', 'numeric', 'min:0'],
        ]);

        $shift = CashShift::where('id', $id)->firstOrFail();

        // Calcular efectivo esperado = base inicial + ventas en efectivo
        $cashSales = $shift->sales()
            ->where('payment_method', 'efectivo')
            ->sum('total');

        $expected = (float) $shift->opening_balance + (float) $cashSales;
        $counted = (float) $validated['counted_cash'];
        $diff = round($counted - $expected, 2);

        $shift->update([
            'closing_balance_counted' => $counted,
            'closing_balance_expected' => $expected,
            'difference' => $diff,
            'status' => 'CLOSED',
            'closed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Turno de caja cerrado correctamente.',
            'session' => new CashShiftResource($shift),
        ]);
    }
}
