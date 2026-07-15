import { BadgeCheck, Banknote, Filter } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { getCampaigns } from "@/lib/api";

type CampaignsPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim().toLowerCase() ?? "";
  let campaigns: Awaited<ReturnType<typeof getCampaigns>> = [];
  try {
    campaigns = await getCampaigns();
  } catch {
    // API unavailable — no campaigns to show, no dummy data
  }
  const visibleCampaigns = query
    ? campaigns.filter((campaign) =>
        [campaign.title, campaign.description, campaign.location, campaign.category]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : campaigns;

  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-12 text-center sm:px-6 lg:px-8 lg:pb-14 lg:pt-16">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#edf7ee] px-3 py-1 text-sm font-black text-boame-deep">
            <Filter size={16} />
            Verified campaigns
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-boame-ink sm:text-6xl lg:text-7xl">
            Find a cause to support
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">Explore verified campaigns across Ghana and give from ₵1.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm font-bold text-gray-700">
            <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-boame-deep" /> Verified campaigns</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-boame-deep" /> MoMo ready</span>
            <span className="inline-flex items-center gap-2"><Banknote size={17} className="text-boame-deep" /> Give from ₵1</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {query ? <p className="mb-5 text-sm font-bold text-gray-600">Showing results for <span className="text-boame-deep">"{params?.q}"</span></p> : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
        </div>
        {visibleCampaigns.length === 0 ? <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center font-bold text-gray-600">No campaigns matched your search.</p> : null}
      </section>
    </>
  );
}
