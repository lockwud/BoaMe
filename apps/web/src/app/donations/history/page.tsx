import { getDonationHistory } from "@/lib/api";
import { formatGhs } from "@/lib/utils";

export default async function DonationHistoryPage() {
  const donations = await getDonationHistory();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Receipts and impact</p>
      <h1 className="mt-2 text-4xl font-black text-boame-ink">Donation History</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {donations.length ? (
          <div className="divide-y divide-gray-100">
            {donations.map((donation) => (
              <div key={donation.reference} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-black text-boame-ink">{donation.campaignTitle}</p>
                  <p className="mt-1 text-sm font-bold text-gray-500">{donation.reference} · {donation.kind ?? "MONEY"} · {donation.mode ?? "INDIVIDUAL"}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-black text-boame-deep">{donation.kind === "ITEMS" ? "Item donation" : formatGhs(donation.amount)}</p>
                  <p className="text-xs font-black text-gray-500">{donation.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-gray-600">No donations yet.</div>
        )}
      </div>
    </section>
  );
}
