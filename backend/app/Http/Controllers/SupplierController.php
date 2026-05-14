<?php

namespace App\Http\Controllers;

use App\Http\Requests\Suppliers\StoreSupplierRequest;
use App\Http\Requests\Suppliers\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class SupplierController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $suppliers = Supplier::query()
            ->when($request->query('status'), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('supplier_code', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 15));

        return SupplierResource::collection($suppliers);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['supplier_code'] ??= $this->generateSupplierCode();
        $data['status'] = 'active';

        $supplier = Supplier::create($data);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier created',
            module: 'suppliers',
            recordType: Supplier::class,
            recordId: $supplier->id,
            newValues: $supplier->fresh()->toArray(),
        );

        return response()->json([
            'message' => 'Supplier created successfully.',
            'data' => new SupplierResource($supplier),
        ], 201);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validated();
        $oldValues = Arr::only($supplier->getOriginal(), array_keys($data));

        $supplier->update($data);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier edited',
            module: 'suppliers',
            recordType: Supplier::class,
            recordId: $supplier->id,
            oldValues: $oldValues,
            newValues: Arr::only($supplier->fresh()->toArray(), array_keys($data)),
        );

        return response()->json([
            'message' => 'Supplier updated successfully.',
            'data' => new SupplierResource($supplier),
        ]);
    }

    public function block(Request $request, Supplier $supplier): JsonResponse
    {
        if ($supplier->status === 'blocked') {
            return response()->json([
                'message' => 'Supplier is already blocked.',
            ], 409);
        }

        $oldValues = ['status' => $supplier->status];
        $supplier->update(['status' => 'blocked']);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier blocked',
            module: 'suppliers',
            recordType: Supplier::class,
            recordId: $supplier->id,
            oldValues: $oldValues,
            newValues: ['status' => 'blocked'],
        );

        return response()->json([
            'message' => 'Supplier blocked successfully.',
            'data' => new SupplierResource($supplier),
        ]);
    }

    public function unblock(Request $request, Supplier $supplier): JsonResponse
    {
        if ($supplier->status === 'active') {
            return response()->json([
                'message' => 'Supplier is already active.',
            ], 409);
        }

        $oldValues = ['status' => $supplier->status];
        $supplier->update(['status' => 'active']);

        $this->auditLogService->record(
            request: $request,
            action: 'supplier unblocked',
            module: 'suppliers',
            recordType: Supplier::class,
            recordId: $supplier->id,
            oldValues: $oldValues,
            newValues: ['status' => 'active'],
        );

        return response()->json([
            'message' => 'Supplier unblocked successfully.',
            'data' => new SupplierResource($supplier),
        ]);
    }

    private function generateSupplierCode(): string
    {
        do {
            $code = 'SUP-'.Str::upper(Str::random(8));
        } while (Supplier::where('supplier_code', $code)->exists());

        return $code;
    }
}
