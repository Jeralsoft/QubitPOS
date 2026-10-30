<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_type',
        'document_number',
        'dv',
        'first_name',
        'last_name',
        'trade_name',
        'full_name',
        'email',
        'phone',
        'address',
        'city',
        'department',
        'customer_type',
        'fiscal_regime',
        'credit_limit',
        'current_balance',
        'credit_days',
        'status',
        'notes',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'credit_days' => 'integer',
    ];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'customer_tax_id', 'document_number');
    }

    public function receivables(): HasMany
    {
        return $this->hasMany(AccountReceivable::class, 'customer_tax_id', 'document_number');
    }
}
