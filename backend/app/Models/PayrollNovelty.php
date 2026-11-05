<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollNovelty extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'payroll_period_id',
        'novelty_type',
        'quantity',
        'amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    protected $appends = [
        'employee_name',
        'initials',
        'type_label',
        'value',
    ];

    public function getEmployeeNameAttribute(): string
    {
        return $this->employee ? $this->employee->name : 'Empleado #' . $this->employee_id;
    }

    public function getInitialsAttribute(): string
    {
        return $this->employee ? $this->employee->initials : 'NV';
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->novelty_type) {
            'HORA_EXTRA_DIURNA' => 'Hora Extra Diurna (+25%)',
            'HORA_EXTRA_NOCTURNA' => 'Hora Extra Nocturna (+75%)',
            'RECARGO_NOCTURNO' => 'Recargo Nocturno (+35%)',
            'COMISION' => 'Comisión de Ventas',
            'BONIFICACION' => 'Bonificación',
            'INCAPACIDAD' => 'Incapacidad Médica',
            default => $this->novelty_type,
        };
    }

    public function getValueAttribute(): float
    {
        return (float) ($this->amount ?? 0);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id');
    }
}
