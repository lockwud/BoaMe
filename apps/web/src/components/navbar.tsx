import { HeartHandshake, Menu, Search } from "lucide-react";
import Link from "next/link";

const links = [
  ["Campaigns", "/campaigns"],
  ["How It Works", "/how-it-works"],
  ["Stories", "/stories"]
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-boame-deep">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-boame-deep text-white shadow-[0_10px_22px_rgba(46,125,50,0.22)]">
            <HeartHandshake aria-hidden size={23} />
          </span>
          BoaMe
        </Link>
        <div className="hidden items-center gap-5 lg:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-boame-soft hover:text-boame-deep">
              {label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <form action="/campaigns" className="relative">
            <input
              name="q"
              className="focus-ring h-10 w-56 rounded-full border border-gray-200 bg-white pl-4 pr-11 text-sm font-semibold text-boame-ink placeholder:text-gray-400"
              placeholder="Search campaigns"
              type="search"
            />
            <button type="submit" className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-600 transition hover:bg-boame-soft hover:text-boame-deep" aria-label="Search campaigns">
              <Search size={16} />
            </button>
          </form>
          <Link href="/mobile-app" className="focus-ring inline-flex h-10 items-center justify-center rounded-full bg-boame-deep px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(46,125,50,0.18)] transition hover:bg-boame-green">
            Get the app
          </Link>
        </div>
        <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
      </nav>
    </header>
  );
}
