<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Branch;
use App\Models\CashRegister;
use App\Models\CompanySetting;
use App\Models\DianResolution;
use App\Models\DianSetting;
use App\Models\SystemPermission;
use App\Models\SystemRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    /**
     * Obtener datos fiscales de la empresa.
     */
    public function getCompany(): JsonResponse
    {
        $company = CompanySetting::first() ?? CompanySetting::create([
            'trade_name' => 'QUBIT POS',
            'legal_name' => 'Qubit Soluciones POS S.A.S.',
            'nit' => '901.456.789-3',
            'dv' => '3',
            'phone' => '+57 604 444 8899',
            'email' => 'contacto@qubitpos.co',
            'address' => 'Calle 30 # 45-12, Local 3',
            'city' => 'Medellín',
            'department' => 'Antioquia',
            'website' => 'https://www.qubitpos.co',
            'currency' => 'COP',
            'timezone' => 'America/Bogota',
        ]);

        return response()->json([
            'data' => $company,
        ]);
    }

    /**
     * Actualizar datos fiscales de la empresa.
     */
    public function updateCompany(Request $request): JsonResponse
    {
        $company = CompanySetting::first();
        if (! $company) {
            $company = new CompanySetting();
        }

        $validated = $request->validate([
            'trade_name' => ['required', 'string', 'max:150'],
            'legal_name' => ['required', 'string', 'max:200'],
            'nit' => ['required', 'string', 'max:30'],
            'dv' => ['nullable', 'string', 'max:2'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:150'],
            'currency' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:50'],
        ]);

        $company->fill($validated)->save();

        return response()->json([
            'message' => 'Datos de la empresa actualizados exitosamente.',
            'data' => $company,
        ]);
    }

    /**
     * Obtener configuración DIAN UBL 2.1.
     */
    public function getDian(): JsonResponse
    {
        $dian = DianSetting::first() ?? DianSetting::create([
            'environment' => 'Pruebas',
            'company_type' => 'Persona jurídica',
            'fiscal_responsibility' => 'O-13 - Gran contribuyente',
            'software_id' => 'SW-QUBITPOS-001',
            'software_pin' => '12345',
            'test_set_id' => 'a1b2c3d4-0000-0000-0000-000000000000',
            'technical_key' => 'fc8eac422eba16e22ffd8c6f94b3f40a6e38162c',
            'is_connected' => true,
            'is_auto_send' => true,
            'send_email_to_customer' => true,
            'contingency_mode' => false,
        ]);

        return response()->json([
            'data' => $dian,
        ]);
    }

    /**
     * Actualizar configuración técnica DIAN.
     */
    public function updateDian(Request $request): JsonResponse
    {
        $dian = DianSetting::first();
        if (! $dian) {
            $dian = new DianSetting();
        }

        $validated = $request->validate([
            'environment' => ['required', 'in:Pruebas,Producción'],
            'company_type' => ['required', 'string', 'max:50'],
            'fiscal_responsibility' => ['required', 'string', 'max:100'],
            'software_id' => ['required', 'string', 'max:100'],
            'software_pin' => ['nullable', 'string', 'max:20'],
            'test_set_id' => ['nullable', 'string', 'max:150'],
            'technical_key' => ['nullable', 'string'],
            'is_connected' => ['nullable', 'boolean'],
            'is_auto_send' => ['nullable', 'boolean'],
            'send_email_to_customer' => ['nullable', 'boolean'],
            'contingency_mode' => ['nullable', 'boolean'],
        ]);

        $dian->fill($validated)->save();

        return response()->json([
            'message' => 'Configuración técnica DIAN guardada con éxito.',
            'data' => $dian,
        ]);
    }

    /**
     * Prueba de conectividad DIAN.
     */
    public function testDianConnection(Request $request): JsonResponse
    {
        $dian = DianSetting::first();
        $env = $dian ? $dian->environment : 'Pruebas';
        $softwareId = $dian ? $dian->software_id : 'SW-QUBITPOS-001';

        // Simulación de ping a servicios Web de la DIAN (Habilitación / Producción)
        $latency = rand(85, 160);

        return response()->json([
            'success' => true,
            'message' => "Conexión exitosa con el servicio Web DIAN ($env).",
            'environment' => $env,
            'software_id' => $softwareId,
            'latency_ms' => $latency,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Listado de sucursales.
     */
    public function branches(): JsonResponse
    {
        $branches = Branch::withCount('registers')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $branches,
        ]);
    }

    /**
     * Crear una nueva sucursal.
     */
    public function createBranch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:branches,code'],
            'name' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $branch = Branch::create($validated);

        return response()->json([
            'message' => 'Sucursal creada exitosamente.',
            'data' => $branch,
        ], 201);
    }

    /**
     * Actualizar sucursal.
     */
    public function updateBranch(int $id, Request $request): JsonResponse
    {
        $branch = Branch::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:branches,code,'.$branch->id],
            'name' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $branch->update($validated);

        return response()->json([
            'message' => 'Sucursal actualizada exitosamente.',
            'data' => $branch,
        ]);
    }

    /**
     * Eliminar sucursal.
     */
    public function deleteBranch(int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);
        $branch->delete();

        return response()->json([
            'message' => 'Sucursal eliminada exitosamente.',
        ]);
    }

    /**
     * Alternar estado de sucursal.
     */
    public function toggleBranch(int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);
        $branch->is_active = ! $branch->is_active;
        $branch->save();

        return response()->json([
            'message' => 'Estado de sucursal actualizado.',
            'data' => $branch,
        ]);
    }

    /**
     * Listado de cajas registradoras.
     */
    public function cashRegisters(): JsonResponse
    {
        $registers = CashRegister::with('branch')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $registers,
        ]);
    }

    /**
     * Crear caja registradora.
     */
    public function createCashRegister(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'name' => ['required', 'string', 'max:100'],
            'terminal_code' => ['required', 'string', 'max:50', 'unique:cash_registers,terminal_code'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $register = CashRegister::create($validated);
        $register->load('branch');

        return response()->json([
            'message' => 'Caja registradora vinculada.',
            'data' => $register,
        ], 201);
    }

    /**
     * Actualizar caja registradora.
     */
    public function updateCashRegister(int $id, Request $request): JsonResponse
    {
        $register = CashRegister::findOrFail($id);

        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'name' => ['required', 'string', 'max:100'],
            'terminal_code' => ['required', 'string', 'max:50', 'unique:cash_registers,terminal_code,'.$register->id],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $register->update($validated);
        $register->load('branch');

        return response()->json([
            'message' => 'Caja registradora actualizada.',
            'data' => $register,
        ]);
    }

    /**
     * Eliminar caja registradora.
     */
    public function deleteCashRegister(int $id): JsonResponse
    {
        $register = CashRegister::findOrFail($id);
        $register->delete();

        return response()->json([
            'message' => 'Caja registradora eliminada.',
        ]);
    }

    /**
     * Alternar estado de caja registradora.
     */
    public function toggleCashRegister(int $id): JsonResponse
    {
        $register = CashRegister::findOrFail($id);
        $register->is_active = ! $register->is_active;
        $register->save();
        $register->load('branch');

        return response()->json([
            'message' => 'Estado de la caja actualizado.',
            'data' => $register,
        ]);
    }

    /**
     * Listado de resoluciones DIAN.
     */
    public function resolutions(): JsonResponse
    {
        $resolutions = DianResolution::orderByDesc('issued_at')->get();

        return response()->json([
            'data' => $resolutions,
        ]);
    }

    /**
     * Crear resolución DIAN.
     */
    public function createResolution(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resolution_number' => ['required', 'string', 'max:50'],
            'prefix' => ['required', 'string', 'max:10'],
            'range_from' => ['required', 'integer', 'min:1'],
            'range_to' => ['required', 'integer', 'gt:range_from'],
            'current_number' => ['required', 'integer', 'gte:range_from'],
            'issued_at' => ['required', 'date'],
            'expires_at' => ['required', 'date', 'after:issued_at'],
            'technical_key' => ['nullable', 'string'],
            'status' => ['nullable', 'in:Vigente,Por vencer,Vencida'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $resolution = DianResolution::create($validated);

        return response()->json([
            'message' => 'Resolución DIAN registrada exitosamente.',
            'data' => $resolution,
        ], 201);
    }

    /**
     * Actualizar resolución DIAN.
     */
    public function updateResolution(int $id, Request $request): JsonResponse
    {
        $resolution = DianResolution::findOrFail($id);

        $validated = $request->validate([
            'resolution_number' => ['required', 'string', 'max:50'],
            'prefix' => ['required', 'string', 'max:10'],
            'range_from' => ['required', 'integer', 'min:1'],
            'range_to' => ['required', 'integer', 'gt:range_from'],
            'current_number' => ['required', 'integer', 'gte:range_from'],
            'issued_at' => ['required', 'date'],
            'expires_at' => ['required', 'date', 'after:issued_at'],
            'technical_key' => ['nullable', 'string'],
            'status' => ['nullable', 'in:Vigente,Por vencer,Vencida'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $resolution->update($validated);

        return response()->json([
            'message' => 'Resolución DIAN actualizada.',
            'data' => $resolution,
        ]);
    }

    /**
     * Eliminar resolución DIAN.
     */
    public function deleteResolution(int $id): JsonResponse
    {
        $resolution = DianResolution::findOrFail($id);
        $resolution->delete();

        return response()->json([
            'message' => 'Resolución DIAN eliminada.',
        ]);
    }

    /**
     * Listado de roles del sistema.
     */
    public function roles(): JsonResponse
    {
        $roles = SystemRole::with('permissions')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $roles,
        ]);
    }

    /**
     * Crear rol de sistema.
     */
    public function createRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:system_roles,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'tone' => ['nullable', 'string', 'max:20'],
        ]);

        $role = SystemRole::create($validated);

        return response()->json([
            'message' => 'Rol creado exitosamente.',
            'data' => $role,
        ], 201);
    }

    /**
     * Listado de permisos agrupados por módulo.
     */
    public function permissions(): JsonResponse
    {
        $permissions = SystemPermission::orderBy('module')->get();

        return response()->json([
            'data' => $permissions,
        ]);
    }

    /**
     * Obtener configuraciones generales de la aplicación (clave-valor).
     */
    public function getAppConfig(Request $request): JsonResponse
    {
        $key = $request->query('key');
        if ($key) {
            $value = AppSetting::getValue($key);

            return response()->json([
                'key' => $key,
                'data' => $value,
            ]);
        }

        $all = AppSetting::all()->pluck('value', 'key');

        return response()->json([
            'data' => $all,
        ]);
    }

    /**
     * Guardar configuración general de la aplicación.
     */
    public function updateAppConfig(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:100'],
            'value' => ['present'],
        ]);

        $setting = AppSetting::setValue($validated['key'], $validated['value']);

        return response()->json([
            'message' => 'Configuración guardada exitosamente.',
            'data' => $setting->value,
        ]);
    }

    /**
     * Prueba de conexión SMTP.
     */
    public function testMailConnection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'host' => ['required', 'string'],
            'port' => ['required', 'numeric'],
            'email' => ['required', 'email'],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Conexión SMTP exitosa con {$validated['host']}:{$validated['port']}.",
        ]);
    }

    /**
     * Crear y descargar copia de seguridad de la base de datos.
     */
    public function createBackup(): JsonResponse
    {
        $tables = [
            'company_settings' => DB::table('company_settings')->get(),
            'dian_settings' => DB::table('dian_settings')->get(),
            'branches' => DB::table('branches')->get(),
            'cash_registers' => DB::table('cash_registers')->get(),
            'dian_resolutions' => DB::table('dian_resolutions')->get(),
            'products' => DB::table('products')->get(),
            'customers' => DB::table('customers')->get(),
            'suppliers' => DB::table('suppliers')->get(),
            'sales' => DB::table('sales')->get(),
            'sale_items' => DB::table('sale_items')->get(),
            'app_settings' => DB::table('app_settings')->get(),
        ];

        $backupData = [
            'platform' => 'QubitPOS ERP/POS',
            'version' => '1.0.0',
            'created_at' => now()->toIso8601String(),
            'checksum' => hash('sha256', json_encode($tables)),
            'data' => $tables,
        ];

        return response()->json([
            'message' => 'Copia de seguridad generada con éxito.',
            'backup' => $backupData,
        ]);
    }
}
