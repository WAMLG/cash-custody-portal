<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cash_handovers', function (Blueprint $table) {
            $table->id();
            $table->string('handover_code')->unique();
            $table->date('handover_date')->index();
            $table->time('handover_time');
            $table->decimal('amount', 15, 2);
            $table->foreignId('handed_by_user_id')->constrained('users');
            $table->foreignId('handed_to_receiver_id')->constrained('authorized_receivers');
            $table->text('finance_note')->nullable();
            $table->text('admin_note')->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->foreignId('confirmed_by_user_id')->nullable()->constrained('users');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['handover_date', 'status']);
            $table->index(['handed_by_user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_handovers');
    }
};
