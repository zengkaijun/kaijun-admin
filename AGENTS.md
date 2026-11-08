# AGENTS.md

## 项目简介

凯俊后台：IT 产品经理个人工作台（以项目为主线：阶段/成交/跟进循环、工时、调研、话术）。范围以 `docs/PRD.md` 为准。

## 技术栈

- 编排：Docker Desktop + Compose（db / app / web）
- 后端：PHP 8.4 + Laravel 12 API
- 应用服务器：**Laravel Octane + Swoole**（`octane:start --server=swoole`；失败降级 `artisan serve` 仅限排障）
- 数据库：MySQL 8.4（异常时改 `mysql:8.0`）；**不用 Redis**
- 前端：Vite + React + Ant Design，经 Vite 代理访问 `/api`
- 本地开发只绑定 127.0.0.1；代码经 GitHub 多机同步

## 常用命令

```bash
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose logs app          # 确认 Octane/Swoole 已启动
# 前端：容器 web 内 npm run dev（见 README）
```

## 目录结构

```
backend/        # Laravel API
frontend/       # Vite React
docs/           # PRD、技术方案、进度、文件地图、db-comments.sql
docker-compose.yml
.cursor/        # Cursor 规则
```

## 页面 / 接口对应文件

写改动范围前先查 **`docs/文件地图.md`**（浏览器地址 → 前端文件；接口 URL → 控制器）。小调整只改地图中点名的文件，禁止顺手重构无关文件。

## 代码约定

- 动手前先读 AGENTS.md 与 `docs/` 下相关文档
- 禁止硬编码密钥 / 口令；`.env` 不进 git
- 新增依赖（composer/npm/镜像）必须给一句理由
- 命名清晰优先于简短；只写「为什么」的注释
- 不留调试残渣；错误不吞
- 跟进历史只增不删；状态流转按技术方案状态机
- **数据库注释**：新建/修改表时，迁移里必须用 `->comment('中文说明')` 标注表名与每个字段（Navicat/DBA 可读）；已有表补注释可另出一次性 SQL，不重跑业务迁移

## 禁止事项

- 不许绕过流程修改 `docs/PRD.md`（变更走产品经理流程）
- 不许引入技术方案之外的框架（如无必要不用 Slim/原生 PDO 替换 Laravel）
- 不许提交调试残渣、`.env`、`vendor/`、`node_modules/`
