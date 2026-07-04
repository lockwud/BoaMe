"use client";

import { HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

const adinkraSymbols = [
  { label: "Akoma", meaning: "love", x: "12%", y: "18%", size: "h-16 w-16", opacity: "opacity-20" },
  { label: "Nyame Dua", meaning: "protection", x: "34%", y: "12%", size: "h-11 w-11", opacity: "opacity-15" },
  { label: "Aya", meaning: "endurance", x: "58%", y: "20%", size: "h-14 w-14", opacity: "opacity-20" },
  { label: "Akoma Ntoaso", meaning: "understanding", x: "80%", y: "14%", size: "h-12 w-12", opacity: "opacity-15" },
  { label: "Akoma", meaning: "love", x: "22%", y: "40%", size: "h-10 w-10", opacity: "opacity-15" },
  { label: "Aya", meaning: "endurance", x: "46%", y: "42%", size: "h-20 w-20", opacity: "opacity-20" },
  { label: "Nyame Dua", meaning: "protection", x: "72%", y: "39%", size: "h-12 w-12", opacity: "opacity-15" },
  { label: "Akoma Ntoaso", meaning: "understanding", x: "13%", y: "67%", size: "h-14 w-14", opacity: "opacity-15" },
  { label: "Akoma", meaning: "love", x: "38%", y: "72%", size: "h-12 w-12", opacity: "opacity-15" },
  { label: "Nyame Dua", meaning: "protection", x: "64%", y: "70%", size: "h-16 w-16", opacity: "opacity-20" },
  { label: "Aya", meaning: "endurance", x: "86%", y: "62%", size: "h-10 w-10", opacity: "opacity-15" },
  { label: "Akoma Ntoaso", meaning: "understanding", x: "78%", y: "84%", size: "h-14 w-14", opacity: "opacity-15" }
];

function AdinkraSymbol({ label, className }: { label: string; className?: string }) {
  if (label === "Akoma") {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
        <path d="M32 53C22 44 12 36 12 25c0-7 5-12 12-12 4 0 7 2 8 5 1-3 4-5 8-5 7 0 12 5 12 12 0 11-10 19-20 28Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M32 22v23M23 30h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "Nyame Dua") {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
        <path d="M32 9v46M15 32h34M21 21l22 22M43 21 21 43" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="4" />
      </svg>
    );
  }

  if (label === "Aya") {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
        <path d="M32 54V12M32 25c-9-10-17-9-22-3 7 1 12 5 16 12M32 35c9-10 17-9 22-3-7 1-12 5-16 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 31c-6-3-12-2-17 3M32 39c6-3 12-2 17 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M19 18c7 0 13 5 13 14 0 9-6 14-13 14S6 41 6 32c0-9 6-14 13-14ZM45 18c7 0 13 5 13 14 0 9-6 14-13 14S32 41 32 32c0-9 6-14 13-14Z" stroke="currentColor" strokeWidth="4" />
      <path d="M25 32h14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function AdminPortalLoginShell() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f9f7]">
        <div className="absolute h-64 w-64 animate-ping rounded-full bg-boame-deep/10" />
        <div className="relative flex flex-col items-center text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-boame-deep text-white shadow-[0_28px_70px_rgba(46,125,50,0.22)]">
            <HeartHandshake size={50} />
          </span>
          <h1 className="mt-7 text-4xl font-black text-boame-ink">BoaMe</h1>
          <p className="mt-2 text-base font-black text-boame-deep">Verified support. Real impact.</p>
          <p className="mt-8 text-sm font-bold text-gray-500">Loading secure portal...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen overflow-hidden bg-white text-boame-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8faf8_100%)] p-6 sm:p-10 lg:min-h-screen">
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-boame-deep text-white">
              <HeartHandshake size={23} />
            </span>
            <div>
              <p className="text-lg font-black text-boame-deep">BoaMe</p>
              <p className="text-xs font-black uppercase tracking-wide text-gray-500">Admin portal</p>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 top-24 text-gray-300">
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200/60" />
            <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200/60" />
            {adinkraSymbols.map((symbol) => (
              <span
                key={`${symbol.label}-${symbol.x}-${symbol.y}`}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-gray-400 ${symbol.size} ${symbol.opacity}`}
                style={{ left: symbol.x, top: symbol.y }}
                title={`${symbol.label}: ${symbol.meaning}`}
              >
                <AdinkraSymbol label={symbol.label} className="h-3/5 w-3/5" />
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
