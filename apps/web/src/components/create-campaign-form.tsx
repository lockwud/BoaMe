"use client";

import { useState } from "react";
import { apiPost, getStoredToken } from "@/lib/client-api";

const categories = ["MEDICAL", "EDUCATION", "EMERGENCY", "COMMUNITY", "BUSINESS", "OTHER"];

export function CreateCampaignForm() {
  const [title, setTitle] = useState("Emergency relief for Volta flood families");
  const [description, setDescription] = useState("We need support for food packs, tents, blankets, clothes, and medical care for displaced families.");
  const [goalAmount, setGoalAmount] = useState("65000");
  const [category, setCategory] = useState("EMERGENCY");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await apiPost(
        "/campaigns",
        {
          title,
          description,
          goalAmount: Number(goalAmount),
          category
        },
        { token: getStoredToken() }
      );
      setStatus("Campaign submitted for review. Admin can approve it from the dashboard.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Campaign submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-3" placeholder="Campaign title" required />
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="focus-ring min-h-32 w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Campaign story" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={goalAmount} onChange={(event) => setGoalAmount(event.target.value)} className="focus-ring h-12 rounded-xl border border-gray-300 px-3" placeholder="Goal amount (GHS)" type="number" min={1} required />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="focus-ring h-12 rounded-xl border border-gray-300 px-3">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {status ? <p className="rounded-xl bg-boame-soft px-3 py-2 text-sm font-bold text-boame-deep">{status}</p> : null}
      <button disabled={isSubmitting} className="focus-ring h-12 rounded-full bg-boame-deep px-5 font-bold text-white disabled:opacity-60">
        {isSubmitting ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}
