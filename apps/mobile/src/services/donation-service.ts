import type { DonationIntent, DonationRecord } from "@boame/shared-types";
import { campaigns } from "../data/campaigns";
import { apiGet, apiPost } from "./api-client";

export interface DonationInitializationResponse {
  reference: string;
  authorizationUrl: string;
  donation: DonationRecord;
}

type ApiData<T> = { data: T };

function unwrapData<T>(payload: T | ApiData<T>) {
  return payload && typeof payload === "object" && "data" in payload ? (payload as ApiData<T>).data : (payload as T);
}

function normalizeDonation(raw: Omit<DonationRecord, "status"> & { campaign?: { title?: string }; paymentReference?: string; status?: string }): DonationRecord {
  return {
    ...raw,
    campaignTitle: raw.campaignTitle ?? raw.campaign?.title ?? "Campaign",
    reference: raw.reference ?? raw.paymentReference ?? raw.id,
    status: raw.status === "COMPLETED" ? "SUCCESS" : raw.status === "FAILED" ? "FAILED" : raw.status === "SUCCESS" ? "SUCCESS" : "PENDING"
  };
}

export async function initializeDonation(intent: DonationIntent): Promise<DonationInitializationResponse> {
  const response = unwrapData(await apiPost<DonationInitializationResponse | ApiData<DonationInitializationResponse>>("/donations/initialize", intent));
  return { ...response, donation: normalizeDonation(response.donation) };
}

export async function verifyDonation(reference: string): Promise<DonationRecord> {
  const response = await apiGet<{ data: DonationRecord; status: "SUCCESS" | "PENDING" | "FAILED" } | ApiData<DonationRecord>>(`/donations/verify/${encodeURIComponent(reference)}`);
  return normalizeDonation(unwrapData(response));
}

export async function getDonationHistory(): Promise<DonationRecord[]> {
  try {
    return unwrapData(await apiGet<DonationRecord[] | ApiData<DonationRecord[]>>("/donations/history")).map(normalizeDonation);
  } catch {
    return [
      {
        id: "local-donation-1",
        campaignId: campaigns[0].id,
        campaignTitle: campaigns[0].title,
        amount: 25,
        type: "ONE_TIME",
        paymentMethod: "MOBILE_MONEY",
        mode: "INDIVIDUAL",
        isAnonymous: false,
        reference: "BOAME-OFFLINE-001",
        status: "SUCCESS",
        createdAt: new Date().toISOString()
      }
    ];
  }
}
