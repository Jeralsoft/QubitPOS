# ==============================================================================
# Script de Respaldo Automatizado de Base de Datos PostgreSQL - QubitPOS (Windows)
# ==============================================================================

param (
    [string]$BackupDir = "C:\backups\qubitpos",
    [string]$DbName = "qubitpos",
    [string]$DbUser = "qubitpos",
    [string]$DbHost = "127.0.0.1",
    [string]$DbPort = "5432"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path -Path $BackupDir -ChildPath "qubitpos_backup_$timestamp.sql"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "=== Iniciando respaldo de QubitPOS: $DbName a las $(Get-Date) ===" -ForegroundColor Cyan

# Ejecutar pg_dump si está en el PATH
pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName -F p --no-owner --no-acl -f $backupFile

if (Test-Path $backupFile) {
    # Checksum de verificación
    $hash = Get-FileHash -Path $backupFile -Algorithm SHA256
    $hash.Hash | Out-File -FilePath "$backupFile.sha256" -Encoding UTF8
    Write-Host "✓ Respaldo completado: $backupFile" -ForegroundColor Green
    Write-Host "✓ SHA-256: $($hash.Hash)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error generando el respaldo." -ForegroundColor Red
}
