<?php

namespace App\Http\Controllers;

use App\Http\Resources\CashHandoverResource;
use App\Models\CashHandover;
use App\Models\SupplierPayment;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function admin(Request $request): JsonResponse
    {
        [$startDate, $endDate, $period] = $this->resolvePeriod($request);
        $dayCount = max(1, $startDate->diffInDays($endDate) + 1);

        $cashInByDay = $this->dailyTotals(
            modelClass: CashHandover::class,
            dateColumn: 'handover_date',
            amountColumn: 'amount',
            startDate: $startDate,
            endDate: $endDate,
            status: 'confirmed',
        );

        $cashOutByDay = $this->dailyTotals(
            modelClass: SupplierPayment::class,
            dateColumn: 'payment_date',
            amountColumn: 'amount',
            startDate: $startDate,
            endDate: $endDate,
            status: 'paid',
        );

        $dateLabels = $this->dateLabels($startDate, $endDate);
        $cashInSeries = [];
        $cashOutSeries = [];

        foreach ($dateLabels as $date) {
            $cashInSeries[] = [
                'date' => $date,
                'amount' => $this->money($cashInByDay[$date] ?? 0),
            ];
            $cashOutSeries[] = [
                'date' => $date,
                'amount' => $this->money($cashOutByDay[$date] ?? 0),
            ];
        }

        $periodCashIn = array_sum($cashInByDay);
        $periodCashOut = array_sum($cashOutByDay);
        $allTimeCashIn = $this->sumMoney(CashHandover::query()->where('status', 'confirmed'), 'amount');
        $allTimeCashOut = $this->sumMoney(SupplierPayment::query()->where('status', 'paid'), 'amount');

        return response()->json([
            'period' => [
                'key' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'kpis' => [
                'today_cash_in' => $this->sumMoney($this->confirmedHandoversForDate(now()->toDateString()), 'amount'),
                'today_supplier_payments' => $this->sumMoney($this->paidSupplierPaymentsForDate(now()->toDateString()), 'amount'),
                'current_cash_balance' => $this->money($allTimeCashIn - $allTimeCashOut),
                'pending_cash_handovers' => CashHandover::query()->where('status', 'pending')->count(),
                'total_cash_in' => $this->money($periodCashIn),
                'total_cash_out' => $this->money($periodCashOut),
                'all_time_cash_in' => $this->money($allTimeCashIn),
                'all_time_cash_out' => $this->money($allTimeCashOut),
                'average_daily_cash_in' => $this->money($periodCashIn / $dayCount),
                'average_daily_cash_out' => $this->money($periodCashOut / $dayCount),
                'maximum_cash_in' => $this->money(max(array_values($cashInByDay) ?: [0])),
                'minimum_cash_in' => $this->money(min(array_values($cashInByDay) ?: [0])),
            ],
            'charts' => [
                'daily_cash_in_vs_out' => [
                    'cash_in' => $cashInSeries,
                    'cash_out' => $cashOutSeries,
                ],
                'finance_user_cash_handovers' => $this->financeUserCashHandovers($startDate, $endDate),
                'supplier_payments' => $this->supplierWisePayments($startDate, $endDate),
            ],
        ]);
    }

    public function finance(Request $request): JsonResponse
    {
        $user = $request->user();
        $monthStart = CarbonImmutable::now()->startOfMonth();
        $monthEnd = CarbonImmutable::now()->endOfMonth();

        $baseQuery = CashHandover::query()
            ->where('handed_by_user_id', $user->id);

        $recentHandovers = (clone $baseQuery)
            ->with(['handedTo', 'confirmedBy'])
            ->latest('handover_date')
            ->latest('id')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'submitted_handovers_count' => (clone $baseQuery)->count(),
                'pending_handovers' => (clone $baseQuery)->where('status', 'pending')->count(),
                'confirmed_handovers' => (clone $baseQuery)->where('status', 'confirmed')->count(),
                'current_month_submitted_amount' => $this->sumMoney(
                    (clone $baseQuery)
                        ->whereBetween('handover_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                        ->whereIn('status', ['pending', 'confirmed']),
                    'amount',
                ),
            ],
            'recent_handovers' => CashHandoverResource::collection($recentHandovers),
        ]);
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable, 2: string}
     */
    private function resolvePeriod(Request $request): array
    {
        $period = $request->query('period', 'today');
        $today = CarbonImmutable::today();

        if ($request->query('date_from') && $request->query('date_to')) {
            return [
                CarbonImmutable::parse($request->query('date_from'))->startOfDay(),
                CarbonImmutable::parse($request->query('date_to'))->startOfDay(),
                'custom',
            ];
        }

        return match ($period) {
            'week' => [$today->startOfWeek(), $today->endOfWeek(), 'week'],
            'month' => [$today->startOfMonth(), $today->endOfMonth(), 'month'],
            default => [$today, $today, 'today'],
        };
    }

    /**
     * @return array<string, float>
     */
    private function dailyTotals(
        string $modelClass,
        string $dateColumn,
        string $amountColumn,
        CarbonImmutable $startDate,
        CarbonImmutable $endDate,
        string $status,
    ): array {
        /** @var Builder $query */
        $query = $modelClass::query();

        $totals = $query
            ->selectRaw("{$dateColumn} as total_date, COALESCE(SUM({$amountColumn}), 0) as total_amount")
            ->where('status', $status)
            ->whereBetween($dateColumn, [$startDate->toDateString(), $endDate->toDateString()])
            ->groupBy($dateColumn)
            ->pluck('total_amount', 'total_date')
            ->map(fn ($amount): float => (float) $amount)
            ->all();

        foreach ($this->dateLabels($startDate, $endDate) as $date) {
            $totals[$date] ??= 0.0;
        }

        ksort($totals);

        return $totals;
    }

    /**
     * @return list<string>
     */
    private function dateLabels(CarbonImmutable $startDate, CarbonImmutable $endDate): array
    {
        $dates = [];

        foreach (CarbonPeriod::create($startDate, $endDate) as $date) {
            $dates[] = $date->toDateString();
        }

        return $dates;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function financeUserCashHandovers(CarbonImmutable $startDate, CarbonImmutable $endDate): array
    {
        return CashHandover::query()
            ->join('users', 'users.id', '=', 'cash_handovers.handed_by_user_id')
            ->select([
                'users.id as user_id',
                'users.name as user_name',
                DB::raw('COUNT(cash_handovers.id) as handovers_count'),
                DB::raw('COALESCE(SUM(cash_handovers.amount), 0) as total_amount'),
            ])
            ->where('cash_handovers.status', 'confirmed')
            ->whereBetween('cash_handovers.handover_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_amount')
            ->get()
            ->map(fn ($row): array => [
                'user_id' => $row->user_id,
                'user_name' => $row->user_name,
                'handovers_count' => (int) $row->handovers_count,
                'total_amount' => $this->money($row->total_amount),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function supplierWisePayments(CarbonImmutable $startDate, CarbonImmutable $endDate): array
    {
        return SupplierPayment::query()
            ->join('suppliers', 'suppliers.id', '=', 'supplier_payments.supplier_id')
            ->select([
                'suppliers.id as supplier_id',
                'suppliers.name as supplier_name',
                DB::raw('COUNT(supplier_payments.id) as payments_count'),
                DB::raw('COALESCE(SUM(supplier_payments.amount), 0) as total_amount'),
            ])
            ->where('supplier_payments.status', 'paid')
            ->whereBetween('supplier_payments.payment_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->groupBy('suppliers.id', 'suppliers.name')
            ->orderByDesc('total_amount')
            ->get()
            ->map(fn ($row): array => [
                'supplier_id' => $row->supplier_id,
                'supplier_name' => $row->supplier_name,
                'payments_count' => (int) $row->payments_count,
                'total_amount' => $this->money($row->total_amount),
            ])
            ->values()
            ->all();
    }

    private function confirmedHandoversForDate(string $date): Builder
    {
        return CashHandover::query()
            ->where('status', 'confirmed')
            ->whereDate('handover_date', $date);
    }

    private function paidSupplierPaymentsForDate(string $date): Builder
    {
        return SupplierPayment::query()
            ->where('status', 'paid')
            ->whereDate('payment_date', $date);
    }

    private function sumMoney(Builder $query, string $column): float
    {
        return $this->money($query->sum($column));
    }

    private function money(mixed $value): float
    {
        return round((float) $value, 2);
    }
}
