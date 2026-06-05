<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'role' => ['required', Rule::in(['admin', 'finance', 'supplier'])],
            'supplier_id' => ['prohibited'],
            'phone' => ['nullable', 'string', 'max:50'],
            'supplier' => ['nullable', 'required_if:role,supplier', 'array'],
            'supplier.name' => ['required_if:role,supplier', 'string', 'max:255'],
            'supplier.contact_person' => ['nullable', 'string', 'max:255'],
            'supplier.phone' => ['nullable', 'string', 'max:50'],
            'supplier.email' => ['nullable', 'email', 'max:255'],
            'supplier.address' => ['nullable', 'string', 'max:500'],
        ];
    }
}
