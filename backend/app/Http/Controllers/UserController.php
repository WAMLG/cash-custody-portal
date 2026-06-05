<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Supplier;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->with('supplier')
            ->when($request->query('role'), fn ($query, string $role) => $query->where('role', $role))
            ->when($request->query('status'), fn ($query, string $status) => $query->where('status', $status))
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 20));

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $supplierData = Arr::pull($data, 'supplier');
        unset($data['supplier_id']);

        $user = DB::transaction(function () use ($request, $data, $supplierData): User {
            if ($data['role'] === 'supplier') {
                $supplier = Supplier::create([
                    ...$supplierData,
                    'supplier_code' => $this->generateSupplierCode(),
                    'status' => 'active',
                ]);

                $this->auditLogService->record(
                    request: $request,
                    action: 'supplier created',
                    module: 'suppliers',
                    recordType: Supplier::class,
                    recordId: $supplier->id,
                    newValues: $supplier->fresh()->toArray(),
                );

                $data['supplier_id'] = $supplier->id;
            } else {
                $data['supplier_id'] = null;
            }

            $data['status'] = 'active';
            $data['password'] = Hash::make($data['password']);

            $user = User::create($data);

            $this->auditLogService->record($request, 'user created', 'users', User::class, $user->id, newValues: Arr::except($user->fresh()->toArray(), ['password']));

            return $user;
        });

        return response()->json([
            'message' => 'User created successfully.',
            'data' => new UserResource($user->load('supplier')),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();
        $supplierData = Arr::pull($data, 'supplier');

        if (array_key_exists('password', $data)) {
            if ($data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
        }

        $user = DB::transaction(function () use ($request, $user, $data, $supplierData): User {
            if (($data['role'] ?? $user->role) === 'supplier') {
                if (!$user->supplier_id) {
                    $supplier = Supplier::create([
                        'name' => $supplierData['name'] ?? $data['name'],
                        'contact_person' => $supplierData['contact_person'] ?? $data['name'] ?? null,
                        'phone' => $supplierData['phone'] ?? $data['phone'] ?? null,
                        'email' => $supplierData['email'] ?? $data['email'] ?? null,
                        'address' => $supplierData['address'] ?? null,
                        'supplier_code' => $this->generateSupplierCode(),
                        'status' => 'active',
                    ]);

                    $this->auditLogService->record($request, 'supplier created', 'suppliers', Supplier::class, $supplier->id, newValues: $supplier->fresh()->toArray());
                    $data['supplier_id'] = $supplier->id;
                }

                if ($supplierData && $user->supplier_id) {
                    $supplier = Supplier::findOrFail($user->supplier_id);
                    $oldSupplierValues = Arr::only($supplier->getOriginal(), array_keys($supplierData));
                    $supplier->update($supplierData);
                    $this->auditLogService->record($request, 'supplier edited', 'suppliers', Supplier::class, $supplier->id, $oldSupplierValues, Arr::only($supplier->fresh()->toArray(), array_keys($supplierData)));
                }
            } else {
                $data['supplier_id'] = null;
            }

            $oldValues = Arr::except(Arr::only($user->getOriginal(), array_keys($data)), ['password']);
            $user->update($data);

            $newValues = Arr::only($user->fresh()->toArray(), array_diff(array_keys($data), ['password']));
            $this->auditLogService->record($request, 'user edited', 'users', User::class, $user->id, $oldValues, $newValues);

            return $user;
        });

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => new UserResource($user->load('supplier')),
        ]);
    }

    public function block(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot block your own account.'], 409);
        }

        $oldValues = ['status' => $user->status];
        $user->update(['status' => 'blocked']);
        $user->tokens()->delete();
        $this->auditLogService->record($request, 'user blocked', 'users', User::class, $user->id, $oldValues, ['status' => 'blocked']);

        return response()->json(['message' => 'User blocked successfully.', 'data' => new UserResource($user)]);
    }

    public function unblock(Request $request, User $user): JsonResponse
    {
        $oldValues = ['status' => $user->status];
        $user->update(['status' => 'active']);
        $this->auditLogService->record($request, 'user unblocked', 'users', User::class, $user->id, $oldValues, ['status' => 'active']);

        return response()->json(['message' => 'User unblocked successfully.', 'data' => new UserResource($user)]);
    }

    private function generateSupplierCode(): string
    {
        do {
            $code = 'SUP-'.Str::upper(Str::random(8));
        } while (Supplier::where('supplier_code', $code)->exists());

        return $code;
    }
}
