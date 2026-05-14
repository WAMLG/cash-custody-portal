<?php

namespace App\Http\Requests\SupplierPayments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierPaymentRequest extends FormRequest
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
            'payment_date' => ['required', 'date'],
            'payment_time' => ['required', 'regex:/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'supplier_id' => [
                'required',
                'integer',
                Rule::exists('suppliers', 'id')->where('status', 'active'),
            ],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'gt:0'],
            'purpose' => ['required', 'string', 'max:5000'],
            'invoice_number' => ['nullable', 'string', 'max:255'],
            'received_by' => ['nullable', 'string', 'max:255'],
            'admin_note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
