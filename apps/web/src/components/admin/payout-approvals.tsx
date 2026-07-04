"use client";

import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Loader2, ShieldCheck, WalletCards, X, Edit3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";
import { formatGhs } from "@/lib/utils";

type AdminPayout = {
  id: string;
  campaignTitle: string;
  amount: number;
  status: string;
  destination: string;
  requestedBy?: string;
  method?: string;
  requestedAt?: string;
};

type PaginatedPayoutsResponse = {
  data: AdminPayout[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ApiData<T> = { data: T };

const PAGE_SIZE = 6;
const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function statusTone(status: string) {
  if (status === "PENDING") return "bg-[#edf7ee] text-boame-deep ring-1 ring-green-100";
  if (status === "APPROVED") return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return "bg-red-50 text-red-600 ring-1 ring-red-100";
}

function normalizePayoutsResponse(payload: AdminPayout[] | PaginatedPayoutsResponse | ApiData<AdminPayout[]>, requestedPage: number, requestedPageSize: number) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      page: requestedPage,
      pageSize: requestedPageSize,
      total: payload.length,
      totalPages: Math.max(1, Math.ceil(payload.length / requestedPageSize))
    };
  }

  if ("page" in payload) return payload;

  return {
    data: payload.data,
    page: requestedPage,
    pageSize: requestedPageSize,
    total: payload.data.length,
    totalPages: Math.max(1, Math.ceil(payload.data.length / requestedPageSize))
  };
}

function PayoutSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0 md:grid-cols-[1fr_140px] md:items-center">
          <div className="flex gap-3">
            <span className="h-9 w-9 rounded-full bg-gray-100" />
            <span className="space-y-2">
              <span className="block h-3 w-52 rounded-full bg-gray-100" />
              <span className="block h-3 w-32 rounded-full bg-gray-100" />
            </span>
          </div>
          <span className="ml-auto h-4 w-20 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function PayoutApprovals() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [status, setStatus] = useState("ALL");
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
  const [editingAmount, setEditingAmount] = useState<string>("");

  useEffect(() => {
    loadPayouts(page, status);
  }, [page, status]);

  async function loadPayouts(nextPage = page, nextStatus = status) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
        status: nextStatus
      });
      const data = normalizePayoutsResponse(await apiGet<AdminPayout[] | PaginatedPayoutsResponse | ApiData<AdminPayout[]>>(`/admin/payouts?${params.toString()}`), nextPage, PAGE_SIZE);
      setPayouts(data.data);
      setSelectedId((current) => (data.data.some((payout) => payout.id === current) ? current : data.data[0]?.id ?? null));
      setPagination({ page: data.page, pageSize: data.pageSize, total: data.total, totalPages: Math.max(1, data.totalPages) });
      setMessage(null);
    } catch (error) {
      setPayouts([]);
      setSelectedId(null);
      setPagination({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
      setMessage(error instanceof Error ? error.message : "Failed to load payouts.");
    } finally {
      setLoading(false);
    }
  }

  async function approvePayout(payoutId: string, customAmount?: number) {
    try {
      setProcessingId(payoutId);
      const response = await apiPost<{ message: string }>(`/admin/payouts/${payoutId}/approve`, customAmount ? { amount: customAmount } : {});
      setMessage(response.message);
      setEditingAmount("");
      await loadPayouts(page, status);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to approve payout");
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectPayout(payoutId: string) {
    try {
      setProcessingId(payoutId);
      const response = await apiPost<{ message: string }>(`/admin/payouts/${payoutId}/reject`, {});
      setMessage(response.message);
      await loadPayouts(page, status);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to reject payout");
    } finally {
      setProcessingId(null);
    }
  }

  const selectedPayout = useMemo(() => payouts.find((payout) => payout.id === selectedId) ?? payouts[0], [payouts, selectedId]);
  const pendingTotal = payouts.filter((payout) => payout.status === "PENDING").reduce((total, payout) => total + payout.amount, 0);
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <div className="rounded-lg border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
              <WalletCards size={20} />
            </span>
            <div>
              <h1 className="text-lg font-black text-boame-ink">Payout approvals</h1>
              <p className="mt-1 text-xs font-semibold text-gray-500">Click a payout to review beneficiary transfer details.</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setStatusOpen((open) => !open)}
              className="focus-ring inline-flex h-9 min-w-36 items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 transition hover:bg-gray-50"
              aria-expanded={statusOpen}
            >
              {status === "ALL" ? "All status" : status}
              <ChevronDown size={14} />
            </button>
            {statusOpen ? (
              <div className="absolute right-0 top-11 z-20 w-40 rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                {statuses.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => {
                      setPage(1);
                      setStatus(nextStatus);
                      setStatusOpen(false);
                    }}
                    className={
                      status === nextStatus
                        ? "focus-ring flex h-9 w-full items-center rounded-lg bg-gray-50 px-3 text-left text-xs font-black text-boame-deep"
                        : "focus-ring flex h-9 w-full items-center rounded-lg px-3 text-left text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                    }
                  >
                    {nextStatus === "ALL" ? "All status" : nextStatus}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {message ? <div className="mx-5 mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">{message}</div> : null}

        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_140px] border-b border-gray-100 px-5 py-3 text-[11px] font-black uppercase tracking-wide text-gray-400">
            <span>Transaction</span>
            <span className="text-right">Amount</span>
          </div>

          {loading ? <PayoutSkeleton /> : null}

          {!loading && payouts.map((payout) => {
            const selected = selectedPayout?.id === payout.id;

            return (
              <button
                key={payout.id}
                onClick={() => setSelectedId(payout.id)}
                className={
                  selected
                    ? "focus-ring grid w-full gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 text-left last:border-b-0 md:grid-cols-[1fr_140px] md:items-center"
                    : "focus-ring grid w-full gap-3 border-b border-gray-100 bg-white px-5 py-4 text-left transition hover:bg-gray-50/70 last:border-b-0 md:grid-cols-[1fr_140px] md:items-center"
                }
              >
                <span className="flex min-w-0 gap-3">
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-black text-gray-700">
                    {payout.requestedBy?.slice(0, 2).toUpperCase() ?? "PY"}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-black text-boame-ink">{payout.campaignTitle}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${statusTone(payout.status)}`}>{payout.status}</span>
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-gray-500">{payout.destination}</span>
                  </span>
                </span>
                <span className="text-right text-sm font-black text-boame-ink">{formatGhs(payout.amount)}</span>
              </button>
            );
          })}

          {!loading && payouts.length === 0 ? (
            <div className="py-16 text-center">
              <WalletCards size={38} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-bold text-gray-500">No payout records found.</p>
            </div>
          ) : null}
        </div>

        {!loading && payouts.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-xs font-semibold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {startItem}-{endItem} of {pagination.total} payouts
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="rounded-full bg-gray-50 px-3 py-1.5 font-black text-gray-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="flex min-h-[calc(100vh-9rem)] flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        {selectedPayout ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-500">Payout details</p>
                <h2 className="mt-2 text-xl font-black leading-tight text-boame-ink">{selectedPayout.campaignTitle}</h2>
                <p className="mt-2 text-sm font-semibold text-gray-500">{selectedPayout.destination}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${statusTone(selectedPayout.status)}`}>{selectedPayout.status}</span>
            </div>

            <div className="mt-6 space-y-4 border-b border-gray-100 pb-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500">Beneficiary</p>
                  <p className="mt-1 text-sm font-black text-boame-ink">{selectedPayout.requestedBy ?? "Beneficiary"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">Method</p>
                  <p className="mt-1 text-sm font-black text-boame-ink">{selectedPayout.method ?? "Transfer"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-gray-500">Amount</p>
                {editingAmount && selectedPayout.id === selectedId ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <input
                      type="number"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-black"
                      placeholder={String(selectedPayout.amount)}
                    />
                    <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newAmount = parseFloat(editingAmount);
                        if (!isNaN(newAmount) && newAmount > 0) {
                          approvePayout(selectedPayout.id, newAmount);
                        }
                      }}
                      className="flex-1 rounded-lg bg-boame-deep px-3 py-1.5 text-xs font-black text-white"
                    >
                      Save
                    </button>
                      <button
                        onClick={() => setEditingAmount("")}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm font-black text-boame-ink">{formatGhs(selectedPayout.amount)}</p>
                    {selectedPayout.status === "PENDING" && (
                      <button
                        onClick={() => setEditingAmount(String(selectedPayout.amount))}
                        className="rounded-lg border border-gray-200 p-1.5 transition hover:bg-gray-50"
                        title="Edit amount"
                      >
                        <Edit3 size={14} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-xs font-bold text-gray-500">Requested</p>
                <p className="mt-1 text-sm font-black text-boame-ink">{selectedPayout.requestedAt ?? "Today"}</p>
              </div>
            </div>

            <div className="mt-6 flex-1 space-y-3">
              {[
                ["Transfer check", "Destination details are ready for review"],
                ["Campaign balance", `${formatGhs(pendingTotal)} pending in this filtered view`],
                ["Approval trail", "Approve and reject actions are recorded by the admin API"]
              ].map(([title, detail]) => (
                <div key={title} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <ShieldCheck className="mt-0.5 text-boame-deep" size={17} />
                  <div>
                    <p className="text-sm font-black text-boame-ink">{title}</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedPayout.status === "PENDING" ? (
              <div className="mt-6 flex gap-2 pt-2">
                <button
                  onClick={() => approvePayout(selectedPayout.id)}
                  disabled={Boolean(processingId)}
                  className="focus-ring inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-boame-deep px-3 text-xs font-black text-white transition hover:bg-boame-green disabled:opacity-60"
                >
                  {processingId === selectedPayout.id ? <Loader2 className="animate-spin" size={13} /> : <CheckCircle2 size={13} />}
                  Approve
                </button>
                <button
                  onClick={() => rejectPayout(selectedPayout.id)}
                  disabled={Boolean(processingId)}
                  className="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-gray-200 px-3 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <X size={13} />
                  Reject
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-lg bg-gray-50 px-4 py-3 text-sm font-black text-gray-600">This payout is {selectedPayout.status.toLowerCase()}.</div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center">
            <WalletCards size={38} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-500">Select a payout to view details.</p>
          </div>
        )}
      </aside>
    </section>
  );
}
