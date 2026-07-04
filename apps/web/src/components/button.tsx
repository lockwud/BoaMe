import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  primary: "bg-boame-deep text-white shadow-[0_10px_24px_rgba(46,125,50,0.24)] hover:bg-boame-green",
  secondary: "bg-white text-boame-deep ring-1 ring-gray-200 hover:bg-boame-soft hover:ring-boame-light",
  gold: "bg-boame-gold text-boame-ink shadow-[0_10px_24px_rgba(255,215,0,0.22)] hover:brightness-95"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof styles;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn("focus-ring inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold transition duration-200 active:translate-y-px", styles[variant], className)}
      {...props}
    />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: keyof typeof styles;
};

export function LinkButton({ className, variant = "primary", href, children, ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn("focus-ring inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold transition duration-200 active:translate-y-px", styles[variant], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
