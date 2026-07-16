"use client";

import { useState, useRef } from "react";
import { ImagePlus, Paperclip, X } from "lucide-react";
import { apiUpload } from "@/lib/client-api";

const categories = ["MEDICAL", "EDUCATION", "EMERGENCY", "COMMUNITY", "BUSINESS", "OTHER"];

export function CreateCampaignForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [category, setCategory] = useState("MEDICAL");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handleDocumentsChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setDocuments((prev) => [...prev, ...files]);
    event.target.value = "";
  }

  function removeDocument(index: number) {
    setDocuments(documents.filter((_, i) => i !== index));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("story", story);
      formData.append("goalAmount", goalAmount);
      formData.append("category", category);
      if (location) formData.append("location", location);
      if (coverImage) formData.append("coverImage", coverImage);
      documents.forEach((file) => formData.append("documents", file));

      await apiUpload("/campaigns/submit", formData, { token: "" });
      setStatus("Campaign submitted for review. An admin will review and publish it shortly.");
      setTitle("");
      setDescription("");
      setStory("");
      setGoalAmount("");
      setCategory("MEDICAL");
      setLocation("");
      setCoverImage(null);
      setCoverPreview(null);
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
        <label className="mb-1.5 block text-sm font-bold text-gray-700">Full story</label>
        <textarea value={story} onChange={(event) => setStory(event.target.value)} className="focus-ring min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold placeholder:text-gray-400" placeholder="Tell the full story — who does this help, why is it needed, how will the funds be used?" required />
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
      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-700">Location <span className="font-normal text-gray-400">(optional)</span></label>
        <input value={location} onChange={(event) => setLocation(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-semibold placeholder:text-gray-400" placeholder="e.g. Accra, Greater Accra" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-700">Cover image <span className="font-normal text-gray-400">(optional)</span></label>
        <input ref={coverRef} onChange={handleCoverChange} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" />
        {coverPreview ? (
          <div className="relative mt-2 inline-block">
            <img src={coverPreview} alt="Cover preview" className="h-40 w-full rounded-xl object-cover" />
            <button type="button" onClick={() => { setCoverImage(null); setCoverPreview(null); }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => coverRef.current?.click()} className="focus-ring mt-2 flex h-32 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-500 transition hover:border-boame-deep hover:text-boame-deep">
            <ImagePlus size={22} /> Upload cover image
          </button>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700">Evidence documents <span className="font-normal text-gray-400">(optional)</span></label>
          <button type="button" onClick={() => docRef.current?.click()} className="inline-flex items-center gap-1 text-sm font-bold text-boame-deep hover:underline">
            <Paperclip size={16} /> Add files
          </button>
        </div>
        <input ref={docRef} onChange={handleDocumentsChange} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4" multiple />
        <p className="mt-1 text-xs text-gray-500">Photos, PDFs, or videos that support your campaign.</p>
        {documents.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {documents.map((file, index) => (
              <li key={index} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <Paperclip size={18} className="text-gray-400" />
                <span className="flex-1 truncate text-sm font-semibold text-gray-700">{file.name}</span>
                <span className="text-xs font-bold text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" onClick={() => removeDocument(index)} className="text-gray-400 hover:text-red-500">
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No files selected.</p>
        )}
      </div>
      {status ? <p className="rounded-xl bg-boame-soft px-4 py-3 text-sm font-bold text-boame-deep">{status}</p> : null}
      <button disabled={isSubmitting} className="focus-ring h-12 w-full rounded-full bg-boame-deep px-6 text-sm font-black text-white transition hover:bg-boame-green disabled:opacity-60">
        {isSubmitting ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}
