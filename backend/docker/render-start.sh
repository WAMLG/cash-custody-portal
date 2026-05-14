#!/usr/bin/env bash
set -e

: "${PORT:=10000}"

echo "Listen ${PORT}" > /etc/apache2/ports.conf
sed -i "s/__PORT__/${PORT}/g" /etc/apache2/sites-available/000-default.conf

php artisan config:clear --no-interaction
php artisan route:clear --no-interaction
php artisan view:clear --no-interaction

exec apache2-foreground
