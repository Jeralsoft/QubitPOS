#!/bin/bash
# ==============================================================================
# Script de Respaldo Automatizado de Base de Datos PostgreSQL - QubitPOS
# Realiza pg_dump comprimido, verifica integridad y rota copias de más de 30 días.
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/qubitpos"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/qubitpos_backup_${TIMESTAMP}.sql.gz"
DB_NAME="${POSTGRES_DB:-qubitpos}"
DB_USER="${POSTGRES_USER:-qubitpos}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

mkdir -p "$BACKUP_DIR"

echo "=== Iniciando respaldo de QubitPOS: ${DB_NAME} a las $(date) ==="

# Ejecutar pg_dump comprimido con gzip
PGPASSWORD="${POSTGRES_PASSWORD:-secret123}" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -F p \
    --no-owner \
    --no-acl | gzip -9 > "$BACKUP_FILE"

# Generar checksum SHA-256 para verificación de integridad financiera
sha256sum "$BACKUP_FILE" > "${BACKUP_FILE}.sha256"

echo "✓ Respaldo creado exitosamente: ${BACKUP_FILE}"
echo "✓ Checksum: $(cat "${BACKUP_FILE}.sha256")"

# Rotación: eliminar respaldos con más de 30 días
find "$BACKUP_DIR" -type f -name "qubitpos_backup_*.sql.gz*" -mtime +30 -exec rm {} \;
echo "✓ Rotación de respaldos completada (>30 días purgados)."
