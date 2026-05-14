<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuditLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $logs = AuditLog::query()
            ->with('user')
            ->when($request->query('module'), fn ($query, string $module) => $query->where('module', $module))
            ->when($request->query('action'), fn ($query, string $action) => $query->where('action', $action))
            ->latest('created_at')
            ->paginate((int) $request->query('per_page', 50));

        return AuditLogResource::collection($logs);
    }
}
