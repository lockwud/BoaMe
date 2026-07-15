"use client";

import { Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost, setStoredSession } from "@/lib/client-api";

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@boame.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const [response] = await Promise.all([
        apiPost<AuthResponse>("/auth/login", { email, password }),
        wait(3000)
      ]);
      setStoredSession(response.accessToken, email);
      window.localStorage.setItem("boame_admin_session", "true");
      router.push("/dashboard/admin");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Admin login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-boame-deep">Welcome</p>
      <h2 className="mt-3 text-3xl font-black text-boame-ink">Sign in to BoaMe</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-gray-500">Continue to your admin workspace.</p>

      <label className="mt-5 block">
        <span className="text-[11px] font-black text-gray-600">Email</span>
        <span className="relative mt-2 block">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring h-10 w-full rounded-full border border-gray-200 bg-white px-4 pl-9 text-xs font-semibold text-boame-ink placeholder:text-gray-400" type="email" placeholder="admin@boame.com" required />
        </span>
      </label>
      <label className="mt-4 block">
        <span className="text-[11px] font-black text-gray-600">Password</span>
        <span className="relative mt-2 block">
          <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring h-10 w-full rounded-full border border-gray-200 bg-white px-4 pl-9 pr-10 text-xs font-semibold text-boame-ink placeholder:text-gray-400" type={showPassword ? "text" : "password"} placeholder="Password" required />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
      </label>

      {status ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{status}</p> : null}

      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-gray-500">
        <label className="inline-flex items-center gap-2">
          <input className="h-3.5 w-3.5 rounded-full border-gray-300 accent-boame-deep" type="checkbox" />
          Remember me
        </label>
        <span className="text-boame-deep">Access logged</span>
      </div>

      <button disabled={isSubmitting} className="focus-ring mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-full bg-boame-deep px-6 text-xs font-black text-white shadow-[0_12px_24px_rgba(46,125,50,0.18)] transition hover:bg-boame-green disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none">
        {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <ShieldCheck size={15} />}
        {isSubmitting ? "Loading permissions..." : "Sign in"}
      </button>

      <div className="mt-5 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
        <p className="font-black text-boame-ink">Development account</p>
        <p className="mt-1 font-semibold">admin@boame.com / Password123!</p>
      </div>
    </form>
  );
}
