<?php

namespace App\Http\Controllers;

use App\Http\Resources\SupplierPaymentResource;
use App\Models\SupplierPayment;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SupplierPortalController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function dashboard(Request $request): JsonResponse
    {
        $supplierId = $request->user()->supplier_id;
        $baseQuery = SupplierPayment::query()->where('supplier_id', $supplierId);

        return response()->json([
            'summary' => [
                'payments_count' => (clone $baseQuery)->count(),
                'pending_acceptance' => (clone $baseQuery)->where('status', 'paid')->count(),
                'accepted_payments' => (clone $baseQuery)->where('status', 'accepted')->count(),
                'total_amount' => round((float) (clone $baseQuery)->whereIn('status', ['paid', 'accepted'])->sum('amount'), 2),
            ],
            'recent_payments' => SupplierPaymentResource::collection(
                (clone $baseQuery)
                    ->with(['supplier', 'createdBy', 'acceptedBy'])
                    ->latest('payment_date')
                    ->latest('id')
                    ->limit(10)
                    ->get(),
            ),
        ]);
    }

    public function payments(Request $request): AnonymousResourceCollection
    {
        return SupplierPaymentResource::collection(
            SupplierPayment::query()
                ->with(['supplier', 'createdBy', 'acceptedBy'])
                ->where('supplier_id', $request->user()->supplier_id)
                ->when($request->query('status'), fn ($query, string $status) => $query->where('status', $status))
                ->latest('payment_date')
                ->latest('id')
                ->paginate((int) $request->query('per_page', 15)),
        );
    }

    public function updateNote(Request $request, SupplierPayment $supplierPayment): JsonResponse
    {
        if ($supplierPayment->supplier_id !== $request->user()->supplier_id) {
            return response()->json(['message' => 'You can only update your own supplier payment note.'], 403);
        }

        if ($supplierPayment->status === 'voided') {
            return response()->json(['message' => 'Voided supplier payments cannot be updated.'], 409);
        }

        $data = $request->validate([
            'supplier_note' => ['nullable', 'string', 'max:5000'],
        ]);

        $oldValues = ['supplier_note' => $supplierPayment->supplier_note];
        $supplierPayment->update($data);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier payment note edited',
            module: 'supplier_payments',
            recordType: SupplierPayment::class,
            recordId: $supplierPayment->id,
            oldValues: $oldValues,
            newValues: ['supplier_note' => $supplierPayment->supplier_note],
        );

        return response()->json([
            'message' => 'Supplier note updated successfully.',
            'data' => new SupplierPaymentResource($supplierPayment->load(['supplier', 'createdBy', 'acceptedBy'])),
        ]);
    }

    public function accept(Request $request, SupplierPayment $supplierPayment): JsonResponse
    {
        if ($supplierPayment->supplier_id !== $request->user()->supplier_id) {
            return response()->json(['message' => 'You can only accept your own supplier payments.'], 403);
        }

        if ($supplierPayment->status !== 'paid') {
            return response()->json(['message' => 'Only paid supplier payments can be accepted.'], 409);
        }

        $oldValues = [
            'status' => $supplierPayment->status,
            'accepted_by_user_id' => $supplierPayment->accepted_by_user_id,
            'accepted_at' => $supplierPayment->accepted_at,
        ];

        $supplierPayment->update([
            'status' => 'accepted',
            'accepted_by_user_id' => $request->user()->id,
            'accepted_at' => now(),
        ]);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier payment accepted',
            module: 'supplier_payments',
            recordType: SupplierPayment::class,
            recordId: $supplierPayment->id,
            oldValues: $oldValues,
            newValues: [
                'status' => 'accepted',
                'accepted_by_user_id' => $supplierPayment->accepted_by_user_id,
                'accepted_at' => $supplierPayment->accepted_at,
            ],
        );

        return response()->json([
            'message' => 'Supplier payment accepted successfully.',
            'data' => new SupplierPaymentResource($supplierPayment->load(['supplier', 'createdBy', 'acceptedBy'])),
        ]);
    }
}
