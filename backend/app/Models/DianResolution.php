<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DianResolution extends Model
{
    use HasFactory;

    protected $fillable = [
        'resolution_number',
        'prefix',
        'range_from',
        'range_to',
        'current_number',
        'issued_at',
        'expires_at',
        'technical_key',
        'status',
        'is_active',
    ];

    protected $casts = [
        'range_from' => 'integer',
        'range_to' => 'integer',
        'current_number' => 'integer',
        'issued_at' => 'date',
        'expires_at' => 'date',
        'is_active' => 'boolean',
    ];
}
