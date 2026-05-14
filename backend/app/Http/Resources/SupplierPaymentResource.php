<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierPaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_code' => $this->payment_code,
            'payment_date' => $this->payment_date?->toDateString(),
            'payment_time' => $this->payment_time,
            'amount' => $this->amount,
            'purpose' => $this->purpose,
            'invoice_number' => $this->invoice_number,
            'received_by' => $this->received_by,
            'admin_note' => $this->admin_note,
            'status' => $this->status,
            'supplier' => new SupplierResource($this->whenLoaded('supplier')),
            'created_by' => new UserResource($this->whenLoaded('createdBy')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
