/**
 * OverviewStats Component
 * 
 * Displays key platform metrics in card format for the admin dashboard overview.
 * Shows total users, verified campaigns, monthly volume, and risk alerts.
 * Each card includes an icon, value, and descriptive subtitle.
 * 
 * @component
 * @example
 * <OverviewStats />
 */
"use client";

import { AlertTriangle, BarChart3, ClipboardCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Define the shape of each stat card
type StatCard = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

// Array of statistics to display on the dashboard
// These would typically come from an API call in production
const stats: StatCard[] = [
  {
    icon: Users,
    label: "Total users",
    value: "1,284",
    detail: "Donors, beneficiaries, and groups"
  },
  {
    icon: ClipboardCheck,
    label: "Verified campaigns",
    value: "42",
    detail: "Approved and active"
  },
  {
    icon: BarChart3,
    label: "Monthly volume",
    value: "₵92k",
    detail: "Processed this month"
  },
  {
    icon: AlertTriangle,
    label: "Risk alerts",
    value: "4",
    detail: "Needs review"
  }
];

/**
 * Renders a single statistics card with icon, value, and description
 */
function StatCardComponent({ icon: Icon, label, value, detail }: StatCard) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          {/* Label showing what the stat represents */}
          <p className="text-sm font-semibold text-gray-600">{label}</p>
          {/* Main value display */}
          <p className="mt-2 text-3xl font-black text-boame-ink">{value}</p>
        </div>
        {/* Icon container with light background */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
          <Icon className="text-gray-700" size={20} />
        </div>
      </div>
      {/* Additional context or subtitle */}
      <p className="mt-3 text-xs font-normal text-gray-500">{detail}</p>
    </article>
  );
}

/**
 * Main component that renders all overview statistics
 * Arranged in a responsive grid layout
 */
export function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCardComponent key={stat.label} {...stat} />
      ))}
    </div>
  );
}