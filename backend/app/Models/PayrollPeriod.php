<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'period_type',
        'status',
        'total_devengado',
        'total_deducciones',
        'total_neto',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_devengado' => 'decimal:2',
        'total_deducciones' => 'decimal:2',
        'total_neto' => 'decimal:2',
    ];

    public function slips(): HasMany
    {
        return $this->hasMany(PayrollSlip::class);
    }

    public function novelties(): HasMany
    {
        return $this->hasMany(PayrollNovelty::class);
    }
}
