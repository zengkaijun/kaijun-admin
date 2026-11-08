-- 凯俊后台：为已有表/字段补充中文注释（仅显示，不影响程序）
-- 用法：Navicat 连上库 kaijun → 新建查询 → 整本粘贴执行
-- 对应 docs/技术方案.md 数据模型；可重复执行

-- ========== 业务表 ==========

ALTER TABLE `projects` COMMENT = '项目主表（以项目为中心）';
ALTER TABLE `projects`
  MODIFY COLUMN `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  MODIFY COLUMN `name` varchar(255) NOT NULL COMMENT '项目名称',
  MODIFY COLUMN `start_date` date NOT NULL COMMENT '项目开始日期（立项日）',
  MODIFY COLUMN `customer_name` varchar(255) NOT NULL COMMENT '客户名称',
  MODIFY COLUMN `stage` varchar(32) NOT NULL DEFAULT 'demand' COMMENT '阶段：demand需求沟通/proposal发方案报价/development开发阶段/testing测试阶段/delivered已交付',
  MODIFY COLUMN `is_deal` varchar(8) NOT NULL DEFAULT 'no' COMMENT '是否成交：no未成交/yes已成交',
  MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'normal' COMMENT '当前状态：normal正常/paused暂停/stopped停止',
  MODIFY COLUMN `priority` varchar(16) NOT NULL DEFAULT 'normal' COMMENT '优先级：high高/normal中/low低',
  MODIFY COLUMN `sort_order` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '总览拖拽排序（越小越靠前）',
  MODIFY COLUMN `next_follow_up_at` date NULL COMMENT '下次跟进日（记跟进时同步，可空）',
  MODIFY COLUMN `expected_amount` decimal(12,2) NULL COMMENT '预计金额',
  MODIFY COLUMN `deal_amount` decimal(12,2) NULL COMMENT '成交金额',
  MODIFY COLUMN `parent_project_id` bigint UNSIGNED NULL COMMENT '关联源项目ID（升级迭代子项目指向原项目）',
  MODIFY COLUMN `created_at` timestamp NULL COMMENT '创建时间',
  MODIFY COLUMN `updated_at` timestamp NULL COMMENT '更新时间';

ALTER TABLE `follow_ups` COMMENT = '跟进记录（只增不删）';
ALTER TABLE `follow_ups`
  MODIFY COLUMN `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  MODIFY COLUMN `project_id` bigint UNSIGNED NOT NULL COMMENT '所属项目ID',
  MODIFY COLUMN `occurred_at` datetime NOT NULL COMMENT '跟进时间',
  MODIFY COLUMN `channel` varchar(32) NOT NULL COMMENT '跟进方式：talk沟通/phone电话/wechat微信/quote报价/other其他',
  MODIFY COLUMN `content` text NOT NULL COMMENT '跟进内容正文',
  MODIFY COLUMN `next_follow_up_at` date NULL COMMENT '本次约定的下次跟进日（可空=暂不约）',
  MODIFY COLUMN `stage_after` varchar(32) NULL COMMENT '跟进后阶段（可选推进）',
  MODIFY COLUMN `status_after` varchar(32) NULL COMMENT '跟进后状态（可选，注意勿绕过状态机）',
  MODIFY COLUMN `created_at` timestamp NULL COMMENT '创建时间',
  MODIFY COLUMN `updated_at` timestamp NULL COMMENT '更新时间';

ALTER TABLE `work_items` COMMENT = '工作项（待办/里程碑，可挂项目可独立）';
ALTER TABLE `work_items`
  MODIFY COLUMN `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  MODIFY COLUMN `title` varchar(255) NOT NULL COMMENT '标题',
  MODIFY COLUMN `status` varchar(16) NOT NULL DEFAULT 'todo' COMMENT '状态：todo未做/doing进行中/done已完成',
  MODIFY COLUMN `due_date` date NULL COMMENT '截止日（可空）',
  MODIFY COLUMN `project_id` bigint UNSIGNED NULL COMMENT '关联项目ID（空=独立杂事）',
  MODIFY COLUMN `type` varchar(16) NOT NULL DEFAULT 'task' COMMENT '类型：task待办/milestone里程碑',
  MODIFY COLUMN `priority` varchar(16) NOT NULL DEFAULT 'normal' COMMENT '优先级：high高/normal中/low低',
  MODIFY COLUMN `sort_order` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '总览拖拽排序（越小越靠前）',
  MODIFY COLUMN `created_at` timestamp NULL COMMENT '创建时间',
  MODIFY COLUMN `updated_at` timestamp NULL COMMENT '更新时间';

-- ========== 账号与会话 ==========

ALTER TABLE `users` COMMENT = '管理员账号';
ALTER TABLE `users`
  MODIFY COLUMN `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  MODIFY COLUMN `name` varchar(255) NOT NULL COMMENT '显示名',
  MODIFY COLUMN `email` varchar(255) NOT NULL COMMENT '登录邮箱（用户名@kaijun.local）',
  MODIFY COLUMN `email_verified_at` timestamp NULL COMMENT '邮箱验证时间',
  MODIFY COLUMN `password` varchar(255) NOT NULL COMMENT '密码哈希（非明文）',
  MODIFY COLUMN `remember_token` varchar(100) NULL COMMENT '记住我令牌',
  MODIFY COLUMN `created_at` timestamp NULL COMMENT '创建时间',
  MODIFY COLUMN `updated_at` timestamp NULL COMMENT '更新时间';

