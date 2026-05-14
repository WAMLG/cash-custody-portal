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
        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_code')->unique();
            $table->date('payment_date')->index();
            $table->time('payment_time');
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->decimal('amount', 15, 2);
            $table->text('purpose');
            $table->string('invoice_number')->nullable();
            $table->string('received_by')->nullable();
            $table->text('admin_note')->nullable();
            $table->string('status', 20)->default('paid')->index();
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['payment_date', 'status']);
            $table->index(['supplier_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_payments');
    }
};
