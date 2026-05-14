<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'handover_code',
    'handover_date',
    'handover_time',
    'amount',
    'handed_by_user_id',
    'handed_to_receiver_id',
    'finance_note',
    'admin_note',
    'status',
    'confirmed_by_user_id',
    'confirmed_at',
])]
class CashHandover extends Model
{
    use HasFactory, SoftDeletes;

    public function handedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handed_by_user_id');
    }

    public function handedTo(): BelongsTo
    {
        return $this->belongsTo(AuthorizedReceiver::class, 'handed_to_receiver_id');
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by_user_id');
    }

    protected function casts(): array
    {
        return [
            'handover_date' => 'date',
            'amount' => 'decimal:2',
            'confirmed_at' => 'datetime',
        ];
    }
}
