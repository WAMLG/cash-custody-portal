<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('role')->constrained('suppliers');
        });

        Schema::table('supplier_payments', function (Blueprint $table) {
            $table->text('supplier_note')->nullable()->after('admin_note');
            $table->foreignId('accepted_by_user_id')->nullable()->after('created_by_user_id')->constrained('users');
            $table->timestamp('accepted_at')->nullable()->after('accepted_by_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('supplier_payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('accepted_by_user_id');
            $table->dropColumn(['supplier_note', 'accepted_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
        });
    }
};
