"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { apiPost } from "@/lib/client-api";

const categories = ["MEDICAL", "EDUCATION", "EMERGENCY", "COMMUNITY", "BUSINESS", "OTHER"];

export function CreateCampaignForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [category, setCategory] = useState("MEDICAL");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  function addDocument() {
    setDocuments([...documents, ""]);
  }

  function updateDocument(index: number, value: string) {
    const next = [...documents];
    next[index] = value;
    setDocuments(next);
  }

  function removeDocument(index: number) {
    setDocuments(documents.filter((_, i) => i !== index));
  }

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
          story: story || undefined,
          goalAmount: Number(goalAmount),
          category,
          location: location || undefined,
          coverImage: coverImage || undefined,
          documents: documents.filter(Boolean)
        },
        { token: "" }
      );
      setStatus("Campaign submitted for review. An admin will review and publish it shortly.");
      setTitle("");
      setDescription("");
      setStory("");
      setGoalAmount("");
      setCategory("MEDICAL");
      setLocation("");
      setCoverImage("");
      setDocuments([]);
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
        <label className="mb-1.5 block text-sm font-bold text-gray-700">Short description</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="focus-ring min-h-24 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold placeholder:text-gray-400" placeholder="Brief summary of the campaign" required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-700">Full story <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea value={story} onChange={(event) => setStory(event.target.value)} className="focus-ring min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold placeholder:text-gray-400" placeholder="Tell the full story — who does this help, why is it needed, how will the funds be used?" />
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">Location <span className="font-normal text-gray-400">(optional)</span></label>
          <input value={location} onChange={(event) => setLocation(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-semibold placeholder:text-gray-400" placeholder="e.g. Accra, Greater Accra" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">Cover image URL <span className="font-normal text-gray-400">(optional)</span></label>
          <input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-semibold placeholder:text-gray-400" placeholder="https://images.unsplash.com/..." type="url" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700">Evidence documents <span className="font-normal text-gray-400">(optional)</span></label>
          <button type="button" onClick={addDocument} className="inline-flex items-center gap-1 text-sm font-bold text-boame-deep hover:underline">
            <Plus size={16} /> Add document URL
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">Links to photos, PDFs, or other supporting files that verify your campaign.</p>
        {documents.map((url, index) => (
          <div key={index} className="mt-2 flex items-center gap-2">
            <input value={url} onChange={(event) => updateDocument(index, event.target.value)} className="focus-ring h-10 flex-1 rounded-xl border border-gray-300 px-4 text-sm font-semibold placeholder:text-gray-400" placeholder="https://..." type="url" />
            <button type="button" onClick={() => removeDocument(index)} className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
      {status ? <p className="rounded-xl bg-boame-soft px-4 py-3 text-sm font-bold text-boame-deep">{status}</p> : null}
      <button disabled={isSubmitting} className="focus-ring h-12 w-full rounded-full bg-boame-deep px-6 text-sm font-black text-white transition hover:bg-boame-green disabled:opacity-60">
        {isSubmitting ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}
