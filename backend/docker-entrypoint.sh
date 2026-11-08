#!/bin/sh
set -e

# 挂载卷后首次可能还没有 key；缺则生成，避免 Octane 启动后立刻因 MissingAppKey 退出
if [ -f .env ] && [ -f artisan ] && ! grep -qE '^APP_KEY=.+' .env; then
  if [ -f vendor/autoload.php ]; then
    php artisan key:generate --force --no-interaction || true
  fi
fi

exec "$@"
