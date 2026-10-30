<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SystemPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'module',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(SystemRole::class, 'role_permission', 'permission_id', 'role_id');
    }
}
