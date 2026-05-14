<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthorizedReceiverController;
use App\Http\Controllers\CashHandoverController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierPaymentController;
use App\Http\Controllers\UserController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/authorized-receivers', [AuthorizedReceiverController::class, 'index']);

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/status', function (Request $request) {
            return response()->json([
                'message' => 'Admin API access granted.',
                'user' => new UserResource($request->user()),
            ]);
        });

        Route::get('/cash-handovers', [CashHandoverController::class, 'adminIndex']);
        Route::get('/cash-handovers/{cashHandover}', [CashHandoverController::class, 'adminShow']);
        Route::patch('/cash-handovers/{cashHandover}', [CashHandoverController::class, 'adminUpdate']);
        Route::post('/cash-handovers/{cashHandover}/confirm', [CashHandoverController::class, 'adminConfirm']);
        Route::post('/cash-handovers/{cashHandover}/void', [CashHandoverController::class, 'adminVoid']);

        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::patch('/suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::post('/suppliers/{supplier}/block', [SupplierController::class, 'block']);
        Route::post('/suppliers/{supplier}/unblock', [SupplierController::class, 'unblock']);

        Route::get('/supplier-payments', [SupplierPaymentController::class, 'index']);
        Route::post('/supplier-payments', [SupplierPaymentController::class, 'store']);
        Route::patch('/supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'update']);
        Route::post('/supplier-payments/{supplierPayment}/void', [SupplierPaymentController::class, 'void']);

        Route::get('/dashboard', [DashboardController::class, 'admin']);

        Route::get('/authorized-receivers', [AuthorizedReceiverController::class, 'adminIndex']);
        Route::post('/authorized-receivers', [AuthorizedReceiverController::class, 'store']);
        Route::patch('/authorized-receivers/{authorizedReceiver}', [AuthorizedReceiverController::class, 'update']);
        Route::post('/authorized-receivers/{authorizedReceiver}/block', [AuthorizedReceiverController::class, 'block']);
        Route::post('/authorized-receivers/{authorizedReceiver}/unblock', [AuthorizedReceiverController::class, 'unblock']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::post('/users/{user}/block', [UserController::class, 'block']);
        Route::post('/users/{user}/unblock', [UserController::class, 'unblock']);

        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });

    Route::middleware('role:finance')->prefix('finance')->group(function (): void {
        Route::get('/status', function (Request $request) {
            return response()->json([
                'message' => 'Finance API access granted.',
                'user' => new UserResource($request->user()),
            ]);
        });

        Route::get('/cash-handovers', [CashHandoverController::class, 'financeIndex']);
        Route::post('/cash-handovers', [CashHandoverController::class, 'financeStore']);
        Route::patch('/cash-handovers/{cashHandover}/note', [CashHandoverController::class, 'financeUpdateNote']);
        Route::get('/dashboard', [DashboardController::class, 'finance']);
    });
});
