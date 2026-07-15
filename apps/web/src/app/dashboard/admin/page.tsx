"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Bell,
  ClipboardCheck,
  FileCheck2,
  HandCoins,
  HeartHandshake,
  LayoutDashboard,
  List,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Users,
  WalletCards
} from "lucide-react";
import { apiGet, apiPost, clearStoredSession } from "@/lib/client-api";
import { SkeletonPanel } from "@/components/admin/skeleton-panel";
import { SkeletonStats } from "@/components/admin/skeleton-stats";

const CampaignVerification = dynamic(
  () => import("@/components/admin/campaign-verification").then((module) => module.CampaignVerification),
  { ssr: false, loading: () => <SkeletonPanel /> }
);
const PayoutApprovals = dynamic(
  () => import("@/components/admin/payout-approvals").then((module) => module.PayoutApprovals),
  { ssr: false, loading: () => <SkeletonPanel /> }
);
const Reports = dynamic(
  () => import("@/components/admin/reports").then((module) => module.Reports),
  { ssr: false, loading: () => <SkeletonPanel /> }
);
const SettingsComponent = dynamic(
  () => import("@/components/admin/settings").then((module) => module.Settings),
  { ssr: false, loading: () => <SkeletonPanel /> }
);
const TrustAndRisk = dynamic(
  () => import("@/components/admin/trust-and-risk").then((module) => module.TrustAndRisk),
  { ssr: false, loading: () => <SkeletonPanel /> }
);
const UserManagement = dynamic(
  () => import("@/components/admin/user-management").then((module) => module.UserManagement),
  { ssr: false, loading: () => <SkeletonPanel /> }
);
const ManageCampaigns = dynamic(
  () => import("@/components/admin/manage-campaigns").then((module) => module.ManageCampaigns),
  { ssr: false, loading: () => <SkeletonPanel /> }
);
const PaymentsComponent = dynamic(
  () => import("@/components/admin/payments").then((module) => module.Payments),
  { ssr: false, loading: () => <SkeletonPanel /> }
);

type TabId = "overview" | "verification" | "campaigns" | "payments" | "payouts" | "users" | "reports" | "trust" | "settings";

const navGroups: Array<{
  title: string;
  links: Array<{ id: TabId; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }>;
}> = [
  {
    title: "Operations",
    links: [
      { id: "overview", icon: LayoutDashboard, label: "Overview" },
      { id: "campaigns", icon: List, label: "Campaigns" },
      { id: "payments", icon: WalletCards, label: "Payments" },
      { id: "payouts", icon: HandCoins, label: "Payouts" }
    ]
  },
  {
    title: "Oversight",
    links: [
      { id: "verification", icon: FileCheck2, label: "Verification" },
      { id: "users", icon: Users, label: "People" },
      { id: "reports", icon: BarChart3, label: "Reports" },
      { id: "trust", icon: Shield, label: "Trust & risk" },
      { id: "settings", icon: Settings, label: "Settings" }
    ]
  }
];

const statMeta = {
  "Submitted campaigns": { icon: ClipboardCheck, tone: "bg-boame-soft text-boame-deep" },
  "Verified live": { icon: BadgeCheck, tone: "bg-green-50 text-green-700" },
  "Payout queue": { icon: HandCoins, tone: "bg-gray-100 text-gray-700" },
  "Risk flags": { icon: AlertTriangle, tone: "bg-red-50 text-red-600" }
} satisfies Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; tone: string }>;

type OverviewStat = {
  label: string;
  value: string;
  detail: string;
};

type TownStat = {
  city: string;
  value: number;
  campaigns: number;
  x: string;
  y: string;
  belt: "Northern belt" | "Middle belt" | "Coastal belt";
};

type AdminSearchResult = {
  id: string;
  title: string;
  detail: string;
  tab: TabId;
  type: string;
};

type AdminNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const towns = [
  { name: "Hamile", x: "24%", y: "13%" },
  { name: "Tumu", x: "46%", y: "8%" },
  { name: "Bolgatanga", x: "63%", y: "10%" },
  { name: "Wa", x: "28%", y: "24%" },
  { name: "Tamale", x: "50%", y: "33%" },
  { name: "Yendi", x: "70%", y: "36%" },
  { name: "Salaga", x: "60%", y: "47%" },
  { name: "Sunyani", x: "36%", y: "64%" },
  { name: "Kumasi", x: "48%", y: "72%" },
  { name: "Koforidua", x: "59%", y: "78%" },
  { name: "Ho", x: "75%", y: "76%" },
  { name: "Accra", x: "62%", y: "91%" },
  { name: "Cape Coast", x: "47%", y: "91%" },
  { name: "Takoradi", x: "32%", y: "88%" }
];

function OverviewPanel({
  overviewStats,
  townStats,
  updatedAt,
  refreshing,
  onRefresh
}: {
  overviewStats: OverviewStat[];
  townStats: TownStat[];
  updatedAt: string;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const mergedStats = overviewStats.map((stat) => {
    const meta = statMeta[stat.label as keyof typeof statMeta] ?? { icon: ClipboardCheck, tone: "bg-gray-100 text-gray-700" };
    return { ...stat, ...meta };
  });
  const mapCards = townStats.slice(0, 3).map((town) => ({
      city: town.city,
      value: town.campaigns > 1 ? `${town.campaigns} campaigns` : `GHS ${Math.round(town.value).toLocaleString("en-US")}`,
      x: town.x,
      y: town.y
    }));
  const belts = ["Northern belt", "Middle belt", "Coastal belt"].map((belt) => {
    const items = townStats.filter((town) => town.belt === belt);
    return [belt, `${items.length} towns`, items.map((town) => town.city).join(", ") || "No campaign records yet"];
  });
  const activeBelts = new Set(townStats.map((town) => town.belt)).size;
  const campaignCount = townStats.reduce((total, town) => total + town.campaigns, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <p className="font-bold text-gray-500">Updated</p>
            <p className="mt-1 font-black text-boame-ink">{updatedAt}</p>
          </div>
          <button onClick={onRefresh} disabled={refreshing} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-boame-deep transition hover:bg-boame-soft disabled:opacity-60">
            <RefreshCw className={refreshing ? "animate-spin" : ""} size={14} />
            Refresh
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mergedStats.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500">{label}</p>
                <p className="mt-2 text-xl font-black text-boame-ink">{value}</p>
              </div>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-gray-500">{detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-black text-boame-ink">Campaign towns</h2>
            <p className="mt-1 text-xs font-semibold text-gray-500">Verified campaign activity across Ghanaian towns.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_260px]">
          <div className="relative min-h-[620px] overflow-hidden rounded-lg bg-[#fbfcfb] px-4 py-6">
            <div className="relative mx-auto aspect-[1067/1552] h-[575px] max-h-[76vh]">
              <img src="/ghana-map.png" alt="Dotted map of Ghana" className="h-full w-full select-none object-contain grayscale opacity-35" />
              <div
                className="pointer-events-none absolute inset-0 opacity-42 mix-blend-multiply"
                style={{
                  backgroundImage: "radial-gradient(circle, #aeb4bb 1.05px, transparent 1.25px)",
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
                className="pointer-events-none absolute inset-0 opacity-38"
                style={{
                  background: "radial-gradient(circle at 46% 58%, rgba(255,255,255,0.95) 0 14%, transparent 28%), radial-gradient(circle at 38% 82%, rgba(255,255,255,0.72) 0 10%, transparent 24%)",
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

              {mapCards.map((card) => (
                <div
                  key={card.city}
                  className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-white shadow-[0_16px_32px_rgba(15,23,42,0.22)]"
                  style={{ left: card.x, top: card.y }}
                >
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full">
                    <span className="absolute inset-0 rounded-full border-[3px] border-gray-600" />
                    <span className="absolute inset-0 rounded-full border-[3px] border-boame-green border-r-transparent border-t-transparent" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold leading-none text-gray-100">{card.city}</span>
                    <span className="mt-1 block whitespace-nowrap text-xs font-black leading-none">{card.value}</span>
                  </span>
                </div>
              ))}

              {towns.map((town) => (
                <button
                  key={town.name}
                  className="group absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 origin-center items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-boame-deep shadow-sm ring-1 ring-gray-200 transition duration-200 hover:z-30 hover:scale-150 hover:bg-boame-deep hover:text-white hover:shadow-lg focus:z-30 focus:scale-150 focus:bg-boame-deep focus:text-white"
                  style={{ left: town.x, top: town.y }}
                  aria-label={`Zoom to ${town.name}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-boame-green ring-4 ring-boame-green/10 transition group-hover:bg-white group-focus:bg-white" />
                  {town.name}
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <p className="font-black text-boame-ink">{activeBelts}</p>
                <p className="text-gray-500">Belts</p>
              </div>
              <div>
                <p className="font-black text-boame-ink">{townStats.length}</p>
                <p className="text-gray-500">Towns</p>
              </div>
              <div>
                <p className="font-black text-boame-ink">{campaignCount}</p>
                <p className="text-gray-500">Campaigns</p>
              </div>
            </div>

            {belts.map(([title, count, detail]) => (
              <div key={title} className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-boame-ink">{title}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-boame-deep shadow-sm">{count}</span>
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-gray-500">{detail}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountEmail, setAccountEmail] = useState("admin@boame.dev");
  const [overviewStats, setOverviewStats] = useState<OverviewStat[]>([]);
  const [townStats, setTownStats] = useState<TownStat[]>([]);
  const [updatedAt, setUpdatedAt] = useState("Not refreshed");
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"ALL" | "VERIFICATION" | "SYSTEM">("ALL");

  useEffect(() => {
    const storedEmail = window.localStorage.getItem("boame_user_email");
    if (storedEmail) setAccountEmail(storedEmail);
    loadOverview();
    loadNotifications();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchResults(await apiGet<AdminSearchResult[]>(`/admin/search?q=${encodeURIComponent(query)}`));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);
  const filteredNotifications = useMemo(() => {
    if (notificationFilter === "ALL") return notifications;
    if (notificationFilter === "SYSTEM") return notifications.filter((notification) => notification.type !== "VERIFICATION");
    return notifications.filter((notification) => notification.type === notificationFilter);
  }, [notificationFilter, notifications]);
  const verificationNotificationCount = useMemo(() => notifications.filter((notification) => notification.type === "VERIFICATION").length, [notifications]);
  const systemNotificationCount = useMemo(() => notifications.filter((notification) => notification.type !== "VERIFICATION").length, [notifications]);

  async function loadOverview() {
    try {
      setRefreshing(true);
      const data = await apiGet<{ updatedAt: string; stats: OverviewStat[]; townStats?: TownStat[] }>("/admin/overview");
      setOverviewStats(data.stats);
      setTownStats(data.townStats ?? []);
      setUpdatedAt(new Intl.DateTimeFormat("en-GH", { hour: "2-digit", minute: "2-digit" }).format(new Date(data.updatedAt)));
      setOverviewError(null);
    } catch (error) {
      setOverviewStats([]);
      setTownStats([]);
      setOverviewError(error instanceof Error ? error.message : "Failed to load dashboard overview.");
      setUpdatedAt(new Intl.DateTimeFormat("en-GH", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  async function loadNotifications() {
    try {
      const data = await apiGet<{ unreadCount: number; notifications: AdminNotification[] }>("/admin/notifications");
      setNotifications(data.notifications);
    } catch {
      setNotifications([]);
    }
  }

  async function markNotificationRead(notificationId: string) {
    try {
      await apiPost(`/admin/notifications/${notificationId}/read`, {});
      await loadNotifications();
    } catch {
      setNotifications((current) => current.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)));
    }
  }

  async function markAllNotificationsRead() {
    await Promise.all(notifications.filter((notification) => !notification.read).map((notification) => markNotificationRead(notification.id)));
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="space-y-5">
          <SkeletonStats />
          <div className="grid gap-5 lg:grid-cols-2">
            <SkeletonPanel />
            <SkeletonPanel />
          </div>
          <SkeletonPanel />
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        if (overviewError) {
          return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
              <p className="text-sm font-black text-boame-ink">Could not load overview</p>
              <p className="mt-2 text-xs font-semibold text-gray-500">{overviewError}</p>
              <button onClick={loadOverview} className="focus-ring mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-boame-deep px-4 text-xs font-black text-white">
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          );
        }
        return <OverviewPanel overviewStats={overviewStats} townStats={townStats} updatedAt={updatedAt} refreshing={refreshing} onRefresh={loadOverview} />;
      case "campaigns":
        return <ManageCampaigns />;
      case "payments":
        return <PaymentsComponent />;
      case "verification":
        return <CampaignVerification searchQuery={searchQuery} />;
      case "payouts":
        return <PayoutApprovals />;
      case "users":
        return <UserManagement />;
      case "reports":
        return <Reports />;
      case "trust":
        return <TrustAndRisk />;
      case "settings":
        return <SettingsComponent />;
      default:
        return null;
    }
  }

  return (
    <section className="min-h-screen bg-[#f7f9f7] text-boame-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-20 items-center gap-3 px-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-boame-deep text-white">
            <HeartHandshake size={23} />
          </span>
          <div>
            <p className="text-lg font-black text-boame-deep">BoaMe</p>
            <p className="text-xs font-black uppercase tracking-wide text-gray-500">Admin portal</p>
          </div>
        </div>

        <nav className="space-y-6 px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-wide text-gray-400">{group.title}</p>
              <div className="space-y-1">
                {group.links.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={
                      activeTab === id
                        ? "flex h-10 w-full items-center gap-3 rounded-lg bg-boame-soft px-3 text-sm font-black text-boame-deep"
                        : "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-boame-deep"
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:px-6">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-gray-400">Admin workspace</p>
            <p className="mt-0.5 text-sm font-black text-boame-ink">{navGroups.flatMap((group) => group.links).find((link) => link.id === activeTab)?.label}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="focus-ring h-10 w-72 rounded-full border border-gray-200 bg-white pl-9 pr-3 text-xs font-bold text-boame-ink placeholder:text-gray-400"
                placeholder="Search admin workspace"
              />
              {searchQuery.trim() ? (
                <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                  {searchLoading ? <p className="px-4 py-3 text-xs font-bold text-gray-500">Searching...</p> : null}
                  {!searchLoading && searchResults.length === 0 ? <p className="px-4 py-3 text-xs font-bold text-gray-500">No results found.</p> : null}
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => {
                        setActiveTab(result.tab);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="focus-ring flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                    >
                      <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-black text-gray-500 ring-1 ring-gray-200">{result.type}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black text-boame-ink">{result.title}</span>
                        <span className="mt-1 block truncate text-[11px] font-semibold text-gray-500">{result.detail}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button onClick={() => setNotificationOpen(true)} className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-boame-soft" aria-label="Notifications">
              <Bell size={17} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-boame-deep px-1 text-[10px] font-black text-white">{unreadCount}</span>
              ) : null}
            </button>
            <div className="relative">
              <button
                onClick={() => setAccountOpen((open) => !open)}
                className="focus-ring flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white pl-1.5 pr-3 transition hover:bg-boame-soft"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-boame-deep text-xs font-black text-white">BA</span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-black text-boame-ink">BoaMe Ops</span>
                  <span className="block text-[11px] font-bold text-gray-500">Admin</span>
                </span>
              </button>
              {accountOpen ? (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.12)]" role="menu">
                  <div className="rounded-md bg-gray-50 px-3 py-2">
                    <p className="text-xs font-black text-boame-ink">{accountEmail}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-gray-500">Administrator</p>
                  </div>
                  <button className="mt-2 flex h-9 w-full items-center rounded-md px-3 text-left text-xs font-black text-gray-700 transition hover:bg-gray-50 hover:text-boame-deep" role="menuitem">
                    {accountEmail}
                  </button>
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      setActiveTab("settings");
                    }}
                    className="flex h-9 w-full items-center rounded-md px-3 text-left text-xs font-black text-gray-700 transition hover:bg-gray-50 hover:text-boame-deep"
                    role="menuitem"
                  >
                    Change password
                  </button>
                  <button
                    onClick={() => {
                      clearStoredSession();
                      window.localStorage.removeItem("boame_admin_session");
                      setAccountOpen(false);
                      router.push("/admin");
                    }}
                    className="flex h-9 w-full items-center rounded-md px-3 text-left text-xs font-black text-red-600 transition hover:bg-red-50"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{renderContent()}</main>
      </div>

      {notificationOpen ? (
        <div className="fixed inset-0 z-40">
          <button className="absolute inset-0 bg-white/35 backdrop-blur-sm" aria-label="Close notifications" onClick={() => setNotificationOpen(false)} />
          <aside className="absolute right-4 top-[4.25rem] flex h-[calc(100vh-5.25rem)] w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <h2 className="text-sm font-black text-boame-ink">Notifications</h2>
              <button onClick={loadNotifications} className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50" aria-label="Refresh notifications">
                <RefreshCw size={13} />
              </button>
            </div>

            <div className="flex gap-1 px-4 pb-3 text-[11px] font-black">
              {[
                ["ALL", "All", notifications.length],
                ["VERIFICATION", "Verification", verificationNotificationCount],
                ["SYSTEM", "System", systemNotificationCount]
              ].map(([id, label, count]) => (
                <button
                  key={id}
                  onClick={() => setNotificationFilter(id as "ALL" | "VERIFICATION" | "SYSTEM")}
                  className={
                    notificationFilter === id
                      ? "focus-ring rounded-full bg-gray-100 px-3 py-1.5 text-boame-ink"
                      : "focus-ring rounded-full px-3 py-1.5 text-gray-500 hover:bg-gray-50"
                  }
                >
                  {label} <span className="font-bold text-gray-400">{count}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {filteredNotifications.length === 0 ? <p className="px-4 py-8 text-center text-xs font-bold text-gray-500">No notifications.</p> : null}
              {filteredNotifications.map((notification, index) => (
                <button
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  className="focus-ring flex w-full gap-3 border-b border-gray-100 px-2 py-3 text-left transition last:border-b-0 hover:bg-gray-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-black text-gray-700">
                    {notification.type.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-boame-ink">
                      {notification.title} <span className="font-semibold text-gray-500">{notification.body}</span>
                    </span>
                    <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                      <span className={notification.type === "VERIFICATION" ? "h-2 w-2 rounded-sm bg-boame-deep" : "h-2 w-2 rounded-sm bg-gray-400"} />
                      <span className="truncate">{notification.type === "VERIFICATION" ? "Campaign review" : "Admin system"}</span>
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold text-gray-400">{index === 0 ? "32s ago" : index === 1 ? "43m ago" : "1h ago"}</span>
                  </span>
                  {!notification.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-boame-deep" /> : null}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <button onClick={markAllNotificationsRead} className="focus-ring text-xs font-black text-gray-700 underline underline-offset-2">Mark all as read</button>
              <button onClick={() => setActiveTab("trust")} className="focus-ring rounded-lg bg-gray-50 px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-100">
                Notification center
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
