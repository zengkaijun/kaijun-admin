<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 旧状态 → 正常 / 暂停
        DB::table('projects')->whereIn('status', [
            'following',
            'waiting',
            'delayed',
            'won',
            'lost',
        ])->update(['status' => 'normal']);

        // paused 保持 paused

        if (Schema::hasTable('follow_ups')) {
            DB::table('follow_ups')->whereIn('status_after', [
                'following',
                'waiting',
                'delayed',
                'won',
                'lost',
            ])->update(['status_after' => 'normal']);

            DB::table('follow_ups')->where('status_after', 'paused')->update(['status_after' => 'paused']);
        }

        DB::statement("ALTER TABLE `projects` MODIFY `status` varchar(32) NOT NULL DEFAULT 'normal' COMMENT '当前状态：normal正常/paused暂停'");
    }

    public function down(): void
    {
        DB::table('projects')->where('status', 'normal')->update(['status' => 'following']);

        if (Schema::hasTable('follow_ups')) {
            DB::table('follow_ups')->where('status_after', 'normal')->update(['status_after' => 'following']);
        }

        DB::statement("ALTER TABLE `projects` MODIFY `status` varchar(32) NOT NULL DEFAULT 'following' COMMENT '当前状态：following跟进中/waiting待客户回复/paused暂停/delayed延后/lost无法成交/won已成交'");
    }
};
