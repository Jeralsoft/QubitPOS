<?php

namespace App\Services\DIAN;

use App\Models\Sale;
use DOMDocument;

class DianUbl21Service
{
    /**
     * Calcula el CUFE oficial reglamentario DIAN según el Anexo Técnico 1.9 (SHA-384).
     *
     * Fórmula:
     * SHA384(NumFac + FecFac + HorFac + ValFac + CodImp1 + ValImp1 + CodImp2 + ValImp2 + CodImp3 + ValImp3 + ValTot + NitOFE + NumAdq + ClTec + TipoAmb)
     */
    public function calculateCufe(
        string $invoiceNumber,
        string $issueDate,
        string $issueTime,
        float $taxBase,
        float $taxAmount,
        float $total,
        string $customerTaxId,
        string $nitOFE = '901456789',
        string $technicalKey = 'claveTecnicaDian123',
        int $environment = 1
    ): string {
        $valFac = number_format($taxBase, 2, '.', '');
        $valImp1 = number_format($taxAmount, 2, '.', '');
        $valTot = number_format($total, 2, '.', '');

        $raw = "{$invoiceNumber}{$issueDate}{$issueTime}"
            . "{$valFac}"
            . "01{$valImp1}"
            . "040.00"
            . "030.00"
            . "{$valTot}"
            . "{$nitOFE}"
            . "{$customerTaxId}"
            . "{$technicalKey}"
            . "{$environment}";

        return hash('sha384', $raw);
    }

    /**
     * Calcula el CUDE oficial reglamentario DIAN para Notas Crédito, Débito y POS (SHA-384).
     *
     * Fórmula:
     * SHA384(NumDoc + FecDoc + HorDoc + ValDoc + CodImp1 + ValImp1 + CodImp2 + ValImp2 + CodImp3 + ValImp3 + ValTot + NitOFE + NumAdq + PinSoftware + TipoAmb)
     */
    public function calculateCude(
        string $docNumber,
        string $issueDate,
        string $issueTime,
        float $taxBase,
        float $taxAmount,
        float $total,
        string $customerTaxId,
        string $nitOFE = '901456789',
        string $pinSoftware = '75319',
        int $environment = 1
    ): string {
        $valDoc = number_format($taxBase, 2, '.', '');
        $valImp1 = number_format($taxAmount, 2, '.', '');
        $valTot = number_format($total, 2, '.', '');

        $raw = "{$docNumber}{$issueDate}{$issueTime}"
            . "{$valDoc}"
            . "01{$valImp1}"
            . "040.00"
            . "030.00"
            . "{$valTot}"
            . "{$nitOFE}"
            . "{$customerTaxId}"
            . "{$pinSoftware}"
            . "{$environment}";

        return hash('sha384', $raw);
    }

    /**
     * Genera el documento XML UBL 2.1 oficial de Factura Electrónica de Venta.
     */
    public function generateInvoiceXml(Sale $sale): string
    {
        $sale->loadMissing(['items.product', 'user']);

        $issueDate = $sale->created_at->format('Y-m-d');
        $issueTime = $sale->created_at->format('H:i:s') . '-05:00';
        $taxBase = number_format((float) $sale->tax_base, 2, '.', '');
        $taxAmount = number_format((float) $sale->tax_amount, 2, '.', '');
        $total = number_format((float) $sale->total, 2, '.', '');
        $subtotal = number_format((float) $sale->subtotal, 2, '.', '');
        $discount = number_format((float) $sale->discount, 2, '.', '');

        $cufe = $sale->cufe ?? $this->calculateCufe(
            $sale->invoice_number,
            $issueDate,
            $issueTime,
            (float) $sale->tax_base,
            (float) $sale->tax_amount,
            (float) $sale->total,
            $sale->customer_tax_id
        );

        $qr = $sale->qr_data ?? "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey={$cufe}";

        // Construir XML estructurado UBL 2.1
        $xml = new DOMDocument('1.0', 'UTF-8');
        $xml->formatOutput = true;

        $invoice = $xml->createElementNS('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', 'Invoice');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:ext', 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:sts', 'dian:gov:co:facturaelectronica:Structures-2-1');
        $xml->appendChild($invoice);

