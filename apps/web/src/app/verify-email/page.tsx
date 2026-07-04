import { VerifyEmailStatus } from "@/components/account-recovery-forms";

export default function VerifyEmailPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-black text-boame-ink">Verify Email</h1>
      <p className="mt-3 text-gray-600">Check your backend email verification status and continue your BoaMe setup.</p>
      <VerifyEmailStatus />
    </section>
  );
}
