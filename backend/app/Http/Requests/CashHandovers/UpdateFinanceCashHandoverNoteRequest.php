<?php

namespace App\Http\Requests\CashHandovers;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFinanceCashHandoverNoteRequest extends FormRequest
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
            'finance_note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
