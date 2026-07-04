import { ForgotPasswordForm } from "@/components/account-recovery-forms";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-black text-boame-ink">Forgot Password</h1>
      <p className="mt-2 text-gray-600">Request backend password reset instructions for your BoaMe account.</p>
      <ForgotPasswordForm />
    </section>
  );
}
