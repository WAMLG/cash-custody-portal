<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'username' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'max:255'],
            'role' => ['sometimes', 'required', Rule::in(['admin', 'finance', 'supplier'])],
            'supplier_id' => ['nullable', Rule::exists('suppliers', 'id')],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'supplier' => ['nullable', 'array'],
            'supplier.name' => ['sometimes', 'required', 'string', 'max:255'],
            'supplier.contact_person' => ['nullable', 'string', 'max:255'],
            'supplier.phone' => ['nullable', 'string', 'max:50'],
            'supplier.email' => ['nullable', 'email', 'max:255'],
            'supplier.address' => ['nullable', 'string', 'max:500'],
        ];
    }
}
