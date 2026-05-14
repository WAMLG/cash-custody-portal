<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->when($request->query('role'), fn ($query, string $role) => $query->where('role', $role))
            ->when($request->query('status'), fn ($query, string $status) => $query->where('status', $status))
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 20));

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = 'active';
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        $this->auditLogService->record($request, 'user created', 'users', User::class, $user->id, newValues: $user->fresh()->toArray());

        return response()->json([
            'message' => 'User created successfully.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('password', $data)) {
            if ($data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
        }

        $oldValues = Arr::except(Arr::only($user->getOriginal(), array_keys($data)), ['password']);
        $user->update($data);

        $newValues = Arr::only($user->fresh()->toArray(), array_diff(array_keys($data), ['password']));
        $this->auditLogService->record($request, 'user edited', 'users', User::class, $user->id, $oldValues, $newValues);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => new UserResource($user),
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
}
