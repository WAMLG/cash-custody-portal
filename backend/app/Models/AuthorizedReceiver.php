<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'relationship_or_role', 'is_active'])]
class AuthorizedReceiver extends Model
{
    use HasFactory, SoftDeletes;

    public function cashHandovers(): HasMany
    {
        return $this->hasMany(CashHandover::class, 'handed_to_receiver_id');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
