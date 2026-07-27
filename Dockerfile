# syntax=docker/dockerfile:1
FROM php:8-fpm

RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer
