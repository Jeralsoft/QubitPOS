<?php

namespace App\Services\DIAN;

use App\Models\PayrollSlip;
use DOMDocument;

class DianPayrollService
{
    /**
     * Calcula el CUNE oficial reglamentario DIAN para Nómina Electrónica (SHA-384).
     *
     * Fórmula oficial DIAN:
     * SHA384(NumNE + FecNE + HorNE + ValDev + ValDed + ValTol + NitNIE + DocEmp + TipoXML + SoftwarePin + TipoAmb)
     */
    public function calculateCune(
        string $consecutive,
        string $issueDate,
        string $issueTime,
        float $valDev,
        float $valDed,
        float $valTol,
        string $docEmp,
        string $nitNIE = '901456789',
        string $tipoXml = '102', // 102: Nómina Individual, 103: Ajuste
        string $softwarePin = '75319',
        int $tipoAmb = 1 // 1: Producción, 2: Pruebas
    ): string {
        $devStr = number_format($valDev, 2, '.', '');
        $dedStr = number_format($valDed, 2, '.', '');
        $tolStr = number_format($valTol, 2, '.', '');

        $raw = "{$consecutive}{$issueDate}{$issueTime}"
            . "{$devStr}{$dedStr}{$tolStr}"
            . "{$nitNIE}{$docEmp}{$tipoXml}{$softwarePin}{$tipoAmb}";

        return hash('sha384', $raw);
    }

    /**
     * Genera el documento XML UBL 2.1 oficial de Nómina Individual Electrónica DIAN.
     */
    public function generatePayrollXml(PayrollSlip $slip): string
    {
        $slip->loadMissing(['employee', 'period']);

        $issueDate = now()->toDateString();
        $issueTime = now()->format('H:i:s') . '-05:00';
        $valDev = (float) $slip->total_devengado;
        $valDed = (float) $slip->total_deducciones;
        $valTol = (float) $slip->net_paid;

        $cune = $slip->cune ?? $this->calculateCune(
            $slip->consecutive,
            $issueDate,
            $issueTime,
            $valDev,
            $valDed,
            $valTol,
            $slip->employee->document_number
        );

        $xml = new DOMDocument('1.0', 'UTF-8');
        $xml->formatOutput = true;

        $nomina = $xml->createElementNS('dian:gov:co:facturaelectronica:NominaIndividual', 'NominaIndividual');
        $nomina->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xs', 'http://www.w3.org/2001/XMLSchema');
        $nomina->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:ds', 'http://www.w3.org/2000/09/xmldsig#');
        $xml->appendChild($nomina);

        // Novedad y CUNE
        $nomina->appendChild($xml->createElement('Novedad', 'false'));
        $cuneNode = $xml->createElement('CUNE', $cune);
        $nomina->appendChild($cuneNode);
        $nomina->appendChild($xml->createElement('Consecutivo', $slip->consecutive));
        $nomina->appendChild($xml->createElement('FechaEmision', $issueDate));
        $nomina->appendChild($xml->createElement('HoraEmision', $issueTime));

        // Empleador
        $empleador = $xml->createElement('Empleador');
        $empleador->appendChild($xml->createElement('RazonSocial', 'QUBIT SOLUCIONES POS S.A.S.'));
        $empleador->appendChild($xml->createElement('NIT', '901456789'));
        $empleador->appendChild($xml->createElement('DV', '3'));
        $empleador->appendChild($xml->createElement('Pais', 'CO'));
        $empleador->appendChild($xml->createElement('DepartamentoEstado', '05')); // Antioquia
        $empleador->appendChild($xml->createElement('MunicipioCiudad', '05001')); // Medellín
        $empleador->appendChild($xml->createElement('Direccion', 'Calle 30 # 45-12, Local 3'));
        $nomina->appendChild($empleador);

        // Trabajador
        $trabajador = $xml->createElement('Trabajador');
        $trabajador->appendChild($xml->createElement('TipoTrabajador', '01')); // 01: Dependiente
        $trabajador->appendChild($xml->createElement('SubTipoTrabajador', '00'));
        $trabajador->appendChild($xml->createElement('TipoDocumento', $slip->employee->document_type === 'CC' ? '13' : '31'));
        $trabajador->appendChild($xml->createElement('NumeroDocumento', $slip->employee->document_number));
        $trabajador->appendChild($xml->createElement('PrimerApellido', $slip->employee->last_name));
        $trabajador->appendChild($xml->createElement('PrimerNombre', $slip->employee->first_name));
        $trabajador->appendChild($xml->createElement('Sueldo', number_format((float) $slip->base_salary, 2, '.', '')));
        $nomina->appendChild($trabajador);

        // Devengados
        $devengados = $xml->createElement('Devengados');
        $basico = $xml->createElement('Basico');
        $basico->appendChild($xml->createElement('DiasTrabajados', (string) $slip->worked_days));
        $basico->appendChild($xml->createElement('SueldoTrabajado', number_format((float) $slip->base_salary, 2, '.', '')));
        $devengados->appendChild($basico);

        if ((float) $slip->transport_allowance > 0) {
            $transporte = $xml->createElement('Transporte');
            $transporte->appendChild($xml->createElement('AuxilioTransporte', number_format((float) $slip->transport_allowance, 2, '.', '')));
            $devengados->appendChild($transporte);
        }

        if ((float) $slip->commissions > 0) {
            $devengados->appendChild($xml->createElement('Comision', number_format((float) $slip->commissions, 2, '.', '')));
        }
        $nomina->appendChild($devengados);

        // Deducciones
        $deducciones = $xml->createElement('Deducciones');
        $salud = $xml->createElement('Salud');
        $salud->appendChild($xml->createElement('Porcentaje', '4.00'));
        $salud->appendChild($xml->createElement('Deduccion', number_format((float) $slip->health_deduction, 2, '.', '')));
        $deducciones->appendChild($salud);

        $pension = $xml->createElement('FondoPension');
        $pension->appendChild($xml->createElement('Porcentaje', '4.00'));
        $pension->appendChild($xml->createElement('Deduccion', number_format((float) $slip->pension_deduction, 2, '.', '')));
        $deducciones->appendChild($pension);
        $nomina->appendChild($deducciones);

        // Totales Comprobante
        $nomina->appendChild($xml->createElement('DevengadosTotal', number_format($valDev, 2, '.', '')));
        $nomina->appendChild($xml->createElement('DeduccionesTotal', number_format($valDed, 2, '.', '')));
        $nomina->appendChild($xml->createElement('ComprobanteTotal', number_format($valTol, 2, '.', '')));

        return $xml->saveXML();
    }
}
