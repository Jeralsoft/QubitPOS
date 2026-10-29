<?php

use App\Http\Controllers\Api\POS\CashShiftController;
use App\Http\Controllers\Api\POS\ProductController;
use App\Http\Controllers\Api\POS\SaleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Rutas API de Punto de Venta (QubitPOS)
|--------------------------------------------------------------------------
*/
Route::prefix('pos')->group(function () {
    // 1. Catálogo e Inventario para Escáner y Grilla
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{barcode}', [ProductController::class, 'show']);

    // 2. Control de Turnos y Sesiones de Caja
    Route::get('/shifts/current', [CashShiftController::class, 'current']);
    Route::post('/shifts/open', [CashShiftController::class, 'store']);
    Route::post('/shifts/{id}/close', [CashShiftController::class, 'close']);

    // 3. Procesamiento Atómico de Ventas
    Route::get('/sales', [SaleController::class, 'index']);
    Route::get('/sales/{id}', [SaleController::class, 'show']);
    Route::post('/sales', [SaleController::class, 'store']);
});
