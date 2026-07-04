"use client";

import { CheckCircle2, HeartHandshake, Loader2, ReceiptText, TrendingUp, WalletCards, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";
import { formatGhs } from "@/lib/utils";

type ApiData<T> = { data: T };

type FinancialReport = {
  summary: {
    donationTotal: number;
    payoutTotal: number;
    platformFees: number;
    netRaised: number;
    availableForPayout: number;
    donationCount: number;
    payoutCount: number;
  };
  ledger: Array<{
    id: string;
    type: "DONATION" | "PAYOUT";
    title: string;
    party: string;
    amount: number;
    fee: number;
    netAmount: number;
    status: string;
    reference: string;
    createdAt: string;
  }>;
  activeContributors: Array<{
    userId: string;
    name: string;
    email: string;
    phone: string;
    location?: string | null;
    totalDonated: number;
    donationCount: number;
    supportedCampaign: string;
    supportNeedSignal: boolean;
    review: { status: string; notes?: string | null };
  }>;
};

function unwrapData<T>(payload: T | ApiData<T>) {
  return payload && typeof payload === "object" && "data" in payload ? (payload as ApiData<T>).data : (payload as T);
}

const reviewOptions = ["WATCHLIST", "NEEDS_SUPPORT", "SUPPORT_REQUESTED", "CLEARED"] as const;

export function Reports() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [ledgerView, setLedgerView] = useState<"ALL" | "DEBIT" | "CREDIT">("ALL");
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPageSize = 10;

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);
      const data = await apiGet<FinancialReport | ApiData<FinancialReport>>("/admin/financial/reports");
      setReport(unwrapData(data));
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load financial reports");
    } finally {
      setLoading(false);
    }
  }

  async function markReview(userId: string, status: string) {
    try {
      setReviewingId(userId);
      await apiPost(`/admin/contributors/${userId}/support-review`, {
        status,
        notes: status === "NEEDS_SUPPORT" ? "Contributor may also need support. Review for beneficiary outreach." : undefined
      });
      await loadReport();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save contributor review");
    } finally {
      setReviewingId(null);
    }
  }

  const summaryCards: Array<[string, number, LucideIcon]> = report
    ? [
        ["Total donations", report.summary.donationTotal, ReceiptText],
        ["Net raised", report.summary.netRaised, TrendingUp],
        ["Platform fees", report.summary.platformFees, CheckCircle2],
        ["Available payout", report.summary.availableForPayout, WalletCards]
      ]
    : [];

  const filteredLedger = report?.ledger.filter((entry) => {
    if (ledgerView === "ALL") return true;
    if (ledgerView === "DEBIT") return entry.type === "PAYOUT";
    return entry.type === "DONATION";
  }) || [];

  const totalLedgerPages = Math.max(1, Math.ceil(filteredLedger.length / ledgerPageSize));
  const safeLedgerPage = Math.min(ledgerPage, totalLedgerPages);
  const ledgerStart = (safeLedgerPage - 1) * ledgerPageSize;
  const ledgerEnd = Math.min(ledgerStart + ledgerPageSize, filteredLedger.length);
  const paginatedLedger = filteredLedger.slice(ledgerStart, ledgerEnd);

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-boame-deep">
              <ReceiptText size={20} />
            </span>
            <div>
              <h2 className="text-lg font-black text-boame-ink">Financial reports</h2>
              <p className="mt-1 text-xs font-semibold text-gray-500">Donation income, payout movement, fees, ledger entries, and contributor support signals.</p>
            </div>
          </div>
          <button onClick={loadReport} className="focus-ring h-9 rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-boame-deep hover:bg-boame-soft">
            Refresh reports
          </button>
        </div>

        {message ? <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">{message}</div> : null}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm font-bold text-gray-500">
            <Loader2 className="animate-spin" size={17} />
            Loading accounting data...
          </div>
        ) : null}

        {report ? (
          <>
            <div className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-black text-boame-ink">General ledger</h3>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
                    {[
                      ["ALL", "All"],
                      ["DEBIT", "Debit"],
                      ["CREDIT", "Credit"]
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setLedgerView(value as "ALL" | "DEBIT" | "CREDIT")}
                        className={
                          ledgerView === value
                            ? "focus-ring rounded-md px-3 py-1.5 text-[11px] font-black text-white bg-boame-deep"
                            : "focus-ring rounded-md px-3 py-1.5 text-[11px] font-black text-gray-600 hover:bg-gray-50"
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="max-h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-[1fr_100px_100px_120px] border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-wide text-gray-600 sticky top-0">
                    <span>Transaction</span>
                    <span className="text-right">Type</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Status</span>
                  </div>
                  {paginatedLedger.map((entry) => (
                    <div key={`${entry.type}-${entry.id}`} className="grid grid-cols-[1fr_100px_100px_120px] border-b border-gray-100 px-4 py-3 text-xs last:border-b-0 md:items-center hover:bg-gray-50/50 transition">
                      <div className="min-w-0">
                        <p className="truncate font-black text-boame-ink">{entry.title}</p>
                        <p className="mt-0.5 truncate font-semibold text-gray-500">{entry.party}</p>
                        <p className="mt-0.5 truncate text-[10px] text-gray-400">{entry.reference}</p>
                      </div>
                      <p className="text-right font-bold text-gray-600">{entry.type}</p>
                      <p className={`text-right font-black ${entry.amount < 0 ? "text-red-700" : "text-boame-deep"}`}>{formatGhs(Math.abs(entry.amount))}</p>
                      <div className="text-right">
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-1 font-black text-gray-700">{entry.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {totalLedgerPages > 1 && (
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-xs font-semibold text-gray-500">
                    Showing {ledgerStart + 1}-{ledgerEnd} of {filteredLedger.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                      disabled={safeLedgerPage <= 1}
                      className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-700">
                      {safeLedgerPage} / {totalLedgerPages}
                    </span>
                    <button
                      onClick={() => setLedgerPage((p) => Math.min(totalLedgerPages, p + 1))}
                      disabled={safeLedgerPage >= totalLedgerPages}
                      className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
