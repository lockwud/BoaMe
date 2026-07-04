import { progressPercent } from "@/lib/utils";

export function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const percent = progressPercent(raised, goal);

  return (
    <div aria-label={`${percent}% funded`} className="h-2.5 overflow-hidden rounded-full bg-gray-200">
      <div className="h-full rounded-full bg-boame-green transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}
