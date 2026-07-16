import { BadgeCheck, ShieldCheck } from "lucide-react";
import { CreateCampaignForm } from "@/components/create-campaign-form";
import Link from "next/link";

export default function StartCampaignPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-boame-soft text-boame-deep">
          <BadgeCheck size={30} />
        </span>
        <h1 className="mt-5 text-4xl font-black text-boame-ink">Start a campaign</h1>
        <p className="mt-3 text-lg leading-8 text-gray-600">
          Submit your campaign for review. An admin will verify and publish it once approved — no account needed.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <CreateCampaignForm />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <ShieldCheck size={16} className="text-boame-deep" />
          <p>Your campaign will be reviewed before going live.</p>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Questions? <Link href="/about" className="font-bold text-boame-deep hover:underline">Contact us</Link>
        </p>
      </div>
    </section>
  );
}
