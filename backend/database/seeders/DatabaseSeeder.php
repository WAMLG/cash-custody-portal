<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\AuthorizedReceiver;
use App\Models\CashHandover;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Boss Admin',
            'email' => 'admin@example.com',
            'username' => 'admin',
            'password' => Hash::make('Password@123'),
            'role' => 'admin',
            'status' => 'active',
            'phone' => '+94770000001',
        ]);

        $financeOne = User::create([
            'name' => 'Finance User One',
            'email' => 'finance1@example.com',
            'username' => 'finance1',
            'password' => Hash::make('Password@123'),
            'role' => 'finance',
            'status' => 'active',
            'phone' => '+94770000002',
        ]);

        $financeTwo = User::create([
            'name' => 'Finance User Two',
            'email' => 'finance2@example.com',
            'username' => 'finance2',
            'password' => Hash::make('Password@123'),
            'role' => 'finance',
            'status' => 'active',
            'phone' => '+94770000003',
        ]);

        $boss = AuthorizedReceiver::create([
            'name' => 'Boss',
            'relationship_or_role' => 'Owner',
            'is_active' => true,
        ]);

        $bossWife = AuthorizedReceiver::create([
            'name' => "Boss's wife",
            'relationship_or_role' => 'Family member',
            'is_active' => true,
        ]);

        AuthorizedReceiver::create([
            'name' => 'Authorized person',
            'relationship_or_role' => 'Approved receiver',
            'is_active' => true,
        ]);

        $supplierOne = Supplier::create([
            'supplier_code' => 'SUP-0001',
            'name' => 'Lanka Office Supplies',
            'contact_person' => 'Nimal Perera',
            'phone' => '+94112223333',
            'email' => 'accounts@lankaoffice.example',
            'address' => 'Colombo',
            'status' => 'active',
        ]);

        $supplierTwo = Supplier::create([
            'supplier_code' => 'SUP-0002',
            'name' => 'Metro Packaging',
            'contact_person' => 'Asha Fernando',
            'phone' => '+94114445555',
            'email' => 'billing@metropack.example',
            'address' => 'Nugegoda',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Lanka Office Supplier',
            'email' => 'supplier1@example.com',
            'username' => 'supplier1',
            'password' => Hash::make('Password@123'),
            'role' => 'supplier',
            'supplier_id' => $supplierOne->id,
            'status' => 'active',
            'phone' => '+94770000004',
        ]);

        $today = Carbon::today('Asia/Colombo');

        $handoverOne = CashHandover::create([
            'handover_code' => 'CH-000001',
            'handover_date' => $today->toDateString(),
            'handover_time' => '18:15:00',
            'amount' => 125000.00,
            'handed_by_user_id' => $financeOne->id,
            'handed_to_receiver_id' => $boss->id,
            'finance_note' => 'Evening cash handover from main counter.',
            'admin_note' => 'Confirmed by boss.',
            'status' => 'confirmed',
            'confirmed_by_user_id' => $admin->id,
            'confirmed_at' => $today->copy()->setTime(18, 45),
        ]);

        $handoverTwo = CashHandover::create([
            'handover_code' => 'CH-000002',
            'handover_date' => $today->toDateString(),
            'handover_time' => '19:05:00',
            'amount' => 87500.00,
            'handed_by_user_id' => $financeTwo->id,
            'handed_to_receiver_id' => $bossWife->id,
            'finance_note' => 'Cash handed to family receiver as boss was out.',
            'status' => 'pending',
        ]);

        $paymentOne = SupplierPayment::create([
            'payment_code' => 'SP-000001',
            'payment_date' => $today->toDateString(),
            'payment_time' => '20:00:00',
            'supplier_id' => $supplierOne->id,
            'amount' => 45000.00,
            'purpose' => 'Office supplies invoice settlement.',
            'invoice_number' => 'INV-1001',
            'received_by' => 'Nimal Perera',
            'admin_note' => 'Paid from confirmed handover cash.',
            'status' => 'paid',
            'created_by_user_id' => $admin->id,
        ]);

        SupplierPayment::create([
            'payment_code' => 'SP-000002',
            'payment_date' => $today->copy()->subDay()->toDateString(),
            'payment_time' => '17:30:00',
            'supplier_id' => $supplierTwo->id,
            'amount' => 32000.00,
            'purpose' => 'Packaging material advance.',
            'invoice_number' => 'ADV-778',
            'received_by' => 'Asha Fernando',
            'status' => 'paid',
            'created_by_user_id' => $admin->id,
        ]);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'cash handover confirmed',
            'module' => 'cash_handovers',
            'record_type' => CashHandover::class,
            'record_id' => $handoverOne->id,
            'new_values' => ['status' => 'confirmed'],
        ]);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'supplier payment created',
            'module' => 'supplier_payments',
            'record_type' => SupplierPayment::class,
            'record_id' => $paymentOne->id,
            'new_values' => ['payment_code' => $paymentOne->payment_code, 'amount' => $paymentOne->amount],
        ]);
    }
}
