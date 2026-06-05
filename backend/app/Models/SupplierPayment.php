<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'payment_code',
    'payment_date',
    'payment_time',
    'supplier_id',
    'amount',
    'purpose',
    'invoice_number',
    'received_by',
    'admin_note',
    'supplier_note',
    'status',
    'created_by_user_id',
    'accepted_by_user_id',
    'accepted_at',
])]
class SupplierPayment extends Model
{
    use HasFactory, SoftDeletes;

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function acceptedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by_user_id');
    }

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'decimal:2',
            'accepted_at' => 'datetime',
        ];
    }
}
