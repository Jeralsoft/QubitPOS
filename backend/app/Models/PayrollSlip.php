<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollSlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_period_id',
        'employee_id',
        'consecutive',
        'worked_days',
        'base_salary',
        'transport_allowance',
        'overtime_amount',
        'commissions',
        'bonuses',
        'total_devengado',
        'health_deduction',
        'pension_deduction',
        'other_deductions',
        'total_deducciones',
        'net_paid',
        'cune',
        'qr_data',
        'dian_status',
    ];

    protected $casts = [
        'worked_days' => 'integer',
        'base_salary' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'commissions' => 'decimal:2',
        'bonuses' => 'decimal:2',
        'total_devengado' => 'decimal:2',
        'health_deduction' => 'decimal:2',
        'pension_deduction' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'total_deducciones' => 'decimal:2',
        'net_paid' => 'decimal:2',
    ];

    protected $appends = [
        'accrued_salary',
        'overtime_accrued',
        'total_accrued',
        'total_deductions',
    ];

    public function getAccruedSalaryAttribute(): float
    {
        return (float) ($this->base_salary ?? 0);
    }

    public function getOvertimeAccruedAttribute(): float
    {
        return (float) ($this->overtime_amount ?? 0);
    }

    public function getTotalAccruedAttribute(): float
    {
        return (float) ($this->total_devengado ?? 0);
    }

    public function getTotalDeductionsAttribute(): float
    {
        return (float) ($this->total_deducciones ?? 0);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
