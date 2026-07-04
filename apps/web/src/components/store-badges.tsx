import Link from "next/link";

function AppleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 fill-current">
      <path d="M16.3 1.9c.1 1.2-.4 2.4-1.1 3.2-.8.9-2.1 1.6-3.2 1.5-.2-1.1.4-2.3 1.1-3.1.8-.9 2.1-1.6 3.2-1.6Zm3.7 16.4c-.6 1.3-.9 1.8-1.6 2.9-1 1.5-2.4 3.3-4.1 3.3-1.5 0-1.9-1-3.9-1s-2.5 1-3.9 1c-1.7 0-3-1.6-4-3.1-2.8-4.2-3.1-9.1-1.4-11.8 1.2-1.9 3-3 4.8-3 1.8 0 2.9 1 4.4 1 1.4 0 2.3-1 4.4-1 1.6 0 3.3.9 4.5 2.4-4 2.2-3.4 7.9.8 9.3Z" />
    </svg>
  );
}

function PlayStoreLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-8 w-8">
      <path fill="#34A853" d="M4.3 2.9c-.4.4-.6 1-.6 1.7v18.8c0 .7.2 1.3.6 1.7l10.9-11.1L4.3 2.9Z" />
      <path fill="#FBBC04" d="m18.8 10.2-3.6 3.8 3.7 3.8 4.9-2.8c1.5-.8 1.5-2.3 0-3.1l-5-2.7Z" />
      <path fill="#4285F4" d="M4.3 2.9 15.2 14l3.6-3.8L6.4 3.1c-.8-.5-1.5-.5-2.1-.2Z" />
      <path fill="#EA4335" d="M4.3 25.1c.6.4 1.3.3 2.1-.2l12.5-7.1-3.7-3.8L4.3 25.1Z" />
    </svg>
  );
}

type StoreBadgeProps = {
  store: "app-store" | "play-store";
  href?: string;
};

export function StoreBadge({ store, href = "/mobile-app" }: StoreBadgeProps) {
  const isApple = store === "app-store";

  return (
    <Link href={href} className="focus-ring inline-flex h-16 items-center gap-3 rounded-xl bg-boame-ink px-5 text-left text-white shadow-sm transition hover:bg-boame-deep">
      {isApple ? <AppleLogo /> : <PlayStoreLogo />}
      <span className="flex flex-col leading-none">
        <span className="text-xs font-bold leading-none">Get it on</span>
        <span className="mt-1 text-lg font-black leading-none">{isApple ? "App Store" : "Play Store"}</span>
      </span>
    </Link>
  );
}
