<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuthorizedReceiverResource;
use App\Models\AuthorizedReceiver;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuthorizedReceiverController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        $receivers = AuthorizedReceiver::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return AuthorizedReceiverResource::collection($receivers);
    }

    public function adminIndex(): AnonymousResourceCollection
    {
        return AuthorizedReceiverResource::collection(
            AuthorizedReceiver::query()->orderBy('name')->paginate(50),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'relationship_or_role' => ['required', 'string', 'max:255'],
        ]);

        $receiver = AuthorizedReceiver::create([...$data, 'is_active' => true]);
        $this->auditLogService->record($request, 'authorized receiver created', 'authorized_receivers', AuthorizedReceiver::class, $receiver->id, newValues: $receiver->fresh()->toArray());

        return response()->json(['message' => 'Authorized receiver created successfully.', 'data' => new AuthorizedReceiverResource($receiver)], 201);
    }

    public function update(Request $request, AuthorizedReceiver $authorizedReceiver): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'relationship_or_role' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $oldValues = array_intersect_key($authorizedReceiver->getOriginal(), $data);
        $authorizedReceiver->update($data);
        $this->auditLogService->record($request, 'authorized receiver edited', 'authorized_receivers', AuthorizedReceiver::class, $authorizedReceiver->id, $oldValues, array_intersect_key($authorizedReceiver->fresh()->toArray(), $data));

        return response()->json(['message' => 'Authorized receiver updated successfully.', 'data' => new AuthorizedReceiverResource($authorizedReceiver)]);
    }

    public function block(Request $request, AuthorizedReceiver $authorizedReceiver): JsonResponse
    {
        $oldValues = ['is_active' => $authorizedReceiver->is_active];
        $authorizedReceiver->update(['is_active' => false]);
        $this->auditLogService->record($request, 'authorized receiver blocked', 'authorized_receivers', AuthorizedReceiver::class, $authorizedReceiver->id, $oldValues, ['is_active' => false]);

        return response()->json(['message' => 'Authorized receiver blocked successfully.', 'data' => new AuthorizedReceiverResource($authorizedReceiver)]);
    }

    public function unblock(Request $request, AuthorizedReceiver $authorizedReceiver): JsonResponse
    {
        $oldValues = ['is_active' => $authorizedReceiver->is_active];
        $authorizedReceiver->update(['is_active' => true]);
        $this->auditLogService->record($request, 'authorized receiver unblocked', 'authorized_receivers', AuthorizedReceiver::class, $authorizedReceiver->id, $oldValues, ['is_active' => true]);

        return response()->json(['message' => 'Authorized receiver unblocked successfully.', 'data' => new AuthorizedReceiverResource($authorizedReceiver)]);
    }
}
