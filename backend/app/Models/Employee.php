<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'first_name',
        'last_name',
        'document_type',
        'document_number',
        'phone',
        'email',
        'role',
        'department',
        'branch',
        'contract_type',
        'start_date',
        'end_date',
        'base_salary',
        'has_transport_allowance',
        'status',
        'eps',
        'pension_fund',
        'arl',
        'bank_name',
        'account_type',
        'account_number',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'base_salary' => 'decimal:2',
        'has_transport_allowance' => 'boolean',
    ];

    protected $appends = [
        'name',
        'document',
        'salary',
        'contract',
        'initials',
    ];

    public function getNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getDocumentAttribute(): string
    {
        $type = $this->document_type ?: 'CC';
        return "{$type} {$this->document_number}";
    }

    public function getSalaryAttribute(): float
    {
        return (float) ($this->base_salary ?? 0);
    }

    public function getContractAttribute(): string
    {
        return ucfirst(str_replace('_', ' ', $this->contract_type ?: 'indefinido'));
    }

    public function getInitialsAttribute(): string
    {
        $f = mb_substr($this->first_name ?: '', 0, 1);
        $l = mb_substr($this->last_name ?: '', 0, 1);
        return mb_strtoupper($f . $l) ?: 'EM';
    }

    public function slips(): HasMany
    {
        return $this->hasMany(PayrollSlip::class);
    }

    public function novelties(): HasMany
    {
        return $this->hasMany(PayrollNovelty::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
