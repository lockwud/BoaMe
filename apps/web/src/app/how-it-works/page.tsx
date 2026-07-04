import { BadgeCheck, Banknote, Bell, Gift, HeartHandshake, Megaphone, Radio, ReceiptText, Smartphone, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LinkButton } from "@/components/button";
import { StoreBadge } from "@/components/store-badges";

const steps = [
  {
    title: "Choose a verified campaign",
    text: "Browse medical, education, shelter, emergency, and community campaigns reviewed for trust and local relevance.",
    Icon: BadgeCheck
  },
  {
    title: "Give money, items, or group support",
    text: "Support with MoMo, card, bank transfer, split payments, group donations, or requested items like food, tents, clothes, and books.",
    Icon: HeartHandshake
  },
  {
    title: "Track real impact",
    text: "Follow receipts, campaign media, item delivery notes, live updates, and beneficiary progress from the BoaMe mobile app.",
    Icon: Radio
  }
];

const flows: Array<[LucideIcon, string, string]> = [
  [Banknote, "Money donations", "MoMo, card, bank transfer, recurring support, and split payments."],
  [Gift, "Item pledges", "Donate requested supplies instead of cash when a campaign needs physical support."],
  [Users, "Group giving", "Families, classmates, churches, offices, and alumni groups can give together."],
  [ReceiptText, "Receipts", "Every successful donation or pledge keeps a clear record for the donor."],
  [Bell, "Updates", "Donors receive alerts when campaigns post proof, media, and delivery updates."],
  [Megaphone, "Beneficiary requests", "Beneficiaries submit needs and verification from the mobile app for review."]
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-12 text-center sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#edf7ee] px-3 py-1 text-sm font-black text-boame-deep">
            <Smartphone size={16} />
            Built for Ghanaian giving
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-boame-ink sm:text-6xl lg:text-7xl">
            How BoaMe turns support into real help
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            BoaMe makes it simple to find verified campaigns, donate money or requested items, join group support, and see what changed after people gave.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/mobile-app" className="h-12 rounded-full px-6 text-base">
              Get the mobile app
            </LinkButton>
            <LinkButton href="/campaigns" variant="secondary" className="h-12 rounded-full px-6 text-base">
              Browse campaigns
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Simple flow</p>
          <h2 className="mt-3 text-4xl font-black text-boame-ink">From campaign discovery to verified impact</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map(({ title, text, Icon }, index) => (
            <article key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-boame-deep text-lg font-black text-white">{index + 1}</div>
                <Icon className="text-boame-deep" size={24} />
              </div>
              <h3 className="mt-6 text-xl font-black text-boame-ink">{title}</h3>
              <p className="mt-3 leading-7 text-gray-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-boame-deep">One mobile experience</p>
            <h2 className="mt-3 text-4xl font-black text-boame-ink">Money, items, groups, and campaign updates in one place</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Donors and beneficiaries use the mobile app. The website explains BoaMe and lets visitors browse public campaigns, while actual signup, donations, requests, receipts, and updates happen in the app.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <StoreBadge store="app-store" />
              <StoreBadge store="play-store" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {flows.map(([Icon, title, text]) => (
              <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf7ee] text-boame-deep">
                  <Icon size={21} />
                </span>
                <h3 className="mt-4 font-black text-boame-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
