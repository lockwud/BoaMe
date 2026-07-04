"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/dashboard/admin");

  if (isAdminArea) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
