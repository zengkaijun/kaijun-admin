FROM php:8.4-cli

# swoole: Octane 应用服务器；pcntl: Octane 信号处理；pdo_mysql/mbstring/zip: Laravel 运行所需
# procps: Octane/Swoole 进程管理需要 pgrep
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev libonig-dev libssl-dev libbrotli-dev unzip git procps $PHPIZE_DEPS \
    && docker-php-ext-install pdo_mysql mbstring zip pcntl \
    && printf '\n' | pecl install swoole \
    && docker-php-ext-enable swoole \
    && apt-get purge -y --auto-remove $PHPIZE_DEPS \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8000"]
EXPOSE 8000
