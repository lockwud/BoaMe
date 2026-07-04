"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { CampaignSummary } from "@boame/shared-types";
import { CampaignCard } from "./campaign-card";

export function FeaturedCampaignCarousel({ campaigns }: { campaigns: CampaignSummary[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function move(direction: "left" | "right") {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction === "right" ? 560 : -560, behavior: "smooth" });
  }

  return (
    <div className="relative mt-8">
      <div ref={scrollerRef} className="flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="w-[min(88vw,720px)] shrink-0 snap-start">
            <CampaignCard campaign={campaign} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-3">
        <button onClick={() => move("left")} className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-boame-deep shadow-sm transition hover:bg-boame-soft" aria-label="Previous campaign">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => move("right")} className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-boame-deep shadow-sm transition hover:bg-boame-soft" aria-label="Next campaign">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
