<?php

namespace App\Http\Requests\CashHandovers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateCashHandoverRequest extends FormRequest
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
            'handover_date' => ['sometimes', 'required', 'date'],
            'handover_time' => ['sometimes', 'required', 'regex:/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'amount' => ['sometimes', 'required', 'numeric', 'decimal:0,2', 'gt:0'],
            'handed_by_user_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', 'finance')->where('status', 'active'),
            ],
            'handed_to_receiver_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('authorized_receivers', 'id')->where('is_active', true),
            ],
            'finance_note' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'admin_note' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}
