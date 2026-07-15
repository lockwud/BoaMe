import { notFound } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { BadgeCheck, Clock, HeartHandshake, MapPin, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/button";
import { DonationCheckout } from "@/components/donation-checkout";
import { getCampaign } from "@/lib/api";

export default async function CampaignDetailPage({ params }: { params: { slug: string } }) {
  const campaign = await getCampaign(params.slug);
  if (!campaign) notFound();

  return (
    <section>
      <div className="relative min-h-[430px]">
        <Image src={campaign.coverImage ?? ""} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 text-white sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-black uppercase tracking-wide backdrop-blur">
            <ShieldCheck size={16} />
            {campaign.category}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">{campaign.title}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-white/85">{campaign.description}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-white/85">
            <span className="inline-flex items-center gap-1"><MapPin size={16} /> {campaign.location}</span>
            <span className="inline-flex items-center gap-1"><BadgeCheck size={16} /> Verified beneficiary</span>
            {campaign.endDate ? <span className="inline-flex items-center gap-1"><Clock size={16} /> Accepting donations</span> : null}
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_400px] lg:px-8">
        <article className="space-y-6">
          <div className="surface rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-boame-soft">
                <BadgeCheck className="text-boame-deep" size={20} />
              </div>
              <h2 className="text-2xl font-black text-boame-ink">Campaign Story</h2>
            </div>
            <p className="mt-4 leading-8 text-gray-700 text-base">
              This campaign has been reviewed for beneficiary identity, supporting documents, and fundraising need. Donations are tracked transparently and campaign updates are shared with donors as progress is made.
            </p>
          </div>

          <div className="surface rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-boame-soft">
                <Clock className="text-boame-deep" size={20} />
              </div>
              <h2 className="text-2xl font-black text-boame-ink">Recent Updates</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border-2 border-boame-green/20 bg-boame-soft/50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-boame-deep/10">
                    <BadgeCheck className="text-boame-deep" size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-boame-ink">Verification complete</p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">BoaMe reviewers confirmed the beneficiary details and campaign documentation.</p>
                    <p className="mt-2 text-xs font-semibold text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="surface rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-boame-soft">
                <HeartHandshake className="text-boame-deep" size={20} />
              </div>
              <h2 className="text-2xl font-black text-boame-ink">Recent Donors</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { name: "Ama Mensah", amount: "₵50", time: "2 hours ago" },
                { name: "Kwame Asante", amount: "₵100", time: "5 hours ago" },
                { name: "Anonymous", amount: "₵25", time: "1 day ago" }
              ].map((donor) => (
                <div key={donor.name} className="rounded-xl border-2 border-gray-200 bg-white p-5 transition-all hover:border-boame-green hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-boame-soft">
                      <span className="text-lg font-black text-boame-deep">{donor.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-boame-ink">{donor.name}</p>
                      <p className="text-sm font-semibold text-boame-deep">{donor.amount}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">{donor.time}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
        <div>
          <DonationCheckout campaign={campaign} />
          <LinkButton href="/campaigns" variant="secondary" className="mt-4 w-full">Back to campaigns</LinkButton>
        </div>
      </div>
    </section>
  );
}