        // UBLExtensions (Firma XAdES-EPES y metadatos DIAN)
        $ublExtensions = $xml->createElement('ext:UBLExtensions');
        $extension1 = $xml->createElement('ext:UBLExtension');
        $extContent1 = $xml->createElement('ext:ExtensionContent');
        $dianExtensions = $xml->createElement('sts:DianExtensions');
        $invoiceControl = $xml->createElement('sts:InvoiceControl');
        $invoiceAuth = $xml->createElement('sts:InvoiceAuthorization', '18764000001234');
        $authPeriod = $xml->createElement('sts:AuthorizationPeriod');
        $authPeriod->appendChild($xml->createElement('cbc:StartDate', '2026-01-15'));
        $authPeriod->appendChild($xml->createElement('cbc:EndDate', '2027-01-15'));
        $invoiceControl->appendChild($invoiceAuth);
        $invoiceControl->appendChild($authPeriod);
        $dianExtensions->appendChild($invoiceControl);
        $extContent1->appendChild($dianExtensions);
        $extension1->appendChild($extContent1);
        $ublExtensions->appendChild($extension1);
        $invoice->appendChild($ublExtensions);

        // Cabecera UBL
        $invoice->appendChild($xml->createElement('cbc:UBLVersionID', 'UBL 2.1'));
        $invoice->appendChild($xml->createElement('cbc:CustomizationID', '10'));
        $invoice->appendChild($xml->createElement('cbc:ProfileID', 'DIAN 2.1'));
        $invoice->appendChild($xml->createElement('cbc:ID', $sale->invoice_number));

        $uuid = $xml->createElement('cbc:UUID', $cufe);
        $uuid->setAttribute('schemeID', '1');
        $uuid->setAttribute('schemeName', 'CUFE-SHA384');
        $invoice->appendChild($uuid);

        $invoice->appendChild($xml->createElement('cbc:IssueDate', $issueDate));
        $invoice->appendChild($xml->createElement('cbc:IssueTime', $issueTime));
        $invoice->appendChild($xml->createElement('cbc:InvoiceTypeCode', '01'));
        $invoice->appendChild($xml->createElement('cbc:DocumentCurrencyCode', 'COP'));

        // Emisor / Obligado a Facturar (OFE)
        $supplierParty = $xml->createElement('cac:AccountingSupplierParty');
        $party = $xml->createElement('cac:Party');
        $partyTaxScheme = $xml->createElement('cac:PartyTaxScheme');
        $partyTaxScheme->appendChild($xml->createElement('cbc:RegistrationName', 'QUBIT SOLUCIONES POS S.A.S.'));
        $companyID = $xml->createElement('cbc:CompanyID', '901456789');
        $companyID->setAttribute('schemeAgencyID', '195');
        $companyID->setAttribute('schemeAgencyName', 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)');
        $companyID->setAttribute('schemeID', '3'); // Dígito de verificación
        $companyID->setAttribute('schemeName', '31'); // NIT
        $partyTaxScheme->appendChild($companyID);
        $taxScheme = $xml->createElement('cac:TaxScheme');
        $taxScheme->appendChild($xml->createElement('cbc:ID', '01'));
        $taxScheme->appendChild($xml->createElement('cbc:Name', 'IVA'));
        $partyTaxScheme->appendChild($taxScheme);
        $party->appendChild($partyTaxScheme);
        $supplierParty->appendChild($party);
        $invoice->appendChild($supplierParty);

        // Adquiriente / Cliente
        $customerParty = $xml->createElement('cac:AccountingCustomerParty');
        $custParty = $xml->createElement('cac:Party');
        $custTaxScheme = $xml->createElement('cac:PartyTaxScheme');
        $custTaxScheme->appendChild($xml->createElement('cbc:RegistrationName', $sale->customer_name));
        $custCompanyID = $xml->createElement('cbc:CompanyID', $sale->customer_tax_id);
        $custCompanyID->setAttribute('schemeName', strlen($sale->customer_tax_id) > 10 ? '31' : '13'); // NIT o Cédula
        $custTaxScheme->appendChild($custCompanyID);
        $custTaxScheme->appendChild($taxScheme->cloneNode(true));
        $custParty->appendChild($custTaxScheme);
        $customerParty->appendChild($custParty);
        $invoice->appendChild($customerParty);

        // Medio de Pago
        $paymentMeans = $xml->createElement('cac:PaymentMeans');
        $paymentMeans->appendChild($xml->createElement('cbc:ID', '1'));
        $paymentCode = match ($sale->payment_method) {
            'tarjeta' => '48',
            'transferencia' => '47',
            default => '10',
        };
        $paymentMeans->appendChild($xml->createElement('cbc:PaymentMeansCode', $paymentCode));
        $paymentMeans->appendChild($xml->createElement('cbc:PaymentDueDate', $issueDate));
        $invoice->appendChild($paymentMeans);

