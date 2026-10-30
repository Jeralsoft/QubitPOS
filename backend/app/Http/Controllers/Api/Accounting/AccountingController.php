<?php

namespace App\Http\Controllers\Api\Accounting;

use App\Http\Controllers\Controller;
use App\Models\AccountingAccount;
use App\Models\AccountingEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountingController extends Controller
{
    /**
     * Lista de comprobantes contables con sus líneas asociadas.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AccountingEntry::with(['lines.account', 'user']);

        if ($request->filled('type')) {
            $query->where('entry_type', $request->query('type'));
        }

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('consecutive', 'like', "%{$q}%")
                    ->orWhere('concept', 'like', "%{$q}%")
                    ->orWhere('reference_id', 'like', "%{$q}%");
            });
        }

        $entries = $query->latest('id')->paginate(20);

        return response()->json($entries);
    }

    /**
     * Detalle de un comprobante contable.
     */
    public function show(int $id): JsonResponse
    {
        $entry = AccountingEntry::with(['lines.account', 'user'])->findOrFail($id);

        return response()->json([
            'data' => $entry,
        ]);
    }

    /**
     * Catálogo del Plan Único de Cuentas (PUC NIIF).
     */
    public function puc(Request $request): JsonResponse
    {
        $query = AccountingAccount::query();

        if ($request->filled('q')) {
            $q = trim($request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('code', 'like', "{$q}%")
                    ->orWhere('name', 'like', "%{$q}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        $accounts = $query->orderBy('code')->get();

        return response()->json([
            'data' => $accounts,
        ]);
    }

    /**
     * Balance de Comprobación / Prueba (Trial Balance).
     * Calcula sumas de débitos y créditos y saldos finales por cuenta, verificando el cuadre global.
     */
    public function trialBalance(): JsonResponse
    {
        $rows = DB::table('accounting_accounts as a')
            ->leftJoin('accounting_entry_lines as l', 'a.id', '=', 'l.accounting_account_id')
            ->select([
                'a.code',
                'a.name',
                'a.nature',
                'a.type',
                DB::raw('COALESCE(SUM(l.debit), 0) as total_debit'),
                DB::raw('COALESCE(SUM(l.credit), 0) as total_credit'),
            ])
            ->groupBy(['a.id', 'a.code', 'a.name', 'a.nature', 'a.type'])
            ->havingRaw('COALESCE(SUM(l.debit), 0) > 0 OR COALESCE(SUM(l.credit), 0) > 0')
            ->orderBy('a.code')
            ->get();

        $sumDebitMov = 0.0;
        $sumCreditMov = 0.0;
        $sumDebitBal = 0.0;
        $sumCreditBal = 0.0;

        $trialRows = $rows->map(function ($row) use (&$sumDebitMov, &$sumCreditMov, &$sumDebitBal, &$sumCreditBal) {
            $debitMov = (float) $row->total_debit;
            $creditMov = (float) $row->total_credit;

            $sumDebitMov += $debitMov;
            $sumCreditMov += $creditMov;

            $debitBal = 0.0;
            $creditBal = 0.0;

            if ($row->nature === 'D') {
                $net = $debitMov - $creditMov;
                if ($net >= 0) {
                    $debitBal = $net;
                } else {
                    $creditBal = abs($net);
                }
            } else {
                $net = $creditMov - $debitMov;
                if ($net >= 0) {
                    $creditBal = $net;
                } else {
                    $debitBal = abs($net);
                }
            }

            $sumDebitBal += $debitBal;
            $sumCreditBal += $creditBal;

            return [
                'code' => $row->code,
                'name' => $row->name,
                'nature' => $row->nature,
                'type' => $row->type,
                'debitMov' => round($debitMov, 2),
                'creditMov' => round($creditMov, 2),
                'debitBal' => round($debitBal, 2),
                'creditBal' => round($creditBal, 2),
            ];
        });

        $isBalanced = abs($sumDebitMov - $sumCreditMov) < 0.01 && abs($sumDebitBal - $sumCreditBal) < 0.01;

        return response()->json([
            'data' => [
                'accounts' => $trialRows,
                'totals' => [
                    'debitMov' => round($sumDebitMov, 2),
                    'creditMov' => round($sumCreditMov, 2),
                    'debitBal' => round($sumDebitBal, 2),
                    'creditBal' => round($sumCreditBal, 2),
                    'difference' => round(abs($sumDebitMov - $sumCreditMov), 2),
                    'isBalanced' => $isBalanced,
                ],
            ],
        ]);
    }
}
