import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoaMe | Every ₵1 Makes a Difference",
  description: "Ghana's micro-donation platform for verified community assistance.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%232E7D32'/><path d='M16 24s-8-5.5-8-10c0-3 2.5-5 5-5 2 0 3 1 3 1s1-1 3-1c2.5 0 5 2 5 5 0 4.5-8 10-8 10z' fill='white'/></svg>",
        type: "image/svg+xml"
      }
    ]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
