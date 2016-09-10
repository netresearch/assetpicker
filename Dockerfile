FROM php:7-fpm

RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

RUN mkdir -p /etc/nginx/conf.d

RUN { \
        echo 'server {'; \
        echo '    listen 80;'; \
        echo '    index index.php index.html;'; \
        echo '    error_log  /var/log/nginx/error.log;'; \
        echo '    access_log /var/log/nginx/access.log;'; \
        echo '    root /var/www/html;'; \
        echo '    location ~ \.php$ {'; \
        echo '        try_files $uri =404;'; \
        echo '        fastcgi_split_path_info ^(.+\.php)(/.+)$;'; \
        echo '        fastcgi_pass php:9000;'; \
        echo '        fastcgi_index index.php;'; \
        echo '        include fastcgi_params;'; \
        echo '        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;'; \
        echo '        fastcgi_param PATH_INFO $fastcgi_path_info;'; \
        echo '    }'; \
        echo '}'; \
    } | tee /etc/nginx/conf.d/default.conf

VOLUME /etc/nginx/conf.d
