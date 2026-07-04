import { BadgeCheck, Banknote, BookOpen, Briefcase, HeartPulse, Home, Megaphone, Radio, ShieldCheck, Smartphone } from "lucide-react";
import { FeaturedCampaignCarousel } from "@/components/featured-campaign-carousel";
import { LiveCampaignPreview } from "@/components/live-campaign-preview";
import { LinkButton } from "@/components/button";
import { StoreBadge } from "@/components/store-badges";
import { getFeaturedCampaigns } from "@/lib/api";

const categories = [
  { label: "Medical", icon: HeartPulse },
  { label: "Emergency", icon: Megaphone },
  { label: "Education", icon: BookOpen },
  { label: "Shelter", icon: Home },
  { label: "Small business", icon: Briefcase }
];

const steps = [
  ["Start your fundraiser", "Add your story, goal, requested items, photos, and verification documents in a guided setup."],
  ["Share with your people", "Send your campaign link on WhatsApp, social media, churches, workplaces, alumni groups, and family circles."],
  ["Receive money and items", "Track MoMo, card, bank transfer, offline pledges, item drop-offs, receipts, and campaign updates."]
];

export default async function HomePage() {
  const featured = await getFeaturedCampaigns();

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="/campaigns"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-black text-boame-ink shadow-sm transition hover:border-boame-light hover:bg-boame-soft"
              >
                <Icon size={16} className="text-boame-deep" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 text-center sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
          <div className="mx-auto">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#edf7ee] px-3 py-1 text-sm font-black text-boame-deep">
              <ShieldCheck size={16} />
              Ghana-first fundraising with verification
            </p>
            <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-boame-ink sm:text-6xl lg:text-7xl">
              Start and support fundraisers across Ghana
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              Raise money, collect requested items, and support verified campaigns with mobile money, card, bank transfer, group donations, and transparent updates.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <LinkButton href="/mobile-app" className="h-12 gap-2 rounded-full px-6 text-base">
                Get the mobile app
              </LinkButton>
              <LinkButton href="/campaigns" variant="secondary" className="h-12 rounded-full px-6 text-base">
                Browse campaigns
              </LinkButton>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm font-bold text-gray-700">
              <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-boame-deep" /> Verified campaigns</span>
              <span className="inline-flex items-center gap-2"><Smartphone size={17} className="text-boame-deep" /> MoMo ready</span>
              <span className="inline-flex items-center gap-2"><Banknote size={17} className="text-boame-deep" /> No fee to start</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <LiveCampaignPreview />
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-black text-red-700">
              <Radio size={16} /> Live campaign media
            </p>
            <h2 className="mt-4 text-4xl font-black text-boame-ink">Show donors what is happening on the ground</h2>
            <p className="mt-3 text-sm font-black uppercase tracking-wide text-boame-deep">South Tongu, Volta Region</p>
            <p className="mt-4 leading-8 text-gray-600">
              BoaMe campaigns can include live or recorded updates from relief camps, classrooms, hospitals, and item distribution points so donors see the real progress behind every cedi and item pledge.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-wide text-boame-deep">How it works</p>
          <h2 className="mt-3 text-4xl font-black text-boame-ink">Fundraising on BoaMe is simple, local, and trackable</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map(([title, text], index) => (
            <article key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-boame-deep text-lg font-black text-white">{index + 1}</div>
              <h3 className="mt-6 text-xl font-black text-boame-ink">{title}</h3>
              <p className="mt-3 leading-7 text-gray-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Popular fundraisers</p>
              <h2 className="mt-2 text-4xl font-black text-boame-ink">Featured campaigns</h2>
              <p className="mt-2 max-w-2xl text-gray-600">Browse verified Ghanaian needs across medical care, education, emergency relief, and item support.</p>
            </div>
            <LinkButton href="/campaigns" variant="secondary" className="rounded-full">See all campaigns</LinkButton>
          </div>
          <FeaturedCampaignCarousel campaigns={featured} />
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Built for Ghana</p>
            <h2 className="mt-3 text-4xl font-black text-boame-ink">Give, receive, and follow every update from the BoaMe app.</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Donors can support campaigns with MoMo, card, bank transfer, group gifts, split payments, or requested items. Beneficiaries can share updates, manage item needs, and request payouts from the same mobile experience.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <StoreBadge store="app-store" />
              <StoreBadge store="play-store" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["For donors", "Receipts, donation history, group gifts, item pledges, and saved campaigns."],
              ["For beneficiaries", "Campaign updates, live media, requested items, and payout requests."],
              ["For communities", "Transparent progress, trusted updates, and local support that is easy to follow."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <Smartphone className="text-boame-deep" />
                <h3 className="mt-4 font-black text-boame-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
