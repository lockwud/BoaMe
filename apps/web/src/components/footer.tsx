import { HeartHandshake, Mail, Phone } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#102615] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-xl font-black">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-boame-gold text-boame-ink">
              <HeartHandshake size={24} />
            </span>
            BoaMe
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            Ghana's micro-donation platform for verified community assistance, daily giving, and transparent impact.
          </p>
          <div className="mt-5 space-y-2 text-sm text-white/65">
            <a href="tel:+23320045258" className="flex items-center gap-2 hover:text-boame-gold">
              <Phone size={14} /> +233 20 045 258
            </a>
            <a href="tel:+233256367090" className="flex items-center gap-2 hover:text-boame-gold">
              <Phone size={14} /> +233 25 636 7090
            </a>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FooterGroup title="Platform" links={[["Campaigns", "/campaigns"], ["Start a campaign", "/start"], ["How it works", "/how-it-works"]]} />
          <FooterGroup title="Support" links={[["Stories", "/stories"], ["About", "/about"], ["Contact", "/about"]]} />
          <FooterGroup title="Company" links={[["About", "/about"], ["How it works", "/how-it-works"], ["Privacy", "/privacy"]]} />
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-white/65 hover:text-boame-gold">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
