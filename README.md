# 凯俊后台

IT 产品经理个人工作台（本地开发）。栈：Docker Compose + Laravel 12 / Octane(Swoole) + MySQL 8.4 + Vite / React / Ant Design。

业务范围见 `docs/PRD.md`；技术约束见 `docs/技术方案.md`。

## 服务与端口

| 服务 | 说明 | 本机地址 |
|---|---|---|
| `db` | MySQL 8.4 | `127.0.0.1:3306` |
| `app` | Laravel Octane + Swoole | `127.0.0.1:8000` |
| `web` | Vite 前端（`/api` 代理到 app） | `127.0.0.1:5173` |

## 快速开始

```bash
# 1. 环境变量（口令勿提交）
cp .env.example .env
cp backend/.env.example backend/.env

# 2. 启动（app 镜像含 Swoole；日志应出现 Octane / Swoole）
docker compose up -d --build

# 3. 依赖与初始化（首次或换机后）
docker compose exec app composer install
docker compose exec app php artisan key:generate --force
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed

# 4. 确认 Swoole / Octane 已起来
docker compose logs app
```

若 `composer install` / `key:generate` 时 app 容器未在跑，可用一次性命令：

```bash
docker compose run --rm --no-deps --entrypoint sh app -c "composer install --no-interaction && php artisan key:generate --force"
docker compose up -d app
```

浏览器打开：http://127.0.0.1:5173  

默认管理员账号来自根目录 `.env` 的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`（示例占位为 `admin` / `change_me`）。

## 验收自检

1. `docker compose logs app` 可见 Octane / Swoole 启动日志  
2. 正确密码可登录；错误密码有提示  
3. 退出后访问 `/api/auth/me` 返回 **401**  
4. `git status` 不应出现 `.env`、`vendor/`、`node_modules/`

## 排障

- **Swoole 扩展编译失败**：把 `docker compose build app` 报错贴出；可临时把 `app` 的 `command` 改为 `php artisan serve --host=0.0.0.0 --port=8000` 仅用于排障登录。  
- **MySQL 8.4 异常**：可将 `docker-compose.yml` 中镜像改为 `mysql:8.0`。  
- 不用 Redis：Session 为 `database`，缓存为 `file`。

## 骨架依赖理由

| 依赖 | 理由 |
|---|---|
| `laravel/octane` | 官方 Octane + Swoole 应用服务器 |
| `antd` | 后台表单/布局组件 |
| `react-router-dom` | 登录页与占位首页路由 |

## 目录

```text
backend/     Laravel API（Octane）
frontend/    Vite + React + Ant Design
docs/        PRD / 技术方案 / 进度
```
