<?php

namespace App\Http\Requests\POS;

use Illuminate\Foundation\Http\FormRequest;

class OpenShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'register_name' => ['nullable', 'string', 'max:100'],
            'branch_name' => ['nullable', 'string', 'max:100'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
        ];
    }
}