ALTER TABLE `sessions` COMMENT = '登录会话（Session driver=database）';
ALTER TABLE `sessions`
  MODIFY COLUMN `id` varchar(255) NOT NULL COMMENT '会话ID',
  MODIFY COLUMN `user_id` bigint UNSIGNED NULL COMMENT '用户ID（可空）',
  MODIFY COLUMN `ip_address` varchar(45) NULL COMMENT '客户端IP',
  MODIFY COLUMN `user_agent` text NULL COMMENT '浏览器UA',
  MODIFY COLUMN `payload` longtext NOT NULL COMMENT '会话数据',
  MODIFY COLUMN `last_activity` int NOT NULL COMMENT '最后活动时间戳';

ALTER TABLE `password_reset_tokens` COMMENT = '密码重置令牌（MVP 可能未用）';
ALTER TABLE `password_reset_tokens`
  MODIFY COLUMN `email` varchar(255) NOT NULL COMMENT '邮箱',
  MODIFY COLUMN `token` varchar(255) NOT NULL COMMENT '重置令牌',
  MODIFY COLUMN `created_at` timestamp NULL COMMENT '创建时间';

-- ========== 框架表（简要） ==========

ALTER TABLE `cache` COMMENT = 'Laravel缓存';
ALTER TABLE `cache`
  MODIFY COLUMN `key` varchar(255) NOT NULL COMMENT '缓存键',
  MODIFY COLUMN `value` mediumtext NOT NULL COMMENT '缓存值',
  MODIFY COLUMN `expiration` int NOT NULL COMMENT '过期时间戳';

ALTER TABLE `cache_locks` COMMENT = '缓存锁';
ALTER TABLE `cache_locks`
  MODIFY COLUMN `key` varchar(255) NOT NULL COMMENT '锁键',
  MODIFY COLUMN `owner` varchar(255) NOT NULL COMMENT '持有者',
  MODIFY COLUMN `expiration` int NOT NULL COMMENT '过期时间戳';

ALTER TABLE `jobs` COMMENT = '队列任务（本期 queue=sync 可能为空）';
ALTER TABLE `jobs`
  MODIFY COLUMN `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  MODIFY COLUMN `queue` varchar(255) NOT NULL COMMENT '队列名',
  MODIFY COLUMN `payload` longtext NOT NULL COMMENT '任务负载JSON',
  MODIFY COLUMN `attempts` tinyint UNSIGNED NOT NULL COMMENT '已尝试次数',
  MODIFY COLUMN `reserved_at` int UNSIGNED NULL COMMENT '预留给工作进程的时间戳',
  MODIFY COLUMN `available_at` int UNSIGNED NOT NULL COMMENT '可执行时间戳',
  MODIFY COLUMN `created_at` int UNSIGNED NOT NULL COMMENT '创建时间戳';

ALTER TABLE `job_batches` COMMENT = '队列批次';
ALTER TABLE `job_batches`
  MODIFY COLUMN `id` varchar(255) NOT NULL COMMENT '批次ID',
  MODIFY COLUMN `name` varchar(255) NOT NULL COMMENT '批次名称',
  MODIFY COLUMN `total_jobs` int NOT NULL COMMENT '任务总数',
  MODIFY COLUMN `pending_jobs` int NOT NULL COMMENT '待执行数',
  MODIFY COLUMN `failed_jobs` int NOT NULL COMMENT '失败数',
  MODIFY COLUMN `failed_job_ids` longtext NOT NULL COMMENT '失败任务ID列表',
  MODIFY COLUMN `options` mediumtext NULL COMMENT '批次选项',
  MODIFY COLUMN `cancelled_at` int NULL COMMENT '取消时间戳',
  MODIFY COLUMN `created_at` int NOT NULL COMMENT '创建时间戳',
  MODIFY COLUMN `finished_at` int NULL COMMENT '完成时间戳';

ALTER TABLE `failed_jobs` COMMENT = '失败任务';
ALTER TABLE `failed_jobs`
  MODIFY COLUMN `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  MODIFY COLUMN `uuid` varchar(255) NOT NULL COMMENT '任务UUID',
  MODIFY COLUMN `connection` text NOT NULL COMMENT '连接名',
  MODIFY COLUMN `queue` text NOT NULL COMMENT '队列名',
  MODIFY COLUMN `payload` longtext NOT NULL COMMENT '任务负载',
  MODIFY COLUMN `exception` longtext NOT NULL COMMENT '异常信息',
  MODIFY COLUMN `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '失败时间';

ALTER TABLE `migrations` COMMENT = '迁移记录（框架自动）';
ALTER TABLE `migrations`
  MODIFY COLUMN `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  MODIFY COLUMN `migration` varchar(255) NOT NULL COMMENT '迁移文件名',
  MODIFY COLUMN `batch` int NOT NULL COMMENT '批次号';

-- 执行完成后在 Navicat 表设计器 / 注释 列即可看到中文
