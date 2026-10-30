<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DianSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'environment',
        'company_type',
        'fiscal_responsibility',
        'software_id',
        'software_pin',
        'test_set_id',
        'technical_key',
        'certificate_path',
        'certificate_password',
        'is_connected',
        'is_auto_send',
        'send_email_to_customer',
        'contingency_mode',
    ];

    protected $casts = [
        'is_connected' => 'boolean',
        'is_auto_send' => 'boolean',
        'send_email_to_customer' => 'boolean',
        'contingency_mode' => 'boolean',
    ];
}
