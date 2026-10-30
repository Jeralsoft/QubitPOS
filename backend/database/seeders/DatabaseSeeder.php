<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Usuario Cajero/Admin por defecto
        $user = User::updateOrCreate(
            ['email' => 'admin@qubitpos.co'],
            [
                'name' => 'Laura Martínez',
                'password' => Hash::make('qubitpos'),
            ]
        );

        // 2. Productos de Mostrador POS en Pesos Colombianos
        $products = [
            [
                'code' => 'BEB-0001',
                'barcode' => '7702001000012',
                'name' => 'Coca-Cola 600ml',
                'category' => 'Bebidas',
                'brand' => 'Coca-Cola',
                'purchase_price' => 2400.00,
                'sale_price' => 3500.00,
                'stock' => 148,
                'min_stock' => 40,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.62 0.19 27)',
            ],
            [
                'code' => 'PAN-0007',
                'barcode' => '7702001000029',
                'name' => 'Pan de caja tajado',
                'category' => 'Panadería',
                'brand' => 'Bimbo',
                'purchase_price' => 5000.00,
                'sale_price' => 7500.00,
                'stock' => 32,
                'min_stock' => 15,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.7 0.16 60)',
            ],
            [
                'code' => 'LAC-0014',
                'barcode' => '7702001000036',
                'name' => 'Leche entera 1L',
                'category' => 'Lácteos',
                'brand' => 'Alquería',
                'purchase_price' => 3200.00,
                'sale_price' => 4800.00,
                'stock' => 9,
                'min_stock' => 20,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.63 0.16 250)',
            ],
            [
                'code' => 'SNK-0021',
                'barcode' => '7702001000043',
                'name' => 'Galletas surtidas 300g',
                'category' => 'Snacks',
                'brand' => 'Noel',
                'purchase_price' => 2800.00,
                'sale_price' => 4200.00,
                'stock' => 74,
                'min_stock' => 25,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.6 0.2 320)',
            ],
            [
                'code' => 'ABA-0033',
                'barcode' => '7702001000050',
                'name' => 'Café molido 250g',
                'category' => 'Abarrotes',
                'brand' => 'Juan Valdez',
                'purchase_price' => 14000.00,
                'sale_price' => 21500.00,
                'stock' => 41,
                'min_stock' => 12,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.65 0.17 145)',
            ],
            [
                'code' => 'LIM-0040',
                'barcode' => '7702001000067',
                'name' => 'Detergente líquido 1L',
                'category' => 'Limpieza',
                'brand' => 'LimpiaFácil',
                'purchase_price' => 8500.00,
                'sale_price' => 13900.00,
                'stock' => 0,
                'min_stock' => 10,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.66 0.15 190)',
            ],
            [
                'code' => 'BEB-0002',
                'barcode' => '7702001000074',
                'name' => 'Agua cristalina 1.5L',
                'category' => 'Bebidas',
                'brand' => 'Cristal',
                'purchase_price' => 1800.00,
                'sale_price' => 3000.00,
                'stock' => 210,
                'min_stock' => 50,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.62 0.19 27)',
            ],
            [
                'code' => 'LAC-0015',
                'barcode' => '7702001000081',
                'name' => 'Yogur melocotón 1L',
                'category' => 'Lácteos',
                'brand' => 'Colanta',
                'purchase_price' => 4500.00,
                'sale_price' => 6800.00,
                'stock' => 17,
                'min_stock' => 18,
                'tax_rate' => 0.1900,
                'color' => 'oklch(0.63 0.16 250)',
            ],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['barcode' => $p['barcode']], $p);
        }

        // 3. Turno de caja abierto inicial para mostrador POS
        \App\Models\CashShift::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'OPEN'],
            [
                'register_name' => 'Caja #001',
                'branch_name' => 'Sede Principal',
                'opening_balance' => 350000.00,
                'opened_at' => now(),
            ]
        );

        // 4. Proveedores Iniciales (Fase 2)
        $suppliers = [
            [
                'name' => 'Distribuidora Andina S.A.S.',
                'tax_id' => '901458321-4',
                'phone' => '601 246 8135',
                'email' => 'ventas@andina.com.co',
                'address' => 'Zona Industrial Belén, Bodega 4',
                'city' => 'Medellín',
                'contact_name' => 'Felipe Restrepo',
                'status' => 'activo',
                'credit_days' => 30,
                'credit_limit' => 15000000.00,
            ],
            [
                'name' => 'Comercializadora Nacional S.A.',
                'tax_id' => '800123456-1',
                'phone' => '601 555 1234',
                'email' => 'contacto@comercializadoranacional.co',
                'address' => 'Autopista Norte Km 19',
                'city' => 'Bogotá',
                'contact_name' => 'Gloria Esperanza Gómez',
                'status' => 'activo',
                'credit_days' => 45,
                'credit_limit' => 20000000.00,
            ],
            [
                'name' => 'Lácteos y Derivados del Valle',
                'tax_id' => '900987654-2',
                'phone' => '602 333 4455',
                'email' => 'pedidos@lacteosvalle.com',
                'address' => 'Carrera 1ra # 45-20',
                'city' => 'Cali',
                'contact_name' => 'Mauricio Henao',
                'status' => 'activo',
                'credit_days' => 15,
                'credit_limit' => 8000000.00,
            ],
        ];

        foreach ($suppliers as $s) {
            \App\Models\Supplier::updateOrCreate(['tax_id' => $s['tax_id']], $s);
        }

        // 5. Cuentas por Cobrar Iniciales (Cartera de Clientes - Fase 2)
        $receivables = [
            [
                'customer_name' => 'María Camila Rodríguez',
                'customer_tax_id' => '1020345678',
                'customer_phone' => '310 123 4567',
                'initial_amount' => 450000.00,
                'current_balance' => 250000.00,
                'due_date' => now()->addDays(12)->toDateString(),
                'status' => 'PARTIAL',
                'notes' => 'Crédito a 30 días - Venta de mostrador autorizada',
            ],
            [
                'customer_name' => 'Distribuidora Andina S.A.S.',
                'customer_tax_id' => '901458321-4',
                'customer_phone' => '601 246 8135',
                'initial_amount' => 1200000.00,
                'current_balance' => 1200000.00,
                'due_date' => now()->addDays(20)->toDateString(),
                'status' => 'PENDING',
                'notes' => 'Factura crédito por pedido mayorista',
            ],
            [
                'customer_name' => 'Carlos Andrés Ramírez',
                'customer_tax_id' => '79845123',
                'customer_phone' => '315 876 5432',
                'initial_amount' => 180000.00,
                'current_balance' => 180000.00,
                'due_date' => now()->subDays(5)->toDateString(),
                'status' => 'PENDING',
                'notes' => 'Factura con 5 días de mora',
            ],
        ];

        foreach ($receivables as $r) {
            \App\Models\AccountReceivable::firstOrCreate(['customer_tax_id' => $r['customer_tax_id'], 'initial_amount' => $r['initial_amount']], $r);
        }

        // 6. Plan Único de Cuentas (PUC Colombia - NIIF - Fase 5)
        $pucAccounts = [
            ['code' => '110505', 'name' => 'Caja General', 'nature' => 'D', 'type' => 'ACTIVO', 'level' => 6],
            ['code' => '111005', 'name' => 'Bancos Nacionales', 'nature' => 'D', 'type' => 'ACTIVO', 'level' => 6],
            ['code' => '130505', 'name' => 'Clientes Nacionales', 'nature' => 'D', 'type' => 'ACTIVO', 'level' => 6],
            ['code' => '143501', 'name' => 'Inventario de Mercancías', 'nature' => 'D', 'type' => 'ACTIVO', 'level' => 6],
            ['code' => '220505', 'name' => 'Proveedores Nacionales', 'nature' => 'C', 'type' => 'PASIVO', 'level' => 6],
            ['code' => '240801', 'name' => 'Impuesto a las ventas (IVA) por pagar', 'nature' => 'C', 'type' => 'PASIVO', 'level' => 6],
            ['code' => '240802', 'name' => 'IVA Descontable en Compras', 'nature' => 'D', 'type' => 'PASIVO', 'level' => 6],
            ['code' => '413501', 'name' => 'Comercio al por mayor y al por menor', 'nature' => 'C', 'type' => 'INGRESO', 'level' => 6],
            ['code' => '510506', 'name' => 'Sueldos y Salarios', 'nature' => 'D', 'type' => 'GASTO', 'level' => 6],
            ['code' => '613501', 'name' => 'Costo de Ventas - Comercio', 'nature' => 'D', 'type' => 'COSTO', 'level' => 6],
        ];

        foreach ($pucAccounts as $acc) {
            \App\Models\AccountingAccount::updateOrCreate(['code' => $acc['code']], $acc);
        }

        // 7. Empleados y Personal (CST Colombia - Fase 4)
        $employees = [
            [
                'code' => 'EMP-001',
                'first_name' => 'Laura',
                'last_name' => 'Martínez',
                'document_type' => 'CC',
                'document_number' => '1032456789',
                'role' => 'Vendedora',
                'department' => 'Ventas',
                'branch' => 'Sede Principal',
                'contract_type' => 'indefinido',
                'start_date' => '2022-02-15',
                'base_salary' => 2100000.00,
                'has_transport_allowance' => true,
                'status' => 'activo',
                'eps' => 'Sura EPS',
                'pension_fund' => 'Porvenir',
                'arl' => 'Sura ARL',
                'bank_name' => 'Bancolombia',
                'account_number' => '•••• 4582',
            ],
            [
                'code' => 'EMP-002',
                'first_name' => 'Carlos',
                'last_name' => 'Ramírez',
                'document_type' => 'CC',
                'document_number' => '79456123',
                'role' => 'Administrador',
                'department' => 'Administración',
                'branch' => 'Sede Norte',
                'contract_type' => 'indefinido',
                'start_date' => '2021-06-08',
                'base_salary' => 3800000.00,
                'has_transport_allowance' => false,
                'status' => 'activo',
                'eps' => 'Sanitas EPS',
                'pension_fund' => 'Colpensiones',
                'arl' => 'Sura ARL',
                'bank_name' => 'Davivienda',
                'account_number' => '•••• 1098',
            ],
            [
                'code' => 'EMP-003',
                'first_name' => 'Sofía',
                'last_name' => 'Navarro',
                'document_type' => 'CC',
                'document_number' => '1019876543',
                'role' => 'Cocinera',
                'department' => 'Cocina',
                'branch' => 'Sede Principal',
                'contract_type' => 'fijo',
                'start_date' => '2023-08-22',
                'base_salary' => 1650000.00,
                'has_transport_allowance' => true,
                'status' => 'activo',
                'eps' => 'Nueva EPS',
                'pension_fund' => 'Protección',
                'arl' => 'Colmena ARL',
                'bank_name' => 'Nequi',
                'account_number' => '•••• 7712',
            ],
        ];

        foreach ($employees as $e) {
            \App\Models\Employee::updateOrCreate(['document_number' => $e['document_number']], $e);
        }

        // 8. Periodo de Nómina Inicial
        \App\Models\PayrollPeriod::firstOrCreate(
            ['name' => 'Nómina Mensual Octubre 2026'],
            [
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-31',
                'period_type' => 'mensual',
                'status' => 'DRAFT',
            ]
        );

        // 9. Configuración de Empresa (Fase 7)
        \App\Models\CompanySetting::firstOrCreate(
            ['nit' => '901.456.789-3'],
            [
                'trade_name' => 'QUBIT POS',
                'legal_name' => 'Qubit Soluciones POS S.A.S.',
                'dv' => '3',
                'phone' => '+57 604 444 8899',
                'email' => 'contacto@qubitpos.co',
                'address' => 'Calle 30 # 45-12, Local 3',
                'city' => 'Medellín',
                'department' => 'Antioquia',
                'website' => 'https://www.qubitpos.co',
                'currency' => 'COP',
                'timezone' => 'America/Bogota',
            ]
        );

        // 10. Configuración DIAN
        \App\Models\DianSetting::firstOrCreate(
            ['software_id' => 'SW-QUBITPOS-001'],
            [
                'environment' => 'Pruebas',
                'company_type' => 'Persona jurídica',
                'fiscal_responsibility' => 'O-13 - Gran contribuyente',
                'software_pin' => '12345',
                'test_set_id' => 'a1b2c3d4-0000-0000-0000-000000000000',
                'technical_key' => 'fc8eac422eba16e22ffd8c6f94b3f40a6e38162c',
                'is_connected' => true,
                'is_auto_send' => true,
                'send_email_to_customer' => true,
                'contingency_mode' => false,
            ]
        );

        // 11. Sucursales & Cajas
        $branchMain = \App\Models\Branch::firstOrCreate(
            ['code' => 'SP-001'],
            [
                'name' => 'Sede Principal',
                'address' => 'Calle 30 # 45-12, Medellín',
                'phone' => '+57 604 444 8899',
                'city' => 'Medellín',
                'department' => 'Antioquia',
                'is_active' => true,
            ]
        );

        \App\Models\Branch::firstOrCreate(
            ['code' => 'SN-002'],
            [
                'name' => 'Sucursal Norte',
                'address' => 'Cra 52 # 80-30, Bello',
                'phone' => '+57 604 555 1122',
                'city' => 'Bello',
                'department' => 'Antioquia',
                'is_active' => true,
            ]
        );

        \App\Models\CashRegister::firstOrCreate(
            ['terminal_code' => 'POS-A1'],
            [
                'branch_id' => $branchMain->id,
                'name' => 'Caja 1 Principal',
                'is_active' => true,
            ]
        );

        // 12. Resoluciones DIAN
        \App\Models\DianResolution::firstOrCreate(
            ['resolution_number' => '18764000123456'],
            [
                'prefix' => 'SETP',
                'range_from' => 1,
                'range_to' => 50000,
                'current_number' => 102,
                'issued_at' => '2026-01-15',
                'expires_at' => '2028-01-15',
                'status' => 'Vigente',
                'is_active' => true,
            ]
        );

        // 13. Roles y Permisos de Gobernanza
        $adminRole = \App\Models\SystemRole::firstOrCreate(
            ['name' => 'Administrador'],
            ['description' => 'Acceso total y configuración del sistema', 'tone' => 'primary']
        );

        \App\Models\SystemRole::firstOrCreate(
            ['name' => 'Cajero'],
            ['description' => 'Apertura de caja, ventas POS y cierre ciego', 'tone' => 'success']
        );

        \App\Models\SystemRole::firstOrCreate(
            ['name' => 'Contador'],
            ['description' => 'Libros contables, PUC, balances y nómina', 'tone' => 'warning']
        );

        $permPOS = \App\Models\SystemPermission::firstOrCreate(
            ['code' => 'pos.sales.create'],
            ['name' => 'Registrar ventas en caja', 'module' => 'Ventas']
        );
        $permReports = \App\Models\SystemPermission::firstOrCreate(
            ['code' => 'reports.financial.view'],
            ['name' => 'Ver reportes financieros y márgenes', 'module' => 'Reportes']
        );

        $adminRole->permissions()->syncWithoutDetaching([$permPOS->id, $permReports->id]);
    }
}
