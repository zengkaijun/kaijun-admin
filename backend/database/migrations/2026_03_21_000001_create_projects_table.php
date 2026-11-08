<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->string('customer_name');
            $table->string('stage', 32)->default('intent');
            $table->string('is_deal', 8)->default('no');
            $table->string('status', 32)->default('following');
            $table->decimal('expected_amount', 12, 2)->nullable();
            $table->decimal('deal_amount', 12, 2)->nullable();
            $table->foreignId('parent_project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->timestamps();

            $table->index(['stage', 'is_deal', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
