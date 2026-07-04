"use client";

import { MapPin, Play, Radio } from "lucide-react";
import { useRef, useState } from "react";

export function LiveCampaignPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setPlaying] = useState(true);

  async function play() {
    try {
      await videoRef.current?.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function pause() {
    videoRef.current?.pause();
    setPlaying(false);
  }

  async function toggle() {
    if (isPlaying) {
      pause();
      return;
    }

    await play();
  }

  return (
    <div className="group relative overflow-hidden rounded-[2rem] bg-black shadow-[0_28px_70px_rgba(27,27,27,0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(27,27,27,0.20)]" onMouseEnter={play} onMouseLeave={pause}>
      <video
        ref={videoRef}
        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80"
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      <button
        onClick={toggle}
        className="focus-ring absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-boame-deep shadow-lg transition hover:scale-105"
        aria-label={isPlaying ? "Pause live preview" : "Play live preview"}
      >
        <Play size={21} fill="currentColor" />
      </button>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black">
            <Radio size={14} /> LIVE UPDATE
          </p>
          <h3 className="mt-3 text-2xl font-black">Volta flood relief camp</h3>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-white/82">
            <MapPin size={15} /> South Tongu, Volta Region
          </p>
        </div>
      </div>
    </div>
  );
}
