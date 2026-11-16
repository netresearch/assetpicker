# syntax=docker/dockerfile:1
FROM php:8-fpm

# Take Composer from its official image instead of running the downloaded
# installer unverified.
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
