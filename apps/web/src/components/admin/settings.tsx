"use client";

import { CheckCircle2, Loader2, LockKeyhole, Settings as SettingsIcon, Smartphone, ToggleLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";

type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
};

type MobileSetting = {
  id: string;
  name: string;
  value: string | number | boolean;
  type: "string" | "number" | "boolean";
  description: string;
};

type ApiData<T> = { data: T };

function unwrapData<T>(payload: T | ApiData<T>) {
  return payload && typeof payload === "object" && "data" in payload ? (payload as ApiData<T>).data : (payload as T);
}

export function Settings() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [mobileSettings, setMobileSettings] = useState<MobileSetting[]>([]);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);

    const [flagsResult, settingsResult] = await Promise.allSettled([
      apiGet<FeatureFlag[] | ApiData<FeatureFlag[]>>("/admin/feature-flags"),
      apiGet<MobileSetting[] | ApiData<MobileSetting[]>>("/admin/mobile/settings")
    ]);

    if (flagsResult.status === "fulfilled") {
      setFeatureFlags(unwrapData(flagsResult.value));
    }

    if (settingsResult.status === "fulfilled") {
      setMobileSettings(unwrapData(settingsResult.value));
    }

    if (flagsResult.status === "rejected" || settingsResult.status === "rejected") {
      if (flagsResult.status === "rejected") setFeatureFlags([]);
      if (settingsResult.status === "rejected") setMobileSettings([]);
      setMessage("Failed to load one or more admin settings from the backend.");
    } else {
      setMessage(null);
    }

    setLoading(false);
  }

  async function toggleFeatureFlag(flag: FeatureFlag) {
    try {
      setSavingId(flag.id);
      const response = await apiPost<{ message: string; flag: FeatureFlag }>(`/admin/feature-flags/${flag.id}`, { enabled: !flag.enabled });
      setFeatureFlags((current) => current.map((item) => (item.id === flag.id ? response.flag : item)));
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update feature flag");
    } finally {
      setSavingId(null);
    }
  }

  async function updateMobileSetting(setting: MobileSetting, value: string | number | boolean) {
    try {
      setSavingId(setting.id);
      const response = await apiPost<{ message: string; setting: MobileSetting }>(`/admin/mobile/settings/${setting.id}`, { value });
      setMobileSettings((current) => current.map((item) => (item.id === setting.id ? response.setting : item)));
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update setting");
    } finally {
      setSavingId(null);
    }
  }

  async function changePassword() {
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setSavingId("password");
      const response = await apiPost<{ message: string }>("/admin/change-password", { oldPassword, password });
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        <div className="flex items-center gap-3 border-b border-gray-100 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
            <SettingsIcon size={20} />
          </span>
          <div>
            <h1 className="text-lg font-black text-boame-ink">Settings</h1>
            <p className="mt-1 text-xs font-semibold text-gray-500">Manage admin security, mobile app controls, and platform features.</p>
          </div>
        </div>

        {message ? <div className="mx-5 mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">{message}</div> : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm font-bold text-gray-500">
            <Loader2 className="animate-spin" size={17} />
            Loading settings...
          </div>
        ) : null}

        {!loading ? (
          <div className="grid gap-5 p-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-black text-boame-ink">Feature flags</h2>
                <div className="mt-3 space-y-2">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-boame-ink">{flag.name}</h3>
                            <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-black text-gray-500 ring-1 ring-gray-200">{flag.category}</span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-gray-500">{flag.description}</p>
                        </div>
                        <button
                          onClick={() => toggleFeatureFlag(flag)}
                          disabled={Boolean(savingId)}
                          className={flag.enabled ? "focus-ring inline-flex h-9 w-16 items-center justify-center rounded-full bg-boame-deep text-white disabled:opacity-60" : "focus-ring inline-flex h-9 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500 disabled:opacity-60"}
                        >
                          {savingId === flag.id ? <Loader2 className="animate-spin" size={16} /> : <ToggleLeft size={20} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-black text-boame-ink">Mobile app settings</h2>
                <div className="mt-3 space-y-2">
                  {mobileSettings.map((setting) => (
                    <div key={setting.id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-black text-boame-ink">{setting.name}</h3>
                          <p className="mt-1 text-xs font-semibold text-gray-500">{setting.description}</p>
                        </div>
                        {setting.type === "boolean" ? (
                          <button
                            onClick={() => updateMobileSetting(setting, !setting.value)}
                            disabled={Boolean(savingId)}
                            className={setting.value ? "focus-ring inline-flex h-9 w-16 items-center justify-center rounded-full bg-boame-deep text-white disabled:opacity-60" : "focus-ring inline-flex h-9 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500 disabled:opacity-60"}
                          >
                            {savingId === setting.id ? <Loader2 className="animate-spin" size={16} /> : <ToggleLeft size={20} />}
                          </button>
                        ) : (
                          <input
                            value={String(setting.value)}
                            type={setting.type === "number" ? "number" : "text"}
                            onChange={(event) => {
                              const value = setting.type === "number" ? Number(event.target.value) : event.target.value;
                              setMobileSettings((current) => current.map((item) => (item.id === setting.id ? { ...item, value } : item)));
                            }}
                            onBlur={(event) => updateMobileSetting(setting, setting.type === "number" ? Number(event.target.value) : event.target.value)}
                            className="focus-ring h-9 w-full rounded-lg border border-gray-200 px-3 text-xs font-bold text-boame-ink sm:w-44"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-gray-200 bg-gray-50/60 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 ring-1 ring-gray-200">
                  <LockKeyhole size={19} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-boame-ink">Change password</h2>
                  <p className="mt-1 text-xs font-semibold text-gray-500">Update the admin account password.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <input
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  className="focus-ring h-10 w-full rounded-full border border-gray-200 bg-white px-4 text-xs font-bold text-boame-ink placeholder:text-gray-400"
                  type="password"
                  placeholder="Old password"
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="focus-ring h-10 w-full rounded-full border border-gray-200 bg-white px-4 text-xs font-bold text-boame-ink placeholder:text-gray-400"
                  type="password"
                  placeholder="New password"
                />
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="focus-ring h-10 w-full rounded-full border border-gray-200 bg-white px-4 text-xs font-bold text-boame-ink placeholder:text-gray-400"
                  type="password"
                  placeholder="Confirm password"
                />
                <button
                  onClick={changePassword}
                  disabled={savingId === "password"}
                  className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-boame-deep px-4 text-sm font-black text-white transition hover:bg-boame-green disabled:opacity-60"
                >
                  {savingId === "password" ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Save password
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
