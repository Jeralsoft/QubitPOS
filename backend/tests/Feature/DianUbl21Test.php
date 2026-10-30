<?php

namespace Tests\Feature;

use App\Models\CashShift;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Services\DIAN\DianUbl21Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DianUbl21Test extends TestCase
{
    use RefreshDatabase;

    public function test_calculates_official_cufe_sha384(): void
    {
        $dianService = new DianUbl21Service();

        $cufe = $dianService->calculateCufe(
            invoiceNumber: 'SETP-000001',
            issueDate: '2026-10-30',
            issueTime: '10:30:00-05:00',
            taxBase: 100000.00,
            taxAmount: 19000.00,
            total: 119000.00,
            customerTaxId: '1020345678'
        );

        $this->assertEquals(96, strlen($cufe));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{96}$/', $cufe);
    }

    public function test_generates_valid_ubl21_xml_structure(): void
    {
        $user = User::factory()->create();
        $shift = CashShift::create([
            'user_id' => $user->id,
            'register_name' => 'Caja #001',
            'branch_name' => 'Sede Principal',
            'opening_balance' => 300000.00,
            'status' => 'OPEN',
        ]);

        $product = Product::create([
            'code' => 'BEB-0001',
            'barcode' => '7702001000012',
            'name' => 'Coca-Cola 600ml',
            'category' => 'Bebidas',
            'purchase_price' => 2400.00,
            'sale_price' => 3500.00,
            'stock' => 10,
            'min_stock' => 2,
            'tax_rate' => 0.1900,
        ]);

        $sale = Sale::create([
            'invoice_prefix' => 'SETP',
            'invoice_number' => 'SETP-000001',
            'user_id' => $user->id,
            'cash_shift_id' => $shift->id,
            'customer_name' => 'María Camila Rodríguez',
            'customer_tax_id' => '1020345678',
            'payment_method' => 'efectivo',
            'subtotal' => 7000.00,
            'discount' => 0.00,
            'tax_base' => 7000.00,
            'tax_amount' => 1330.00,
            'total' => 8330.00,
            'cufe' => 'a78b571a49bf4ec1265c23d1fa20679ae3e718904ea052bf56e1ffbfe43ad25a03222bfd1dbb3a1da3ec2b6f74bc6c9f',
            'status' => 'COMPLETED',
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 3500.00,
            'discount' => 0,
            'tax_rate' => 0.19,
            'tax_amount' => 1330.00,
            'total' => 8330.00,
        ]);

        $dianService = new DianUbl21Service();
        $xml = $dianService->generateInvoiceXml($sale);

        $this->assertStringContainsString('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', $xml);
        $this->assertStringContainsString('<cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>', $xml);
        $this->assertStringContainsString('<cbc:ProfileID>DIAN 2.1</cbc:ProfileID>', $xml);
        $this->assertStringContainsString('schemeName="CUFE-SHA384"', $xml);
        $this->assertStringContainsString('QUBIT SOLUCIONES POS S.A.S.', $xml);
        $this->assertStringContainsString('María Camila Rodríguez', $xml);
        $this->assertStringContainsString('Coca-Cola 600ml', $xml);
    }

    public function test_can_download_invoice_xml_via_api(): void
    {
        $user = User::factory()->create();
        $shift = CashShift::create([
            'user_id' => $user->id,
            'register_name' => 'Caja #001',
            'branch_name' => 'Sede Principal',
            'opening_balance' => 300000.00,
            'status' => 'OPEN',
        ]);

        $sale = Sale::create([
            'invoice_prefix' => 'SETP',
            'invoice_number' => 'SETP-000002',
            'user_id' => $user->id,
            'cash_shift_id' => $shift->id,
            'customer_name' => 'Consumidor Final',
            'customer_tax_id' => '222222222222',
            'payment_method' => 'efectivo',
            'subtotal' => 10000.00,
            'discount' => 0.00,
            'tax_base' => 10000.00,
            'tax_amount' => 1900.00,
            'total' => 11900.00,
            'cufe' => 'b89c682b50cf5fd2376d34e2fa31780bf4f829015fb163cf67f200c0f54be36b14333c0e2ecc4b2eb4fd3c7085cd7d0a',
            'status' => 'COMPLETED',
        ]);

        $response = $this->get("/api/pos/sales/{$sale->id}/xml");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2');
    }

    public function test_can_query_dian_status_via_api(): void
    {
        $user = User::factory()->create();
        $shift = CashShift::create([
            'user_id' => $user->id,
            'register_name' => 'Caja #001',
            'branch_name' => 'Sede Principal',
            'opening_balance' => 300000.00,
            'status' => 'OPEN',
        ]);

        $sale = Sale::create([
            'invoice_prefix' => 'SETP',
            'invoice_number' => 'SETP-000003',
            'user_id' => $user->id,
            'cash_shift_id' => $shift->id,
            'customer_name' => 'Consumidor Final',
            'customer_tax_id' => '222222222222',
            'payment_method' => 'efectivo',
            'subtotal' => 10000.00,
            'discount' => 0.00,
            'tax_base' => 10000.00,
            'tax_amount' => 1900.00,
            'total' => 11900.00,
            'cufe' => 'c90d793c61df6ge3487e45f3fa42891cg5g930126gc274dg78g311d0g65cf47c25444d1f3fdd5c3fc5ge4d8196de8e1b',
            'status' => 'COMPLETED',
        ]);

        $response = $this->getJson("/api/pos/sales/{$sale->id}/dian-status");

        $response->assertStatus(200)
            ->assertJsonPath('dianStatus', 'aceptado')
            ->assertJsonPath('statusCode', '00');
    }
}
