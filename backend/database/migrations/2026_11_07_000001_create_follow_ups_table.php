<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->dateTime('occurred_at');
            $table->string('channel', 32);
            $table->text('content');
            $table->date('next_follow_up_at')->nullable();
            $table->string('stage_after', 32)->nullable();
            $table->string('status_after', 32)->nullable();
            $table->timestamps();

            $table->index(['project_id', 'occurred_at']);
        });

        // 列表/待跟进用：取最近一条跟进的下次跟进日（记跟进时同步）
        Schema::table('projects', function (Blueprint $table) {
            $table->date('next_follow_up_at')->nullable()->after('status');
            $table->index('next_follow_up_at');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['next_follow_up_at']);
            $table->dropColumn('next_follow_up_at');
        });

        Schema::dropIfExists('follow_ups');
    }
};
