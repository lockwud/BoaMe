"use client";

import { BadgeCheck, Ban, CheckCircle2, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";
import { formatGhs } from "@/lib/utils";

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  phone: string;
};

type AdminCampaign = {
  id: string;
  title: string;
  category: string;
  status: string;
  raisedAmount: number;
  goalAmount: number;
  beneficiary: string;
  verificationStatus: string;
};

type AdminDonation = {
  id: string;
  campaignTitle: string;
  amount: number;
  status: string;
  paymentMethod: string;
};

type AdminPayout = {
  id: string;
  campaignTitle: string;
  amount: number;
  status: string;
  destination: string;
};

export function AdminControlPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [nextUsers, nextCampaigns, nextDonations, nextPayouts] = await Promise.all([
      apiGet<AdminUser[]>("/admin/users"),
      apiGet<AdminCampaign[]>("/admin/campaigns"),
      apiGet<AdminDonation[]>("/admin/donations"),
      apiGet<AdminPayout[]>("/admin/payouts")
    ]);
    setUsers(nextUsers);
    setCampaigns(nextCampaigns);
    setDonations(nextDonations);
    setPayouts(nextPayouts);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load admin data."));
  }, []);

  async function runAction(path: string) {
    const response = await apiPost<{ message: string }>(path, {});
    setMessage(response.message);
    await load();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-gray-600">Live admin data from the BoaMe backend.</p>
        <button onClick={() => load()} className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-black text-boame-deep">
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>
      {message ? <p className="rounded-xl bg-boame-soft px-4 py-3 text-sm font-black text-boame-deep">{message}</p> : null}

      <Panel title="Campaign verification">
        {campaigns.map((campaign) => (
          <Row key={campaign.id} title={campaign.title} detail={`${campaign.category} · ${campaign.beneficiary} · ${formatGhs(campaign.raisedAmount)} raised`}>
            <span className="rounded-full bg-boame-soft px-3 py-1 text-xs font-black text-boame-deep">{campaign.verificationStatus}</span>
            <button onClick={() => runAction(`/admin/campaigns/${campaign.id}/verify`)} className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-boame-deep px-3 text-xs font-black text-white">
              <BadgeCheck size={14} /> Verify
            </button>
          </Row>
        ))}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Payout approvals">
          {payouts.map((payout) => (
            <Row key={payout.id} title={payout.campaignTitle} detail={`${formatGhs(payout.amount)} · ${payout.destination}`}>
              <button onClick={() => runAction(`/admin/payouts/${payout.id}/approve`)} className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-boame-deep px-3 text-xs font-black text-white">
                <CheckCircle2 size={14} /> Approve
              </button>
              <button onClick={() => runAction(`/admin/payouts/${payout.id}/reject`)} className="focus-ring inline-flex h-9 items-center rounded-full border border-gray-200 px-3 text-xs font-black text-boame-urgent">
                Reject
              </button>
            </Row>
          ))}
        </Panel>

        <Panel title="Users and access">
          {users.map((user) => (
            <Row key={user.id} title={`${user.firstName} ${user.lastName}`} detail={`${user.role} · ${user.phone} · ${user.status}`}>
              <button onClick={() => runAction(`/admin/users/${user.id}/block`)} className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 px-3 text-xs font-black text-boame-urgent">
                <Ban size={14} /> Block
              </button>
            </Row>
          ))}
        </Panel>
      </div>

      <Panel title="Donation monitoring">
        {donations.map((donation) => (
          <Row key={donation.id} title={donation.campaignTitle} detail={`${formatGhs(donation.amount)} · ${donation.paymentMethod}`}>
            <span className="rounded-full bg-boame-soft px-3 py-1 text-xs font-black text-boame-deep">{donation.status}</span>
          </Row>
        ))}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="inline-flex items-center gap-2 text-xl font-black text-boame-ink">
        <ShieldCheck size={20} className="text-boame-deep" /> {title}
      </h2>
      <div className="mt-4 divide-y divide-gray-100">{children}</div>
    </section>
  );
}

function Row({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="font-black text-boame-ink">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{detail}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
