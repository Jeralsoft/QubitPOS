---
name: erp-migracion
description: Crea o cambia tablas, funciones y triggers de PostgreSQL en QubitPOS siguiendo las convenciones del proyecto: versiones secuenciales bds/database_vN.sql, empresa_id, NUMERIC para dinero, claves foráneas compuestas por tenant, índices, únicos por empresa, campos de documento y tablas inmutables. Usar cada vez que se crea o modifica una tabla o función.
---

# Cambio de esquema en QubitPOS

## Antes
1. `Grep` el nombre de la tabla/columna/función en `bds/` — no duplicar.
2. Una versión ya aplicada (`bds/database_vN.sql`) **no se edita**: los cambios van en la siguiente versión `database_v(N+1).sql`, que se aplica sobre la anterior. Excepción: si la versión aún no se ha aplicado en ningún otro entorno que el local y el usuario lo aprueba.
3. Cada archivo: cabecera con propósito y contenido, todo dentro de `BEGIN; … COMMIT;`, idempotente donde sea razonable (`CREATE OR REPLACE FUNCTION`, `IF NOT EXISTS`).

## Plantilla — documento financiero
```sql
CREATE TABLE ventas (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id       BIGINT NOT NULL REFERENCES empresas (id),
  sucursal_id      BIGINT NOT NULL,
  turno_caja_id    BIGINT REFERENCES turnos_caja (id),
  cliente_id       BIGINT,                         -- NULL = consumidor final
  resolucion_id    BIGINT REFERENCES resoluciones_numeracion (id),
  prefijo          TEXT,
  numero           BIGINT,                         -- se asigna al aprobar
  fecha            TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado           TEXT NOT NULL DEFAULT 'BORRADOR'
                     CHECK (estado IN ('BORRADOR','PENDIENTE','APROBADO','PARCIAL','PAGADO','ANULADO','CANCELADO')),
  origen           TEXT NOT NULL DEFAULT 'POS' CHECK (origen IN ('POS','ADMIN','API','PEDIDO')),
  subtotal         NUMERIC(18,2) NOT NULL DEFAULT 0,
  descuento        NUMERIC(18,2) NOT NULL DEFAULT 0,
  impuestos        NUMERIC(18,2) NOT NULL DEFAULT 0,
  retenciones      NUMERIC(18,2) NOT NULL DEFAULT 0,
  propina          NUMERIC(18,2) NOT NULL DEFAULT 0,
  total            NUMERIC(18,2) NOT NULL DEFAULT 0,
  observaciones    TEXT,
  creado_por       BIGINT NOT NULL REFERENCES usuarios (id),
  aprobado_por     BIGINT REFERENCES usuarios (id),
  anulado_por      BIGINT REFERENCES usuarios (id),
  anulado_en       TIMESTAMPTZ,
  motivo_anulacion TEXT,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (sucursal_id, empresa_id) REFERENCES sucursales (id, empresa_id),
  UNIQUE (empresa_id, prefijo, numero),
  CHECK (estado <> 'ANULADO' OR (anulado_por IS NOT NULL AND motivo_anulacion IS NOT NULL))
);
CREATE INDEX ix_ventas_empresa_fecha ON ventas (empresa_id, fecha DESC);
CREATE INDEX ix_ventas_empresa_estado ON ventas (empresa_id, estado);
-- + triggers: fn_tocar_actualizado_en, fn_auditar, bloqueo de DELETE
```

## Reglas
- Nombres en español, plural, snake_case. PK `BIGINT GENERATED ALWAYS AS IDENTITY`.
- Dinero `NUMERIC(18,2)`; cantidades `NUMERIC(18,4)`; costos unitarios `NUMERIC(18,6)`; tarifas `NUMERIC(7,4)`. **Nunca `REAL`/`DOUBLE PRECISION`.**
- Toda tabla de negocio: `empresa_id` + índices que lo encabecen; únicos por empresa. Referencias a sucursal/bodega con FK compuesta `(x_id, empresa_id)` para impedir cruces entre tenants. Catálogos globales (DIVIPOLA, tipos de documento) sin `empresa_id`, documentado; `empresa_id NULL` = registro global del sistema.
- Financieros, kárdex, contables y auditoría: sin borrado (trigger con `fn_bloquear_modificacion`), FKs sin `ON DELETE CASCADE`. Maestros (productos, clientes): `activo` en lugar de borrar.
- Origen polimórfico: `documento_tipo TEXT` + `documento_id BIGINT` con índice.
- JSONB solo para datos no consultables o flexibles (auditoría, parámetros).
- `CHECK` para invariantes (cantidad > 0, rangos, estados); se valida igual en backend.
- Registrar triggers de auditoría (`fn_auditar`) en tablas de configuración y documentos.
- Semillas obligatorias en el mismo archivo de versión, idempotentes (`ON CONFLICT DO NOTHING`).

## Después
1. Aplicar en una base desechable: `psql -v ON_ERROR_STOP=1 -f bds/database_v1.sql … -f bds/database_vN.sql` sobre `qubitpos_test` recién creada, y luego sobre la base de desarrollo `qubitpos`.
2. Probar el comportamiento en una transacción con `ROLLBACK` (casos felices y de error).
3. Nunca borrar ni recrear una base con datos reales; destructivos solo con confirmación explícita del usuario.
4. Documentar en `docs/BASE_DATOS.md` (diccionario + diagrama Mermaid) y en `docs/CHANGELOG.md`.


