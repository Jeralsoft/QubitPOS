<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SystemRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'tone',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(SystemPermission::class, 'role_permission', 'role_id', 'permission_id');
    }
}
