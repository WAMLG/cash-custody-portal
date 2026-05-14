<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierPayments\StoreSupplierPaymentRequest;
use App\Http\Requests\SupplierPayments\UpdateSupplierPaymentRequest;
use App\Http\Resources\SupplierPaymentResource;
use App\Models\SupplierPayment;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class SupplierPaymentController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $payments = SupplierPayment::query()
            ->with(['supplier', 'createdBy'])
            ->when($request->query('status'), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->query('supplier_id'), fn ($query, string $supplierId) => $query->where('supplier_id', $supplierId))
            ->when($request->query('date_from'), fn ($query, string $date) => $query->whereDate('payment_date', '>=', $date))
            ->when($request->query('date_to'), fn ($query, string $date) => $query->whereDate('payment_date', '<=', $date))
            ->latest('payment_date')
            ->latest('id')
            ->paginate((int) $request->query('per_page', 15));

        return SupplierPaymentResource::collection($payments);
    }

    public function store(StoreSupplierPaymentRequest $request): JsonResponse
    {
        $payment = SupplierPayment::create([
            ...$request->validated(),
            'payment_code' => $this->generatePaymentCode(),
            'status' => 'paid',
            'created_by_user_id' => $request->user()->id,
        ]);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier payment created',
            module: 'supplier_payments',
            recordType: SupplierPayment::class,
            recordId: $payment->id,
            newValues: $payment->fresh()->toArray(),
        );

        return response()->json([
            'message' => 'Supplier payment created successfully.',
            'data' => new SupplierPaymentResource($payment->load(['supplier', 'createdBy'])),
        ], 201);
    }

    public function update(UpdateSupplierPaymentRequest $request, SupplierPayment $supplierPayment): JsonResponse
    {
        if ($supplierPayment->status === 'voided') {
            return response()->json([
                'message' => 'Voided supplier payments cannot be updated.',
            ], 409);
        }

        $data = $request->validated();
        $oldValues = Arr::only($supplierPayment->getOriginal(), array_keys($data));

        $supplierPayment->update($data);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier payment edited',
            module: 'supplier_payments',
            recordType: SupplierPayment::class,
            recordId: $supplierPayment->id,
            oldValues: $oldValues,
            newValues: Arr::only($supplierPayment->fresh()->toArray(), array_keys($data)),
        );

        return response()->json([
            'message' => 'Supplier payment updated successfully.',
            'data' => new SupplierPaymentResource($supplierPayment->load(['supplier', 'createdBy'])),
        ]);
    }

    public function void(Request $request, SupplierPayment $supplierPayment): JsonResponse
    {
        if ($supplierPayment->status === 'voided') {
            return response()->json([
                'message' => 'Supplier payment is already voided.',
            ], 409);
        }

        $oldValues = ['status' => $supplierPayment->status];
        $supplierPayment->update(['status' => 'voided']);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier payment voided',
            module: 'supplier_payments',
            recordType: SupplierPayment::class,
            recordId: $supplierPayment->id,
            oldValues: $oldValues,
            newValues: ['status' => 'voided'],
        );

        return response()->json([
            'message' => 'Supplier payment voided successfully.',
            'data' => new SupplierPaymentResource($supplierPayment->load(['supplier', 'createdBy'])),
        ]);
    }

    private function generatePaymentCode(): string
    {
        do {
            $code = 'SP-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
        } while (SupplierPayment::where('payment_code', $code)->exists());

        return $code;
    }
}
