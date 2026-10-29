<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'barcode',
        'name',
        'category',
        'brand',
        'purchase_price',
        'sale_price',
        'stock',
        'min_stock',
        'tax_rate',
        'color',
        'is_active',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'decimal:4',
        'min_stock' => 'decimal:4',
        'tax_rate' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function kardexMovements(): HasMany
    {
        return $this->hasMany(KardexMovement::class);
    }
}