        // Impuestos Globales (TaxTotal IVA 19%)
        $taxTotal = $xml->createElement('cac:TaxTotal');
        $taxAmountNode = $xml->createElement('cbc:TaxAmount', $taxAmount);
        $taxAmountNode->setAttribute('currencyID', 'COP');
        $taxTotal->appendChild($taxAmountNode);

        $taxSubtotal = $xml->createElement('cac:TaxSubtotal');
        $taxableAmountNode = $xml->createElement('cbc:TaxableAmount', $taxBase);
        $taxableAmountNode->setAttribute('currencyID', 'COP');
        $taxSubtotal->appendChild($taxableAmountNode);
        $subtaxAmount = $xml->createElement('cbc:TaxAmount', $taxAmount);
        $subtaxAmount->setAttribute('currencyID', 'COP');
        $taxSubtotal->appendChild($subtaxAmount);
        $taxCategory = $xml->createElement('cac:TaxCategory');
        $taxCategory->appendChild($xml->createElement('cbc:Percent', '19.00'));
        $taxCategory->appendChild($taxScheme->cloneNode(true));
        $taxSubtotal->appendChild($taxCategory);
        $taxTotal->appendChild($taxSubtotal);
        $invoice->appendChild($taxTotal);

        // Totales Monetarios
        $monetaryTotal = $xml->createElement('cac:LegalMonetaryTotal');
        $lineExt = $xml->createElement('cbc:LineExtensionAmount', $taxBase);
        $lineExt->setAttribute('currencyID', 'COP');
        $monetaryTotal->appendChild($lineExt);

        $taxExcl = $xml->createElement('cbc:TaxExclusiveAmount', $taxBase);
        $taxExcl->setAttribute('currencyID', 'COP');
        $monetaryTotal->appendChild($taxExcl);

        $taxIncl = $xml->createElement('cbc:TaxInclusiveAmount', $total);
        $taxIncl->setAttribute('currencyID', 'COP');
        $monetaryTotal->appendChild($taxIncl);

        $payable = $xml->createElement('cbc:PayableAmount', $total);
        $payable->setAttribute('currencyID', 'COP');
        $monetaryTotal->appendChild($payable);
        $invoice->appendChild($monetaryTotal);

        // Líneas de Factura (InvoiceLine)
        $lineIndex = 1;
        foreach ($sale->items as $item) {
            $invoiceLine = $xml->createElement('cac:InvoiceLine');
            $invoiceLine->appendChild($xml->createElement('cbc:ID', (string) $lineIndex));

            $itemQty = number_format((float) $item->quantity, 4, '.', '');
            $qtyNode = $xml->createElement('cbc:InvoicedQuantity', $itemQty);
            $qtyNode->setAttribute('unitCode', 'EA');
            $invoiceLine->appendChild($qtyNode);

            $lineAmount = number_format((float) ($item->unit_price * $item->quantity - $item->discount), 2, '.', '');
            $lineAmountNode = $xml->createElement('cbc:LineExtensionAmount', $lineAmount);
            $lineAmountNode->setAttribute('currencyID', 'COP');
            $invoiceLine->appendChild($lineAmountNode);

            $itemNode = $xml->createElement('cac:Item');
            $itemNode->appendChild($xml->createElement('cbc:Description', $item->product?->name ?? 'Artículo'));
            $sellersID = $xml->createElement('cac:SellersItemIdentification');
            $sellersID->appendChild($xml->createElement('cbc:ID', $item->product?->code ?? "PROD-{$item->product_id}"));
            $itemNode->appendChild($sellersID);
            $invoiceLine->appendChild($itemNode);

            $priceNode = $xml->createElement('cac:Price');
            $priceAmount = $xml->createElement('cbc:PriceAmount', number_format((float) $item->unit_price, 2, '.', ''));
            $priceAmount->setAttribute('currencyID', 'COP');
            $priceNode->appendChild($priceAmount);
            $priceNode->appendChild($xml->createElement('cbc:BaseQuantity', '1.0000'));
            $invoiceLine->appendChild($priceNode);

            $invoice->appendChild($invoiceLine);
            $lineIndex++;
        }

        return $xml->saveXML();
    }
}
