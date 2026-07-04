import { ResetPasswordForm } from "@/components/account-recovery-forms";

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-black text-boame-ink">Reset Password</h1>
      <p className="mt-2 text-gray-600">Set a new password through the backend reset endpoint.</p>
      <ResetPasswordForm />
    </section>
  );
}
