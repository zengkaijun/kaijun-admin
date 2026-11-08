<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('priority', 16)->default('normal')->after('status')->comment('优先级：high高/normal中/low低');
            $table->unsignedInteger('sort_order')->default(0)->after('priority')->comment('总览拖拽排序，越小越靠前');
            $table->index('sort_order');
        });

        Schema::table('work_items', function (Blueprint $table) {
            $table->string('priority', 16)->default('normal')->after('type')->comment('优先级：high高/normal中/low低');
            $table->unsignedInteger('sort_order')->default(0)->after('priority')->comment('总览拖拽排序，越小越靠前');
            $table->index('sort_order');
        });

        // 初始顺序按现有 id，避免全部为 0 时拖拽无差异
        DB::table('projects')->orderBy('id')->get(['id'])->each(function ($row, $index) {
            DB::table('projects')->where('id', $row->id)->update(['sort_order' => $index]);
        });
        DB::table('work_items')->orderBy('id')->get(['id'])->each(function ($row, $index) {
            DB::table('work_items')->where('id', $row->id)->update(['sort_order' => $index]);
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['sort_order']);
            $table->dropColumn(['priority', 'sort_order']);
        });

        Schema::table('work_items', function (Blueprint $table) {
            $table->dropIndex(['sort_order']);
            $table->dropColumn(['priority', 'sort_order']);
        });
    }
};
