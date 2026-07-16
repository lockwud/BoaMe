"use client";

import { MapPin, Radio } from "lucide-react";

export function LiveCampaignPreview() {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] bg-black shadow-[0_28px_70px_rgba(27,27,27,0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(27,27,27,0.20)]">
      <iframe
        className="aspect-video w-full transition duration-500 group-hover:scale-[1.02]"
        src="https://www.youtube.com/embed/5k8Dx5A_qsc?autoplay=1&mute=1&loop=1&playlist=5k8Dx5A_qsc&controls=0&modestbranding=1&rel=0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white pointer-events-none">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black">
            <Radio size={14} /> LIVE UPDATE
          </p>
          <h3 className="mt-3 text-2xl font-black">Accra flood devastation</h3>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-white/82">
            <MapPin size={15} /> Accra, Greater Accra Region
          </p>
        </div>
      </div>
    </div>
  );
}
