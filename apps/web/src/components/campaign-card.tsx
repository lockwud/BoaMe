import { Clock, Gift, MapPin, PlayCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { CampaignSummary } from "@boame/shared-types";
import { formatGhs, progressPercent } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";

export function CampaignCard({ campaign }: { campaign: CampaignSummary }) {
  const percent = progressPercent(campaign.raisedAmount, campaign.goalAmount);
  const urgent = campaign.category === "EMERGENCY";
  const itemCount = campaign.requestedItems?.length ?? 0;
  const hasMedia = Boolean(campaign.campaignMedia?.length);
  const media = campaign.campaignMedia?.[0];

  return (
    <article className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-boame-light hover:shadow-[0_24px_54px_rgba(27,27,27,0.10)]">
      <div className="space-y-5">
        {media ? (
          <Link href={`/campaigns/${campaign.slug}`} className="relative block overflow-hidden rounded-xl bg-gray-100">
            {media.streamUrl ? (
              <video
                className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
                poster={media.thumbnailUrl}
                src={media.streamUrl}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" src={media.thumbnailUrl} alt="" />
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-xs font-black text-boame-deep shadow-sm">
              <span className={media.status === "LIVE" ? "h-2 w-2 animate-pulse rounded-full bg-red-500" : "h-2 w-2 rounded-full bg-boame-deep"} />
              {media.status === "LIVE" ? "Live preview" : "Video preview"}
            </span>
            <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-boame-deep shadow-sm">
              <PlayCircle size={22} />
            </span>
          </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#edf7ee] px-3 py-1 text-xs font-black text-boame-deep">{campaign.category}</span>
          {urgent ? <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-boame-urgent">Urgent</span> : null}
          {hasMedia ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-boame-soft px-3 py-1 text-xs font-black text-gray-700">
              <PlayCircle size={14} /> Media update
            </span>
          ) : null}
        </div>
        <div>
          <Link href={`/campaigns/${campaign.slug}`} className="text-xl font-black leading-tight text-boame-ink hover:text-boame-deep">
            {campaign.title}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{campaign.description}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-600">
          <span className="inline-flex items-center gap-1"><MapPin size={14} /> {campaign.location}</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> Verified</span>
          {itemCount ? <span className="inline-flex items-center gap-1"><Gift size={14} /> {itemCount} item needs</span> : null}
          {campaign.endDate ? <span className="inline-flex items-center gap-1"><Clock size={14} /> Active</span> : null}
        </div>
        <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-boame-deep">{formatGhs(campaign.raisedAmount)}</p>
            <p className="text-xs text-gray-500">raised of {formatGhs(campaign.goalAmount)}</p>
          </div>
          <p className="rounded-full bg-boame-soft px-3 py-1 text-sm font-black text-boame-ink">{percent}% funded</p>
        </div>
        <Link href={`/campaigns/${campaign.slug}`} className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-200 text-sm font-black text-boame-deep transition hover:border-boame-light hover:bg-boame-soft">
          View campaign
        </Link>
      </div>
    </article>
  );
}
