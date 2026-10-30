# Guía de Despliegue en Producción - QubitPOS

Este documento detalla la arquitectura, requerimientos y pasos para poner en marcha **QubitPOS** en servidores de producción (VPS, AWS, DigitalOcean o servidores locales en sede).

---

## 🏗️ Arquitectura de Producción

```
       [ Internet / Navegadores / Pistolas POS ]
                          │ (HTTPS :443 / :80)
                          ▼
            ┌───────────────────────────┐
            │   Nginx Reverse Proxy     │
            └─────────────┬─────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────┐            ┌──────────────────┐
│  Next.js 16      │            │  Laravel 11 API  │
│  Frontend (:3000)│◄──────────►│  Backend (:8000) │
└──────────────────┘            └─────────┬────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
              ┌──────────────────┐                ┌──────────────────┐
              │  PostgreSQL 16   │                │  Redis 7 Cache   │
              │  Base de Datos   │                │  & Job Queues    │
              └──────────────────┘                └──────────────────┘
```

---

## 📋 Requisitos Mínimos del Servidor

- **CPU:** 2 vCPU o superior.
- **Memoria RAM:** 4 GB mínimo (8 GB recomendado para alta concurrencia).
- **Disco:** 40 GB SSD con soporte de backups externos.
- **Sistema Operativo:** Ubuntu 22.04 LTS / Debian 12 o Windows Server 2022.
- **Software:** Docker Engine 24+ y Docker Compose v2.

---

## 🚀 Despliegue Rápido con Docker Compose

### 1. Clonar el repositorio y configurar variables de entorno
```bash
git clone https://github.com/tu-organizacion/QubitPOS.git /opt/qubitpos
cd /opt/qubitpos

# Configurar variables de producción
cp .env.example .env.production
```

### 2. Generar clave de aplicación Laravel
```bash
docker compose run --rm backend php artisan key:generate
```

### 3. Ejecutar migraciones y sembrado de catálogos iniciales
```bash
docker compose run --rm backend php artisan migrate --force
docker compose run --rm backend php artisan db:seed --force
```

### 4. Iniciar todos los contenedores en segundo plano
```bash
docker compose up -d --build
```

---

## 🔒 Parámetros DIAN para Facturación Electrónica en Producción

1. Ingresar al módulo de **Configuración $\rightarrow$ Datos DIAN**.
2. Cambiar el **Ambiente** a `Producción`.
3. Ingresar el **Software ID** y **Software PIN** asignados en el portal MUISCA de la DIAN.
4. Cargar la **Clave Técnica** oficial generada por la DIAN.
5. Adjuntar el certificado digital en formato `.p12` con su contraseña.

---

## 💾 Respaldo Automatizado de Base de Datos

El script [`scripts/backup_database.sh`](file:///C:/Proyectos/QubitPOS/scripts/backup_database.sh) está configurado para ejecutarse diariamente vía cron job:

```bash
# Editar crontab del servidor
crontab -e

# Ejecutar respaldo todos los días a las 02:00 AM
0 2 * * * /opt/qubitpos/scripts/backup_database.sh >> /var/log/qubitpos_backup.log 2>&1
```

Cada respaldo incluye su firma criptográfica **SHA-256** para auditoría fiscal y elimina automáticamente copias con más de 30 días de antigüedad.
