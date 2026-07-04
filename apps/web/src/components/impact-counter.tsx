import { formatGhs } from "@/lib/utils";

export function ImpactCounter({ label, value, money = false }: { label: string; value: number; money?: boolean }) {
  return (
    <div className="surface rounded-lg p-5">
      <div className="mb-4 h-1.5 w-12 rounded-full bg-boame-gold" />
      <p className="text-3xl font-black text-boame-deep">{money ? formatGhs(value) : value.toLocaleString("en-GH")}</p>
      <p className="mt-1 text-sm font-semibold text-gray-600">{label}</p>
    </div>
  );
}
