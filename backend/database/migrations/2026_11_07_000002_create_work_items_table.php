<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('status', 16)->default('todo');
            $table->date('due_date')->nullable();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->string('type', 16)->default('task');
            $table->timestamps();

            $table->index(['status', 'type']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_items');
    }
};
