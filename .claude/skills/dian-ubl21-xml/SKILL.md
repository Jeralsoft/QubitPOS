---
name: dian-ubl21-xml
description: Estándares técnicos oficiales de la DIAN (Colombia) para generación de XML UBL 2.1, cálculo criptográfico SHA-384 de CUFE, CUDE y CUNE, código QR, firma XAdES-EPES (.p12) y consumo SOAP/REST en Laravel.
---

# DIAN UBL 2.1, Criptografía (CUFE/CUDE/CUNE) y Firma XAdES-EPES en Laravel

Esta skill define las reglas técnicas inquebrantables para emitir documentos electrónicos ante la DIAN en Colombia dentro de Qubit POS.

---

## 1. Formato Numérico y Zona Horaria Oficial
- **Decimales Estrictos:** En el XML y en las cadenas de hash (CUFE/CUDE/CUNE), TODOS los valores monetarios deben formatearse exactamente a **2 decimales con punto (`.`) como separador decimal y SIN separadores de miles** (`number_format($val, 2, '.', '')`, ej: `150000.00`).
- **Zona Horaria Colombia:** La hora de emisión (`IssueTime`) debe incluir siempre el offset de Colombia **`-05:00`** en formato `HH:MM:SS-05:00` (ej: `14:32:10-05:00`).

---

## 2. Fórmulas Oficiales de Hash (SHA-384)
Todos los códigos únicos en Colombia (CUFE, CUDE, CUNE) se calculan concatenando la cadena exacta sin espacios ni saltos de línea y aplicando **`hash('sha384', $cadena)`** en minúsculas:

### A. Cálculo del CUFE (Factura Electrónica de Venta - Tipo `01`)
```text
CUFE = SHA384(NumFac + FecFac + HorFac + ValFac + CodImp1 + ValImp1 + CodImp2 + ValImp2 + CodImp3 + ValImp3 + ValTot + NitOFE + NumAdq + ClTec + TipoAmb)
```
- `NumFac`: Número de factura con prefijo (ej: `SETP990000001`).
- `FecFac`: Fecha en formato `YYYY-MM-DD`.
- `HorFac`: Hora con zona horaria (ej: `14:32:10-05:00`).
- `ValFac`: Subtotal antes de tributos (`100000.00`).
- `CodImp1 / ValImp1`: `01` (IVA) + Valor del IVA (`19000.00`). Si no aplica: `01` + `0.00`.
- `CodImp2 / ValImp2`: `04` (INC) + Valor del INC (`0.00`). Si no aplica: `04` + `0.00`.
- `CodImp3 / ValImp3`: `03` (ICA) + Valor de ICA (`0.00`). Si no aplica: `03` + `0.00`.
- `ValTot`: Total de la factura (`119000.00`).
- `NitOFE`: NIT del Obligado a Facturar (sin dígito de verificación).
- `NumAdq`: Número de identificación del Adquiriente / Cliente (si es consumidor final genérico: `222222222222`).
- `ClTec`: Clave técnica autorizada por la DIAN en la resolución de numeración.
- `TipoAmb`: `1` (Producción) o `2` (Pruebas / Habilitación).

### B. Cálculo del CUDE (Notas Crédito `91`, Notas Débito `92`, POS Electrónico y Documento Soporte)
```text
CUDE = SHA384(NumDoc + FecDoc + HorDoc + ValDoc + CodImp1 + ValImp1 + CodImp2 + ValImp2 + CodImp3 + ValImp3 + ValTot + NitOFE + NumAdq + PinSoftware + TipoAmb)
```
*(Nota: Para CUDE se reemplaza la `Clave Técnica` por el `PIN del Software` registrado en la DIAN).*

### C. Cálculo del CUNE (Nómina Individual `102` y Ajuste `103`)
```text
CUNE = SHA384(NumNE + FecNE + HorNE + ValDev + ValDed + ValTol + NitNIE + DocEmp + TipoXML + SoftwarePin + TipoAmb)
```
- `ValDev`: Valor Total Devengado.
- `ValDed`: Valor Total Deducido.
- `ValTol`: Comprobante Total (Devengado - Deducido).
- `NitNIE`: NIT del Empleador sin dígito de verificación.
- `DocEmp`: Cédula / Documento del Empleado.
- `TipoXML`: `102` (Nómina individual) o `103` (Ajuste).

---

## 3. Código QR Reglamentario DIAN
Todo PDF y representación gráfica en tirilla térmica (58mm/80mm) debe incluir el código QR generado a partir del siguiente enlace oficial:

```text
https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey={CUFE_O_CUDE}
```

Para ambiente de pruebas / habilitación:
```text
https://catalogo-vpfe-hab.dian.gov.co/document/searchqr?documentkey={CUFE_O_CUDE}
```

---

## 4. Firma Digital XAdES-EPES (.p12 / .pfx)
- **Certificado Digital:** Certificado de firma electrónica para persona jurídica o natural expedido por entidad acreditada ONAC (GSE, Certicámara, Andes SCD).
- **Extracción de Llaves en PHP:**
  ```php
  openssl_pkcs12_read(file_get_contents($p12Path), $certs, $password);
  $privateKey = $certs['pkey'];
  $publicCert = $certs['cert'];
  ```
- **Firma del XML:** Inserción de la estructura `<ds:Signature>` bajo el nodo `<ext:UBLExtensions>` con política de firma DIAN `V3` (Algorithm `http://www.w3.org/2001/04/xmldsig-more#rsa-sha384` y Digest `http://www.w3.org/2001/04/xmlenc#sha384`).
- **Empaquetado en ZIP:** El XML firmado se comprime en formato `.zip` en memoria antes de la transmisión SOAP.

---

## 5. WebService SOAP DIAN
- **Endpoints Oficiales:**
  - **Habilitación / Pruebas:** `https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc?wsdl`
  - **Producción:** `https://vpfe.dian.gov.co/WcfDianCustomerServices.svc?wsdl`
- **Operaciones Principales:**
  - `SendBillAsync`: Envío asíncrono de lote de documentos electrónicos en ZIP con Base64.
  - `SendBillSync`: Envío síncrono individual (utilizado para POS Electrónico y eventos).
  - `GetStatusZip`: Consulta del estado de validación DIAN mediante el `TrackId` recibido en la respuesta.
- **AttachedDocument (Contenedor Electrónico):** Al ser aprobado por la DIAN, se genera el documento contenedor que fusiona el XML firmado emitido y el `ApplicationResponse` firmado por la DIAN para entrega al cliente.
