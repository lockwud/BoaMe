"use client";

import { BadgeCheck, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, FileCheck2, FileImage, FileText, FileVideo, Loader2, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiDownload, apiGet, apiPost } from "@/lib/client-api";
import { formatGhs, progressPercent } from "@/lib/utils";

type AdminCampaign = {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  story?: string;
  category: string;
  status: string;
  raisedAmount: number;
  goalAmount: number;
  beneficiary: string;
  beneficiaryEmail?: string;
  beneficiaryPhone?: string;
  beneficiaryIdentityVerified?: boolean;
  beneficiaryVerificationStatus?: string;
  verificationStatus: string;
  verificationNotes?: string | null;
  location?: string;
  documents?: string[];
  evidenceFiles?: EvidenceDocument[];
  donations?: Array<{ id: string; amount: number; status: string; createdAt: string; donor?: { firstName: string; lastName: string; email?: string } }>;
  updates?: Array<{ id: string; title: string; content: string; createdAt: string }>;
  payoutRequests?: Array<{ id: string; amount: number; status: string; createdAt: string }>;
  counts?: { donations: number; updates: number; payoutRequests: number };
};

const PAGE_SIZE = 2;

type PaginatedCampaignsResponse = {
  data: AdminCampaign[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ApiData<T> = { data: T };

type EvidenceDocument = {
  id: string;
  name: string;
  type: string;
  mimeType?: string;
  url: string;
  fileSize?: number | null;
  notes?: string | null;
  uploadedBy?: string | null;
  uploadedAt: string;
  downloadUrl: string;
};

function normalizeCampaignsResponse(payload: AdminCampaign[] | PaginatedCampaignsResponse | ApiData<AdminCampaign[]>) {
  if (Array.isArray(payload)) return payload;
  return payload.data;
}

function verificationTone(status: string) {
  if (status === "VERIFIED") return "bg-green-50 text-boame-deep";
  if (status === "REJECTED") return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
}

function evidenceIcon(type: string) {
  if (type === "IMAGE") return FileImage;
  if (type === "VIDEO") return FileVideo;
  return FileText;
}

function evidenceLabel(type: string) {
  if (type === "PDF") return "PDF";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function formatFileSize(size?: number | null) {
  if (!size) return "Size pending";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function CampaignVerification({ searchQuery = "" }: { searchQuery?: string }) {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<EvidenceDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);
      const data = normalizeCampaignsResponse(await apiGet<AdminCampaign[] | PaginatedCampaignsResponse | ApiData<AdminCampaign[]>>("/admin/campaigns?page=1&pageSize=50"));
      setCampaigns(data);
      setSelectedId((current) => (current && data.some((campaign) => campaign.id === current) ? current : null));
      setMessage(null);
    } catch (error) {
      setCampaigns([]);
      setSelectedId(null);
      setMessage(error instanceof Error ? error.message : "Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCampaign(campaignId: string) {
    try {
      setProcessingId(campaignId);
      const response = await apiPost<{ message: string }>(`/admin/campaigns/${campaignId}/verify`, {});
      setMessage(response.message);
      await loadCampaigns();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to verify campaign");
    } finally {
      setProcessingId(null);
    }
  }

  async function loadDocuments(campaignId: string) {
    try {
      setDocumentsLoading(true);
      const response = await apiGet<ApiData<EvidenceDocument[]>>(`/admin/campaigns/${campaignId}/documents`);
      setDocuments(response.data);
    } catch (error) {
      setDocuments([]);
      setMessage(error instanceof Error ? error.message : "Failed to load evidence documents.");
    } finally {
      setDocumentsLoading(false);
    }
  }

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedId) ?? null,
    [campaigns, selectedId]
  );
  const filteredCampaigns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return campaigns;
    return campaigns.filter((campaign) =>
      [campaign.title, campaign.beneficiary, campaign.location ?? "", campaign.category, campaign.verificationStatus]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [campaigns, searchQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const visibleCampaigns = filteredCampaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startItem = filteredCampaigns.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, filteredCampaigns.length);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedCampaign) loadDocuments(selectedCampaign.id);
    else setDocuments([]);
  }, [selectedCampaign?.id]);

  if (selectedCampaign) {
    const percent = progressPercent(selectedCampaign.raisedAmount, selectedCampaign.goalAmount);
    const donations = selectedCampaign.donations ?? [];
    const updates = selectedCampaign.updates ?? [];
    const payouts = selectedCampaign.payoutRequests ?? [];

    return (
      <section className="rounded-lg border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="focus-ring inline-flex h-9 w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 transition hover:bg-gray-50"
          >
            <ChevronLeft size={15} />
            Back to campaigns
          </button>
          {selectedCampaign.verificationStatus !== "VERIFIED" ? (
            <button
              onClick={() => verifyCampaign(selectedCampaign.id)}
              disabled={Boolean(processingId)}
              className="focus-ring inline-flex h-9 w-fit items-center justify-center gap-2 rounded-full bg-boame-deep px-5 text-xs font-black text-white transition hover:bg-boame-green disabled:opacity-60"
            >
              {processingId === selectedCampaign.id ? <Loader2 className="animate-spin" size={15} /> : <BadgeCheck size={15} />}
              Verify campaign
            </button>
          ) : (
            <span className="inline-flex h-9 w-fit items-center gap-2 rounded-full bg-green-50 px-5 text-xs font-black text-boame-deep">
              <BadgeCheck size={15} />
              Verified
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-boame-deep">Campaign review</p>
              <h1 className="mt-2 max-w-3xl text-2xl font-black leading-tight text-boame-ink">{selectedCampaign.title}</h1>
              <p className="mt-2 text-sm font-semibold text-gray-500">{selectedCampaign.location ?? "Location pending"}</p>
              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-gray-600">{selectedCampaign.description ?? selectedCampaign.story ?? "No campaign description provided."}</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-black ${verificationTone(selectedCampaign.verificationStatus)}`}>
              {selectedCampaign.verificationStatus}
            </span>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_1fr]">
            <section className="space-y-6">
              <div>
                <h2 className="text-sm font-black text-boame-ink">Funding</h2>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500">Raised</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{formatGhs(selectedCampaign.raisedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Goal</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{formatGhs(selectedCampaign.goalAmount)}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>Campaign progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-boame-green" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-black text-boame-ink">Beneficiary identity</h2>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500">Name</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedCampaign.beneficiary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Identity status</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedCampaign.beneficiaryVerificationStatus ?? "PENDING"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Email</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedCampaign.beneficiaryEmail ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Phone</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedCampaign.beneficiaryPhone ?? "Not provided"}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-black text-boame-ink">Evidence and audit trail</h2>
              {[
                ["Campaign evidence", `${documents.length || selectedCampaign.evidenceFiles?.length || selectedCampaign.documents?.length || 0} evidence files attached`],
                ["Donation trail", `${donations.length} recent donation records loaded from Prisma`],
                ["Payout readiness", `${payouts.length} payout request records connected to this campaign`]
              ].map(([title, detail]) => (
                <div key={title} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
                  <CheckCircle2 className="mt-0.5 text-boame-deep" size={17} />
                  <div>
                    <p className="text-sm font-black text-boame-ink">{title}</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">{detail}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-boame-ink">Evidence documents</h3>
                    <p className="mt-1 text-xs font-semibold text-gray-500">Review images, PDFs, videos, reports, receipts, and supporting documents.</p>
                  </div>
                  {documentsLoading ? <Loader2 className="animate-spin text-gray-400" size={17} /> : null}
                </div>
                <div className="mt-4 space-y-3">
                  {documents.map((document, index) => {
                    const Icon = evidenceIcon(document.type);

                    return (
                    <div key={document.id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-boame-deep">
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black text-boame-ink">{document.name}</p>
                              <span className="rounded-full bg-boame-soft px-2 py-0.5 text-[10px] font-black text-boame-deep">{evidenceLabel(document.type)}</span>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-gray-500">
                              {document.mimeType ?? "File"} • {formatFileSize(document.fileSize)} • {new Date(document.uploadedAt).toLocaleDateString()}
                            </p>
                            {document.notes ? <p className="mt-2 text-xs font-semibold leading-5 text-gray-600">{document.notes}</p> : null}
                            <p className="mt-1 truncate text-[11px] font-semibold text-gray-400">{document.url}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => window.open(document.url, "_blank", "noopener,noreferrer")}
                            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 transition hover:bg-gray-50"
                          >
                            <ExternalLink size={13} />
                            View
                          </button>
                          <button
                            onClick={() => apiDownload(document.downloadUrl, `${selectedCampaign.slug ?? selectedCampaign.id}-evidence-${index + 1}`)}
                            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full bg-boame-deep px-3 text-xs font-black text-white transition hover:bg-boame-green"
                          >
                            <Download size={13} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                  {!documentsLoading && documents.length === 0 ? <p className="text-xs font-semibold text-gray-500">No evidence documents attached yet.</p> : null}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-black text-boame-ink">Updates</h3>
                <div className="mt-3 space-y-3">
                  {updates.length ? updates.map((update) => (
                    <div key={update.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <p className="text-xs font-black text-boame-ink">{update.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold text-gray-500">{update.content}</p>
                    </div>
                  )) : <p className="text-xs font-semibold text-gray-500">No updates attached yet.</p>}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
        <div className="rounded-lg border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-boame-soft text-boame-deep">
                <FileCheck2 size={20} />
              </span>
              <div>
                <h1 className="text-lg font-black text-boame-ink">Campaign verification</h1>
                <p className="mt-1 text-xs font-semibold text-gray-500">Click a campaign to review identity, evidence, and payout readiness.</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black text-boame-deep">
              <ShieldCheck size={14} />
              Protected review
            </span>
          </div>

          {message ? <div className="mx-5 mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">{message}</div> : null}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm font-bold text-gray-500">
              <Loader2 className="animate-spin" size={17} />
              Loading campaigns...
            </div>
          ) : null}

          <div className="max-h-[520px] space-y-3 overflow-y-auto p-5">
            {!loading && visibleCampaigns.map((campaign) => {
              const percent = progressPercent(campaign.raisedAmount, campaign.goalAmount);

              return (
                <button
                  key={campaign.id}
                  onClick={() => setSelectedId(campaign.id)}
                  className="focus-ring w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-boame-light hover:bg-[#fbfdfb] hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-black text-boame-ink">{campaign.title}</h2>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${verificationTone(campaign.verificationStatus)}`}>
                          {campaign.verificationStatus}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-gray-500">
                        <span className="inline-flex items-center gap-1"><UserRound size={13} /> {campaign.beneficiary}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={13} /> {campaign.location ?? "Location pending"}</span>
                        <span>{campaign.category}</span>
                      </div>
                      <div className="mt-4 max-w-xl">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                          <span>{formatGhs(campaign.raisedAmount)} raised</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-boame-green" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                      <div className="text-left lg:text-right">
                        <p className="text-xs font-bold text-gray-500">Goal</p>
                        <p className="mt-1 text-sm font-black text-boame-ink">{formatGhs(campaign.goalAmount)}</p>
                      </div>
                      <ChevronRight className="text-gray-300" size={18} />
                    </div>
                  </div>
                </button>
              );
            })}

            {!loading && filteredCampaigns.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                <BadgeCheck size={40} className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm font-bold text-gray-600">No campaigns found</p>
              </div>
            ) : null}
          </div>

          {!loading && filteredCampaigns.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-xs font-semibold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {startItem}-{endItem} of {filteredCampaigns.length} campaigns
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <span className="rounded-full bg-gray-50 px-3 py-1.5 font-black text-gray-700">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages}
                  className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

    </section>
  );
}
