<?php

namespace App\Http\Requests\CashHandovers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinanceCashHandoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'finance';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'handover_date' => ['required', 'date'],
            'handover_time' => ['required', 'regex:/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'gt:0'],
            'handed_to_receiver_id' => [
                'required',
                'integer',
                Rule::exists('authorized_receivers', 'id')->where('is_active', true),
            ],
            'finance_note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
