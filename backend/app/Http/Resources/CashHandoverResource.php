<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashHandoverResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'handover_code' => $this->handover_code,
            'handover_date' => $this->handover_date?->toDateString(),
            'handover_time' => $this->handover_time,
            'amount' => $this->amount,
            'finance_note' => $this->finance_note,
            'admin_note' => $this->admin_note,
            'status' => $this->status,
            'confirmed_at' => $this->confirmed_at,
            'handed_by' => new UserResource($this->whenLoaded('handedBy')),
            'handed_to' => new AuthorizedReceiverResource($this->whenLoaded('handedTo')),
            'confirmed_by' => new UserResource($this->whenLoaded('confirmedBy')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
