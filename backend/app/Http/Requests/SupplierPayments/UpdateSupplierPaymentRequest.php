<?php

namespace App\Http\Requests\SupplierPayments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payment_date' => ['sometimes', 'required', 'date'],
            'payment_time' => ['sometimes', 'required', 'regex:/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'supplier_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('suppliers', 'id')->where('status', 'active'),
            ],
            'amount' => ['sometimes', 'required', 'numeric', 'decimal:0,2', 'gt:0'],
            'purpose' => ['sometimes', 'required', 'string', 'max:5000'],
            'invoice_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'received_by' => ['sometimes', 'nullable', 'string', 'max:255'],
            'admin_note' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}
