import type { NotificationPreferences, PaymentMethod, UserSettings } from "@boame/shared-types";
import { apiGet, apiPut } from "./api-client";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const defaultSettings: UserSettings = {
  displayName: "Ama Mensah",
  email: "ama@boame.dev",
  phoneNumber: "+233241234567",
  defaultPaymentMethod: "MOBILE_MONEY",
  defaultDonationType: "ONE_TIME",
  defaultAnonymousDonations: false,
  currency: "GHS",
  language: "English",
  biometricLogin: false,
  donationReceipts: true,
  twoFactorAuth: true
};

export const defaultNotificationPreferences: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  donationReceipts: true,
  campaignUpdates: true,
  groupInvites: true,
  weeklyImpactSummary: true,
  marketingMessages: false
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  MOBILE_MONEY: "Mobile money",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  OFFLINE: "Offline pledge"
};

type ApiData<T> = { data: T };

function unwrapData<T>(payload: T | ApiData<T>) {
  return payload && typeof payload === "object" && "data" in payload ? (payload as ApiData<T>).data : (payload as T);
}

export async function getSettings(): Promise<UserSettings> {
  try {
    return unwrapData(await apiGet<UserSettings | ApiData<UserSettings>>("/users/settings"));
  } catch {
    return defaultSettings;
  }
}

export async function updateSettings(settings: UserSettings): Promise<UserSettings> {
  return apiPut<UserSettings>("/users/settings", settings);
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    return unwrapData(await apiGet<NotificationPreferences | ApiData<NotificationPreferences>>("/users/notifications/preferences"));
  } catch {
    return defaultNotificationPreferences;
  }
}

export async function updateNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
  return apiPut<NotificationPreferences>("/users/notifications/preferences", preferences);
}

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    return unwrapData(await apiGet<NotificationItem[] | ApiData<NotificationItem[]>>("/users/notifications"));
  } catch {
    return [];
  }
}
