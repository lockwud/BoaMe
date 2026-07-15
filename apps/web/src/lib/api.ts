import type { CampaignSummary, DonationRecord, ImpactStats, UserSummary } from "@boame/shared-types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/api/v1");

type ApiUser = {
  id: string;
  firstName: string;
  lastName: string;
  role?: UserSummary["role"];
  location?: string | null;
  profileImage?: string | null;
  isIdentityVerified?: boolean;
};

type ApiCampaign = Omit<CampaignSummary, "beneficiary" | "location" | "coverImage" | "endDate"> & {
  location?: string | null;
  coverImage?: string | null;
  endDate?: string | null;
  beneficiary: ApiUser;
};

type ApiListResponse<T> = {
  data: T;
};

function unwrapData<T>(response: ApiListResponse<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiListResponse<T>).data;
  }

  return response as T;
}

function normalizeCampaign(campaign: ApiCampaign): CampaignSummary {
  return {
    ...campaign,
    location: campaign.location ?? undefined,
    coverImage: campaign.coverImage ?? undefined,
    endDate: campaign.endDate ?? undefined,
    beneficiary: {
      id: campaign.beneficiary.id,
      firstName: campaign.beneficiary.firstName,
      lastName: campaign.beneficiary.lastName,
      role: campaign.beneficiary.role ?? "BENEFICIARY",
      location: campaign.beneficiary.location ?? undefined,
      profileImage: campaign.beneficiary.profileImage ?? undefined,
      isIdentityVerified: campaign.beneficiary.isIdentityVerified ?? false
    }
  };
}

async function apiFetch<T>(path: string): Promise<T> {
  if (!apiUrl) {
    throw new Error("Backend API URL is not configured.");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    next: { revalidate: 10 }
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getCampaigns(): Promise<CampaignSummary[]> {
  const response = await apiFetch<ApiListResponse<ApiCampaign[]> | ApiCampaign[]>("/campaigns");
  return unwrapData(response).map(normalizeCampaign);
}

export async function getFeaturedCampaigns(): Promise<CampaignSummary[]> {
  const response = await apiFetch<ApiListResponse<ApiCampaign[]> | ApiCampaign[]>("/campaigns/featured");
  return unwrapData(response).map(normalizeCampaign);
}

export async function getCampaign(slugOrId: string): Promise<CampaignSummary> {
  const response = await apiFetch<ApiListResponse<ApiCampaign> | ApiCampaign>(`/campaigns/${slugOrId}`);
  return normalizeCampaign(unwrapData(response));
}

export async function getImpactStats(): Promise<ImpactStats> {
  const response = await apiFetch<ApiListResponse<{ donations: { _sum: { amount: number | null }; _count: number }; users: number }>>("/admin/analytics");
  return {
    totalRaised: response.data.donations._sum.amount ?? 0,
    beneficiariesHelped: 0,
    totalDonors: response.data.users,
    mobileDownloads: 0
  };
}

export async function getDonationHistory(): Promise<DonationRecord[]> {
  return await apiFetch<DonationRecord[]>("/donations/history");
}
