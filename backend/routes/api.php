<?php

use App\Http\Controllers\Api\Cartera\CarteraController;
use App\Http\Controllers\Api\Customers\CustomerController;
use App\Http\Controllers\Api\POS\CashShiftController;
use App\Http\Controllers\Api\POS\ProductController;
use App\Http\Controllers\Api\POS\SaleController;
use App\Http\Controllers\Api\Pricing\PriceController;
use App\Http\Controllers\Api\Purchases\PurchaseController;
use App\Http\Controllers\Api\Purchases\SupplierController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas API de Autenticación & Seguridad Sanctum (QubitPOS - Fase 9)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\Auth\AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [\App\Http\Controllers\Api\Auth\AuthController::class, 'me']);
        Route::post('/logout', [\App\Http\Controllers\Api\Auth\AuthController::class, 'logout']);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Rutas API de Punto de Venta (QubitPOS - Fase 1)
|--------------------------------------------------------------------------
*/
Route::prefix('pos')->group(function () {
    // 1. Catálogo e Inventario para Escáner y Grilla
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{barcode}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}/toggle-active', [ProductController::class, 'toggleActive']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // 2. Control de Turnos y Sesiones de Caja
    Route::get('/shifts/current', [CashShiftController::class, 'current']);
    Route::post('/shifts/open', [CashShiftController::class, 'store']);
    Route::post('/shifts/{id}/close', [CashShiftController::class, 'close']);

    // 3. Procesamiento Atómico de Ventas & DIAN UBL 2.1
    Route::get('/sales', [SaleController::class, 'index']);
    Route::get('/sales/{id}', [SaleController::class, 'show']);
    Route::get('/sales/{id}/xml', [SaleController::class, 'xml']);
    Route::get('/sales/{id}/dian-status', [SaleController::class, 'dianStatus']);
    Route::post('/sales', [SaleController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Gestión de Clientes (QubitPOS - Tríada de Maestros)
|--------------------------------------------------------------------------
*/
Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::post('/', [CustomerController::class, 'store']);
    Route::get('/{id}', [CustomerController::class, 'show']);
    Route::put('/{id}', [CustomerController::class, 'update']);
    Route::patch('/{id}/toggle-status', [CustomerController::class, 'toggleStatus']);
    Route::delete('/{id}', [CustomerController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Precios, Verificador y Promociones (QubitPOS - V. Precio)
|--------------------------------------------------------------------------
*/
Route::prefix('pricing')->group(function () {
    Route::get('/lists', [PriceController::class, 'lists']);
    Route::get('/check/{code}', [PriceController::class, 'check']);
    Route::post('/batch-update', [PriceController::class, 'batchUpdate']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Compras y Proveedores (QubitPOS - Fase 2)
|--------------------------------------------------------------------------
*/
Route::prefix('suppliers')->group(function () {
    Route::get('/', [SupplierController::class, 'index']);
    Route::post('/', [SupplierController::class, 'store']);
});

Route::prefix('purchases')->group(function () {
    Route::get('/', [PurchaseController::class, 'index']);
    Route::get('/{id}', [PurchaseController::class, 'show']);
    Route::post('/', [PurchaseController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Cartera y Cobros (QubitPOS - Fase 2)
|--------------------------------------------------------------------------
*/
Route::prefix('cartera')->group(function () {
    Route::get('/', [CarteraController::class, 'index']);
    Route::get('/{id}', [CarteraController::class, 'show']);
    Route::post('/payments', [CarteraController::class, 'recordPayment']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Contabilidad NIIF y Partida Doble (QubitPOS - Fase 5)
|--------------------------------------------------------------------------
*/
Route::prefix('contabilidad')->group(function () {
    Route::get('/entries', [\App\Http\Controllers\Api\Accounting\AccountingController::class, 'index']);
    Route::get('/entries/{id}', [\App\Http\Controllers\Api\Accounting\AccountingController::class, 'show']);
    Route::get('/puc', [\App\Http\Controllers\Api\Accounting\AccountingController::class, 'puc']);
    Route::get('/balance-prueba', [\App\Http\Controllers\Api\Accounting\AccountingController::class, 'trialBalance']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Nómina Electrónica & Liquidación Laboral (QubitPOS - Fase 4)
|--------------------------------------------------------------------------
*/
Route::prefix('nomina')->group(function () {
    Route::get('/periods', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'periods']);
    Route::post('/periods', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'createPeriod']);
    Route::post('/periods/{id}/liquidate', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'liquidate']);
    Route::get('/periods/{id}/slips', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'slips']);
    Route::get('/slips/{id}/xml', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'downloadSlipXml']);

    Route::get('/employees', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'employees']);
    Route::post('/employees', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'createEmployee']);

    Route::get('/novelties', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'novelties']);
    Route::post('/novelties', [\App\Http\Controllers\Api\Payroll\PayrollController::class, 'createNovelty']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Reportes, Analítica & Auditoría (QubitPOS - Fase 6)
|--------------------------------------------------------------------------
*/
Route::prefix('reports')->group(function () {
    Route::get('/summary', [\App\Http\Controllers\Api\Reports\ReportController::class, 'summary']);
    Route::get('/sales', [\App\Http\Controllers\Api\Reports\ReportController::class, 'sales']);
    Route::get('/inventory', [\App\Http\Controllers\Api\Reports\ReportController::class, 'inventory']);
    Route::get('/cash-audit', [\App\Http\Controllers\Api\Reports\ReportController::class, 'cashAudit']);
});

/*
|--------------------------------------------------------------------------
| Rutas API de Configuración Multiempresa, DIAN & Gobernanza (QubitPOS - Fase 7)
|--------------------------------------------------------------------------
*/
Route::prefix('settings')->group(function () {
    Route::get('/company', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'getCompany']);
    Route::post('/company', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'updateCompany']);

    Route::get('/dian', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'getDian']);
    Route::post('/dian', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'updateDian']);

    Route::get('/branches', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'branches']);
    Route::post('/branches', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'createBranch']);

    Route::get('/cash-registers', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'cashRegisters']);
    Route::post('/cash-registers', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'createCashRegister']);

    Route::get('/resolutions', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'resolutions']);
    Route::post('/resolutions', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'createResolution']);

    Route::get('/roles', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'roles']);
    Route::get('/permissions', [\App\Http\Controllers\Api\Settings\SettingsController::class, 'permissions']);
});
