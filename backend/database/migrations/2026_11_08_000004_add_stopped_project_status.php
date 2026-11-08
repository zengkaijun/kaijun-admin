<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE `projects` MODIFY `status` varchar(32) NOT NULL DEFAULT 'normal' COMMENT '当前状态：normal正常/paused暂停/stopped停止'");
    }

    public function down(): void
    {
        DB::table('projects')->where('status', 'stopped')->update(['status' => 'paused']);
        DB::table('follow_ups')->where('status_after', 'stopped')->update(['status_after' => 'paused']);
        DB::statement("ALTER TABLE `projects` MODIFY `status` varchar(32) NOT NULL DEFAULT 'normal' COMMENT '当前状态：normal正常/paused暂停'");
    }
};
