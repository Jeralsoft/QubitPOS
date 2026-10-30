<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'trade_name',
        'legal_name',
        'nit',
        'dv',
        'phone',
        'email',
        'address',
        'city',
        'department',
        'website',
        'currency',
        'timezone',
    ];
}
