FROM php:8.3-fpm-alpine

# Instalar dependencias del sistema y extensiones requeridas para QubitPOS
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    linux-headers \
    curl \
    git \
    unzip \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        bcmath \
        intl \
        zip \
        opcache

# Instalar Composer oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar archivos de dependencias
COPY composer.json composer.lock ./

# Instalar dependencias PHP optimizadas para producción
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copiar el código fuente completo del backend
COPY . .

# Generar autoloader optimizado
RUN composer dump-autoload --optimize --no-dev

# Permisos para almacenamiento y caché
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
