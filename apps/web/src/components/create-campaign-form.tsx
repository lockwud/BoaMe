"use client";

import { useState } from "react";
import { apiPost } from "@/lib/client-api";

const categories = ["MEDICAL", "EDUCATION", "EMERGENCY", "COMMUNITY", "BUSINESS", "OTHER"];

export function CreateCampaignForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [category, setCategory] = useState("MEDICAL");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await apiPost(
        "/campaigns/submit",
        {
          title,
          description,
          goalAmount: Number(goalAmount),
          category
        },
        { token: "" }
      );
      setStatus("Campaign submitted for review. An admin will review and publish it shortly.");
      setTitle("");
      setDescription("");
      setGoalAmount("");
      setCategory("MEDICAL");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Campaign submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-700">Campaign title</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-semibold placeholder:text-gray-400" placeholder="e.g. School fees for Akua" required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-700">Campaign description</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="focus-ring min-h-28 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold placeholder:text-gray-400" placeholder="Tell your story — what is the campaign about, who does it help, and how will the funds be used?" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">Goal amount (GHS)</label>
          <input value={goalAmount} onChange={(event) => setGoalAmount(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-semibold placeholder:text-gray-400" placeholder="e.g. 5000" type="number" min={1} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">Category</label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-semibold">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      {status ? <p className="rounded-xl bg-boame-soft px-4 py-3 text-sm font-bold text-boame-deep">{status}</p> : null}
      <button disabled={isSubmitting} className="focus-ring h-12 w-full rounded-full bg-boame-deep px-6 text-sm font-black text-white transition hover:bg-boame-green disabled:opacity-60">
        {isSubmitting ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}
