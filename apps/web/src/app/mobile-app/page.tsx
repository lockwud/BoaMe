import { Bell, Gift, PlayCircle, ReceiptText, Smartphone, Users, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StoreBadge } from "@/components/store-badges";
import { QRCodeSVG } from "qrcode.react";

const features: Array<[LucideIcon, string, string]> = [
  [WalletCards, "Mobile money and cards", "Donate through MoMo, card, bank transfer, split payment, or group support."],
  [Gift, "Requested item pledges", "Support campaigns with food, tents, clothes, books, medicine, and other listed needs."],
  [PlayCircle, "Live campaign updates", "Watch campaign media inside the app and follow what is happening on the ground."],
  [ReceiptText, "Receipts and history", "Keep donation receipts, pledge records, payout updates, and saved campaigns in one place."],
  [Users, "Group support", "Families, classes, churches, offices, and alumni groups can give together."],
  [Bell, "Notifications", "Get payment confirmations, campaign updates, item delivery notes, and payout alerts."]
];

const towns: Array<[string, string, string]> = [
  ["Hamile", "24%", "13%"],
  ["Tumu", "46%", "8%"],
  ["Bolgatanga", "63%", "10%"],
  ["Wa", "28%", "24%"],
  ["Tamale", "50%", "33%"],
  ["Yendi", "70%", "36%"],
  ["Salaga", "60%", "47%"],
  ["Sunyani", "36%", "64%"],
  ["Kumasi", "48%", "72%"],
  ["Koforidua", "59%", "78%"],
  ["Ho", "75%", "76%"],
  ["Accra", "62%", "91%"],
  ["Cape Coast", "47%", "91%"],
  ["Takoradi", "32%", "88%"]
];

const mapCards = [
  ["Tamale", "GHS 32,000", "54%", "28%"],
  ["Kumasi", "GHS 56,321", "46%", "58%"],
  ["Accra", "210 campaigns", "63%", "79%"]
];

export default function MobileAppPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Mobile-first giving</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-boame-ink">Use BoaMe from the mobile app</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-gray-600">
            Donors and beneficiaries sign up in the app. Donate with mobile money, pledge requested items, join group support, receive confirmations, and follow live campaign updates.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <StoreBadge store="app-store" />
            <StoreBadge store="play-store" />
          </div>

          <div className="mt-8">
            <QRCodeSVG 
              value="exp://exp.host/@boame/boame" 
              size={150}
              bgColor="#ffffff"
              fgColor="#2E7D32"
              level="M"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Supported communities</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-boame-ink">Regions and towns BoaMe can support.</h2>
            <p className="mt-4 leading-7 text-gray-600">Campaigns can be mapped by town and region so donors understand where help is going.</p>
          </div>

          <div className="relative min-h-[560px] overflow-hidden rounded-lg bg-[#fbfcfb]">
            <div className="relative mx-auto aspect-[1067/1552] h-[530px] max-h-[72vh]">
              <img src="/ghana-map.png" alt="Dotted map of Ghana" className="h-full w-full select-none object-contain grayscale opacity-30" />
              <div
                className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply"
                style={{
                  backgroundImage: "radial-gradient(circle, #aeb4bb 0.95px, transparent 1.15px)",
                  backgroundSize: "7px 7px",
                  maskImage: "url('/ghana-map.png')",
                  WebkitMaskImage: "url('/ghana-map.png')",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center"
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-35"
                style={{
                  background: "radial-gradient(circle at 46% 58%, rgba(255,255,255,0.9) 0 13%, transparent 27%), radial-gradient(circle at 38% 82%, rgba(255,255,255,0.75) 0 9%, transparent 23%)",
                  maskImage: "url('/ghana-map.png')",
                  WebkitMaskImage: "url('/ghana-map.png')",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center"
                }}
              />

              {mapCards.map(([city, value, left, top]) => (
                <div
                  key={city}
                  className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-white shadow-[0_16px_32px_rgba(15,23,42,0.2)]"
                  style={{ left, top }}
                >
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full">
                    <span className="absolute inset-0 rounded-full border-[3px] border-gray-600" />
                    <span className="absolute inset-0 rounded-full border-[3px] border-boame-green border-r-transparent border-t-transparent" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold leading-none text-gray-100">{city}</span>
                    <span className="mt-1 block whitespace-nowrap text-xs font-black leading-none">{value}</span>
                  </span>
                </div>
              ))}

              {towns.map(([town, left, top]) => (
                <span
                  key={town}
                  className="absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-boame-deep shadow-sm ring-1 ring-gray-200"
                  style={{ left, top }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-boame-green ring-4 ring-boame-green/10" />
                  {town}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map(([Icon, title, text]) => (
          <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7ee] text-boame-deep">
              <Icon size={23} />
            </span>
            <h3 className="mt-4 text-lg font-black text-boame-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
