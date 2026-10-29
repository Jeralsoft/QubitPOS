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
    }
}
