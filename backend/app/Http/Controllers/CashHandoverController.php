<?php

namespace App\Http\Controllers;

use App\Http\Requests\CashHandovers\AdminUpdateCashHandoverRequest;
use App\Http\Requests\CashHandovers\StoreFinanceCashHandoverRequest;
use App\Http\Requests\CashHandovers\UpdateFinanceCashHandoverNoteRequest;
use App\Http\Resources\CashHandoverResource;
use App\Models\CashHandover;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CashHandoverController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function financeIndex(Request $request): AnonymousResourceCollection
    {
        $handovers = CashHandover::query()
            ->with(['handedTo', 'confirmedBy'])
            ->where('handed_by_user_id', $request->user()->id)
            ->when($request->query('status'), fn ($query, string $status) => $query->where('status', $status))
            ->latest('handover_date')
            ->latest('id')
            ->paginate((int) $request->query('per_page', 15));

        return CashHandoverResource::collection($handovers);
    }

    public function financeStore(StoreFinanceCashHandoverRequest $request): JsonResponse
    {
        $handover = DB::transaction(function () use ($request): CashHandover {
            $handover = CashHandover::create([
                ...$request->validated(),
                'handover_code' => $this->generateHandoverCode(),
                'handed_by_user_id' => $request->user()->id,
                'status' => 'pending',
            ]);

            $this->auditLogService->record(
                request: $request,
                action: 'cash handover created',
                module: 'cash_handovers',
                recordType: CashHandover::class,
                recordId: $handover->id,
                newValues: $handover->fresh()->toArray(),
            );

            return $handover;
        });

        return response()->json([
            'message' => 'Cash handover submitted successfully.',
            'data' => new CashHandoverResource($handover->load(['handedBy', 'handedTo', 'confirmedBy'])),
        ], 201);
    }

    public function financeUpdateNote(
        UpdateFinanceCashHandoverNoteRequest $request,
        CashHandover $cashHandover,
    ): JsonResponse {
        if ($cashHandover->handed_by_user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You can only update your own cash handover note.',
            ], 403);
        }

        if ($cashHandover->status === 'voided') {
            return response()->json([
                'message' => 'Voided cash handovers cannot be updated.',
            ], 409);
        }

        $oldValues = ['finance_note' => $cashHandover->finance_note];

        $cashHandover->update([
            'finance_note' => $request->validated('finance_note'),
        ]);

        $this->auditLogService->record(
            request: $request,
            action: 'cash handover finance note edited',
            module: 'cash_handovers',
            recordType: CashHandover::class,
            recordId: $cashHandover->id,
            oldValues: $oldValues,
            newValues: ['finance_note' => $cashHandover->finance_note],
        );

        return response()->json([
            'message' => 'Finance note updated successfully.',
            'data' => new CashHandoverResource($cashHandover->load(['handedBy', 'handedTo', 'confirmedBy'])),
        ]);
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $handovers = CashHandover::query()
            ->with(['handedBy', 'handedTo', 'confirmedBy'])
            ->when($request->query('status'), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->query('date_from'), fn ($query, string $date) => $query->whereDate('handover_date', '>=', $date))
            ->when($request->query('date_to'), fn ($query, string $date) => $query->whereDate('handover_date', '<=', $date))
            ->latest('handover_date')
            ->latest('id')
            ->paginate((int) $request->query('per_page', 15));

        return CashHandoverResource::collection($handovers);
    }

    public function adminShow(CashHandover $cashHandover): CashHandoverResource
    {
        return new CashHandoverResource($cashHandover->load(['handedBy', 'handedTo', 'confirmedBy']));
    }

    public function adminUpdate(AdminUpdateCashHandoverRequest $request, CashHandover $cashHandover): JsonResponse
    {
        if ($cashHandover->status === 'voided') {
            return response()->json([
                'message' => 'Voided cash handovers cannot be updated.',
            ], 409);
        }

        $data = $request->validated();
        $trackedKeys = array_keys($data);
        $oldValues = Arr::only($cashHandover->getOriginal(), $trackedKeys);

        $cashHandover->update($data);

        $this->auditLogService->record(
            request: $request,
            action: 'cash handover edited',
            module: 'cash_handovers',
            recordType: CashHandover::class,
            recordId: $cashHandover->id,
            oldValues: $oldValues,
            newValues: Arr::only($cashHandover->fresh()->toArray(), $trackedKeys),
        );

        return response()->json([
            'message' => 'Cash handover updated successfully.',
            'data' => new CashHandoverResource($cashHandover->load(['handedBy', 'handedTo', 'confirmedBy'])),
        ]);
    }

    public function adminConfirm(Request $request, CashHandover $cashHandover): JsonResponse
    {
        if ($cashHandover->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending cash handovers can be confirmed.',
            ], 409);
        }

        $oldValues = Arr::only($cashHandover->getOriginal(), ['status', 'confirmed_by_user_id', 'confirmed_at']);

        $cashHandover->update([
            'status' => 'confirmed',
            'confirmed_by_user_id' => $request->user()->id,
            'confirmed_at' => now(),
        ]);

        $this->auditLogService->record(
            request: $request,
            action: 'cash handover confirmed',
            module: 'cash_handovers',
            recordType: CashHandover::class,
            recordId: $cashHandover->id,
            oldValues: $oldValues,
            newValues: Arr::only($cashHandover->fresh()->toArray(), ['status', 'confirmed_by_user_id', 'confirmed_at']),
        );

        return response()->json([
            'message' => 'Cash handover confirmed successfully.',
            'data' => new CashHandoverResource($cashHandover->load(['handedBy', 'handedTo', 'confirmedBy'])),
        ]);
    }

    public function adminVoid(Request $request, CashHandover $cashHandover): JsonResponse
    {
        if ($cashHandover->status === 'voided') {
            return response()->json([
                'message' => 'Cash handover is already voided.',
            ], 409);
        }

        $oldValues = Arr::only($cashHandover->getOriginal(), ['status']);

        $cashHandover->update([
            'status' => 'voided',
        ]);

        $this->auditLogService->record(
            request: $request,
            action: 'cash handover voided',
            module: 'cash_handovers',
            recordType: CashHandover::class,
            recordId: $cashHandover->id,
            oldValues: $oldValues,
            newValues: ['status' => 'voided'],
        );

        return response()->json([
            'message' => 'Cash handover voided successfully.',
            'data' => new CashHandoverResource($cashHandover->load(['handedBy', 'handedTo', 'confirmedBy'])),
        ]);
    }

    private function generateHandoverCode(): string
    {
        do {
            $code = 'CH-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
        } while (CashHandover::where('handover_code', $code)->exists());

        return $code;
    }
}
