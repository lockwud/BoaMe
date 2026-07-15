"use client";

import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  goalAmount: number;
  raisedAmount: number;
  location?: string;
  createdAt: string;
};

const categories = ["MEDICAL", "EDUCATION", "EMERGENCY", "COMMUNITY", "BUSINESS", "OTHER"];

export function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("COMMUNITY");
  const [goalAmount, setGoalAmount] = useState("1000");
  const [location, setLocation] = useState("");

  async function loadCampaigns() {
    try {
      setLoading(true);
      const data = await apiGet<Campaign[]>("/campaigns");
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCampaigns(); }, []);

  async function createCampaign(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiPost("/campaigns", {
        title,
        description,
        category,
        goalAmount: Number(goalAmount) || 0,
        location
      });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCategory("COMMUNITY");
      setGoalAmount("1000");
      setLocation("");
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }

  const filtered = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="focus-ring h-10 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-xs font-bold text-boame-ink placeholder:text-gray-400" placeholder="Search campaigns" />
        </div>
        <div className="flex gap-2">
          <button onClick={loadCampaigns} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-boame-deep transition hover:bg-boame-soft">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full bg-boame-deep px-4 text-xs font-black text-white shadow-[0_10px_24px_rgba(46,125,50,0.18)] transition hover:bg-boame-green">
            <Plus size={14} />
            New campaign
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-xs font-bold text-red-600 underline">Dismiss</button>
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={createCampaign} className="rounded-lg border border-gray-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
          <h3 className="text-base font-black text-boame-ink">Create new campaign</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-600">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="focus-ring mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-semibold" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-600">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="focus-ring mt-1 h-20 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="focus-ring mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-semibold">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600">Goal amount (GHS)</label>
              <input value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} className="focus-ring mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-semibold" type="number" min={1} required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="focus-ring mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-semibold" placeholder="e.g. Accra" />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" disabled={saving} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full bg-boame-deep px-5 text-xs font-black text-white shadow-[0_10px_24px_rgba(46,125,50,0.18)] transition hover:bg-boame-green disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none">
              {saving ? "Saving..." : "Create campaign"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-xs font-black text-gray-700 transition hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-black text-gray-500">No campaigns found.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-xs font-bold text-boame-deep underline">Create one</button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 font-black text-gray-600">Title</th>
                <th className="px-4 py-3 font-black text-gray-600">Category</th>
                <th className="px-4 py-3 font-black text-gray-600">Goal</th>
                <th className="px-4 py-3 font-black text-gray-600">Raised</th>
                <th className="px-4 py-3 font-black text-gray-600">Status</th>
                <th className="px-4 py-3 font-black text-gray-600">Location</th>
                <th className="px-4 py-3 font-black text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-50 transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-boame-ink">{campaign.title}</td>
                  <td className="px-4 py-3 text-gray-600">{campaign.category}</td>
                  <td className="px-4 py-3 font-bold text-boame-ink">GHS {campaign.goalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-boame-deep">GHS {campaign.raisedAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black ${
                      campaign.status === "ACTIVE" ? "bg-green-50 text-green-700" :
                      campaign.status === "PENDING_APPROVAL" ? "bg-yellow-50 text-yellow-700" :
                      campaign.status === "DRAFT" ? "bg-gray-100 text-gray-600" :
                      "bg-red-50 text-red-600"
                    }`}>{campaign.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{campaign.location || "—"}</td>
                  <td className="px-4 py-3">
                    <button className="focus-ring flex h-7 items-center gap-1 rounded-md border border-gray-200 px-2 text-[10px] font-bold text-gray-600 transition hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={12} />
                      Delete
                    </button>
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
