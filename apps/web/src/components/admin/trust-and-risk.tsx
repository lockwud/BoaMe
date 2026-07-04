"use client";

import { AlertTriangle, Loader2, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";

type RiskAlert = {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  campaignId?: string;
  campaignTitle?: string;
  timestamp: string;
};

function alertTone(severity: RiskAlert["severity"]) {
  if (severity === "CRITICAL" || severity === "HIGH") return "border-red-100 bg-red-50/45 text-red-700";
  if (severity === "MEDIUM") return "border-amber-100 bg-amber-50/45 text-amber-700";
  return "border-gray-200 bg-gray-50 text-gray-700";
}

function alertIcon(severity: RiskAlert["severity"]) {
  if (severity === "CRITICAL" || severity === "HIGH") return <AlertTriangle className="mt-0.5 text-red-500" size={18} />;
  return <Shield className="mt-0.5 text-gray-500" size={18} />;
}

export function TrustAndRisk() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const data = await apiGet<RiskAlert[]>("/admin/alerts");
      setAlerts(data);
      setMessage(null);
    } catch (error) {
      setAlerts([]);
      setMessage(error instanceof Error ? error.message : "Failed to load risk alerts");
    } finally {
      setLoading(false);
    }
  }

  async function dismissAlert(alertId: string) {
    try {
      setProcessingId(alertId);
      const response = await apiPost<{ message: string }>(`/admin/alerts/${alertId}/dismiss`, {});
      setMessage(response.message);
      await loadAlerts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to dismiss alert");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
            <Shield size={20} />
          </span>
          <div>
            <h1 className="text-lg font-black text-boame-ink">Trust and risk</h1>
            <p className="mt-1 text-xs font-semibold text-gray-500">Monitor platform security and flagged content.</p>
          </div>
        </div>
        {alerts.length > 0 ? (
          <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-black text-gray-600 ring-1 ring-gray-200">{alerts.length} active</span>
        ) : null}
      </div>

      {message ? <div className="mx-5 mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">{message}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-bold text-gray-500">
          <Loader2 className="animate-spin" size={17} />
          Loading risk alerts...
        </div>
      ) : null}

      {!loading && alerts.length > 0 ? (
        <div className="space-y-3 p-5">
          {alerts.map((alert) => (
            <article key={alert.id} className={`rounded-lg border p-4 ${alertTone(alert.severity)}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  {alertIcon(alert.severity)}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-black uppercase tracking-wide">{alert.type.replace(/_/g, " ")}</h2>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black ring-1 ring-current/10">{alert.severity}</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-gray-600">{alert.description}</p>
                    {alert.campaignTitle ? <p className="mt-1 text-xs font-bold text-gray-500">Campaign: {alert.campaignTitle}</p> : null}
                    <p className="mt-1 text-xs font-semibold text-gray-400">{alert.timestamp}</p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    disabled={Boolean(processingId)}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    {processingId === alert.id ? <Loader2 className="animate-spin" size={14} /> : "Dismiss"}
                  </button>
                  {alert.campaignId ? (
                    <button
                      onClick={() => {
                        window.location.href = `/campaigns/${alert.campaignId}`;
                      }}
                      className="focus-ring inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-gray-700 transition hover:bg-gray-50"
                    >
                      View campaign
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && alerts.length === 0 ? (
        <div className="p-10 text-center">
          <ShieldCheck size={40} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-black text-gray-600">No active risk alerts</p>
          <p className="mt-1 text-xs font-semibold text-gray-500">Platform checks are clear.</p>
        </div>
      ) : null}
    </section>
  );
}
