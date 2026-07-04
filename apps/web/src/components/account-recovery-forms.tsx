"use client";

import { useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("ama@boame.dev");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await apiPost<{ message: string }>("/auth/forgot-password", { email });
    setStatus(response.message);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <input value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-3" placeholder="Email" type="email" />
      {status ? <p className="rounded-xl bg-boame-soft px-3 py-2 text-sm font-bold text-boame-deep">{status}</p> : null}
      <button className="focus-ring h-12 w-full rounded-full bg-boame-deep font-bold text-white">Send reset link</button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("password123");
  const [confirmPassword, setConfirmPassword] = useState("password123");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    const response = await apiPost<{ message: string }>("/auth/reset-password", { password });
    setStatus(response.message);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <input value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-3" placeholder="New password" type="password" />
      <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="focus-ring h-12 w-full rounded-xl border border-gray-300 px-3" placeholder="Confirm password" type="password" />
      {status ? <p className="rounded-xl bg-boame-soft px-3 py-2 text-sm font-bold text-boame-deep">{status}</p> : null}
      <button className="focus-ring h-12 w-full rounded-full bg-boame-deep font-bold text-white">Reset password</button>
    </form>
  );
}

export function VerifyEmailStatus() {
  const [status, setStatus] = useState<string | null>(null);

  async function verify() {
    const response = await apiGet<{ message: string }>("/auth/verify-email");
    setStatus(response.message);
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <button onClick={verify} className="focus-ring h-12 rounded-full bg-boame-deep px-5 font-bold text-white">Check verification</button>
      {status ? <p className="mt-4 rounded-xl bg-boame-soft px-3 py-2 text-sm font-bold text-boame-deep">{status}</p> : null}
    </div>
  );
}
