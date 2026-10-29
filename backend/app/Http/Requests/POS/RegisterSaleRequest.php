<?php

namespace App\Http\Requests\POS;

use Illuminate\Foundation\Http\FormRequest;

class RegisterSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cash_shift_id' => ['required', 'exists:cash_shifts,id'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_tax_id' => ['nullable', 'string', 'max:30'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'payment_method' => ['required', 'in:efectivo,tarjeta,transferencia,otro'],
            'cash_received' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.0001'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'cash_shift_id.required' => 'Es obligatorio asociar la venta a un turno de caja abierto.',
            'cash_shift_id.exists' => 'El turno de caja especificado no existe.',
            'items.required' => 'El carrito no puede estar vacío.',
            'items.min' => 'Debes incluir al menos un producto en la venta.',
            'items.*.product_id.exists' => 'Uno de los productos seleccionados no existe en inventario.',
        ];
    }
}
