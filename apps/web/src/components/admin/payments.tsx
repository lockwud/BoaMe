"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/client-api";

type Payment = {
  id: string;
  campaignTitle: string;
  amount: number;
  status: string;
  paymentMethod: string;
  donor: string;
  createdAt: string;
};

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPayments() {
    try {
      setLoading(true);
      const data = await apiGet<Payment[]>("/admin/donations");
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPayments(); }, []);

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payments.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
          <p className="text-xs font-bold text-gray-500">Total payments</p>
          <p className="mt-2 text-xl font-black text-boame-ink">{payments.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
          <p className="text-xs font-bold text-gray-500">Completed</p>
          <p className="mt-2 text-xl font-black text-green-700">{completedCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
          <p className="text-xs font-bold text-gray-500">Total volume</p>
          <p className="mt-2 text-xl font-black text-boame-deep">GHS {totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={loadPayments} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-boame-deep transition hover:bg-boame-soft">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-xs font-bold text-red-600 underline">Dismiss</button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-black text-gray-500">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 font-black text-gray-600">Donor</th>
                <th className="px-4 py-3 font-black text-gray-600">Campaign</th>
                <th className="px-4 py-3 font-black text-gray-600">Amount</th>
                <th className="px-4 py-3 font-black text-gray-600">Method</th>
                <th className="px-4 py-3 font-black text-gray-600">Status</th>
                <th className="px-4 py-3 font-black text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50 transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-boame-ink">{payment.donor}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.campaignTitle}</td>
                  <td className="px-4 py-3 font-bold text-boame-deep">GHS {payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.paymentMethod.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black ${
                      payment.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                      payment.status === "PENDING" ? "bg-yellow-50 text-yellow-700" :
                      "bg-red-50 text-red-600"
                    }`}>{payment.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
