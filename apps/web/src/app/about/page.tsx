import { HeartHandshake, Mail, Phone, ShieldCheck, WalletCards, Heart, Users, BadgeCheck, BarChart3 } from "lucide-react";
import Link from "next/link";

const stats = [
  ["Active campaigns", "12+", "Across Ghanaian communities"],
  ["Total raised", "₵84K+", "From verified donors"],
  ["Happy donors", "240+", "And growing every week"],
  ["Platform fee", "2.5%", "Keeps the lights on"]
];

const values = [
  [ShieldCheck, "Transparency", "Every donation, receipt, and campaign update is recorded and traceable."],
  [Heart, "Community-first", "Built for Ghana — mobile money, local verification, giving circles, and item pledges."],
  [WalletCards, "Easy giving", "Donate from ₵1 via MoMo, card, bank transfer, or split a payment with friends."],
  [Users, "Verified campaigns", "Each campaign is checked before going live. No anonymous fundraising."]
] as const;

const team = [
  { name: "Kofi Mensah", role: "Platform lead", email: "oklement3@gmail.com" },
  { name: "Eugene Frimpong", role: "Operations", email: "genefrimpong22@gmail.com" }
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-boame-deep to-boame-green px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <HeartHandshake size={36} />
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tight">About BoaMe</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
            BoaMe makes everyday giving transparent, local, and accessible across Ghana. Donors and communities support verified campaigns with mobile money, card payments, item pledges, and group giving.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {stats.map(([label, value, detail]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-black text-boame-deep">{value}</p>
              <p className="mt-2 font-bold text-boame-ink">{label}</p>
              <p className="mt-1 text-sm text-gray-500">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Our values</p>
            <h2 className="mt-3 text-3xl font-black text-boame-ink">What drives BoaMe</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map(([Icon, title, text]) => (
              <article key={title} className="rounded-2xl border border-gray-200 bg-[#f9fbf9] p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-boame-soft text-boame-deep">
                  <Icon size={24} />
                </span>
                <h3 className="mt-4 text-lg font-black text-boame-ink">{title}</h3>
                <p className="mt-2 leading-7 text-gray-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Contact</p>
          <h2 className="mt-3 text-3xl font-black text-boame-ink">Get in touch</h2>
          <p className="mt-3 text-gray-600">Reach out to the team for support, partnerships, or campaign enquiries.</p>
        </div>
        <div className="mt-10 mx-auto max-w-2xl space-y-4">
          {team.map((person) => (
            <div key={person.email} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-boame-soft text-lg font-black text-boame-deep">
                {person.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div>
                <p className="font-black text-boame-ink">{person.name}</p>
                <p className="text-sm font-semibold text-gray-500">{person.role}</p>
                <a href={`mailto:${person.email}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-boame-deep hover:underline">
                  <Mail size={14} />
                  {person.email}
                </a>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-boame-soft text-boame-deep">
                <Phone size={22} />
              </span>
              <div>
                <p className="font-black text-boame-ink">Phone</p>
                <a href="tel:+23320045258" className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-boame-deep hover:underline">
                  <Phone size={14} />
                  +233 20 045 258
                </a>
                <span className="mx-2 text-gray-300">|</span>
                <a href="tel:+233256367090" className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-boame-deep hover:underline">
                  <Phone size={14} />
                  +233 25 636 7090
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-boame-deep px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <BadgeCheck size={36} className="mx-auto text-boame-gold" />
          <h2 className="mt-4 text-3xl font-black">Ready to start a campaign?</h2>
          <p className="mt-3 text-white/75">Submit your campaign for review — no account needed.</p>
          <Link href="/start" className="focus-ring mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-black text-boame-deep transition hover:bg-boame-gold">
            Start a campaign
          </Link>
        </div>
      </section>
    </>
  );
}
