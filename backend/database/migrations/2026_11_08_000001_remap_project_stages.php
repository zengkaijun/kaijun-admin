<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 旧值映射：意向→需求沟通，完成→已交付
        DB::table('projects')->where('stage', 'intent')->update(['stage' => 'demand']);
        DB::table('projects')->where('stage', 'done')->update(['stage' => 'delivered']);

        if (Schema::hasTable('follow_ups')) {
            DB::table('follow_ups')->where('stage_after', 'intent')->update(['stage_after' => 'demand']);
            DB::table('follow_ups')->where('stage_after', 'done')->update(['stage_after' => 'delivered']);
        }

        DB::statement("ALTER TABLE `projects` MODIFY `stage` varchar(32) NOT NULL DEFAULT 'demand' COMMENT '阶段：demand需求沟通/proposal方案报价/development开发阶段/testing测试阶段/delivered已交付'");
    }

    public function down(): void
    {
        DB::table('projects')->where('stage', 'delivered')->update(['stage' => 'done']);
        DB::table('projects')->whereIn('stage', ['development', 'testing'])->update(['stage' => 'proposal']);

        if (Schema::hasTable('follow_ups')) {
            DB::table('follow_ups')->where('stage_after', 'delivered')->update(['stage_after' => 'done']);
            DB::table('follow_ups')->whereIn('stage_after', ['development', 'testing'])->update(['stage_after' => 'proposal']);
        }

        DB::statement("ALTER TABLE `projects` MODIFY `stage` varchar(32) NOT NULL DEFAULT 'intent' COMMENT '阶段：intent意向/demand需求沟通/proposal方案报价/done完成'");
    }
};
