import type { CampaignCategory, CampaignSummary } from "@boame/shared-types";
import { campaigns as fallbackCampaigns } from "../data/campaigns";
import { apiGet, apiPost, apiUpload } from "./api-client";

type ApiUser = {
  id: string;
  firstName: string;
  lastName: string;
  role?: CampaignSummary["beneficiary"]["role"];
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

type ApiResponse<T> = {
  data: T;
};

export type UploadedEvidence = {
  name: string;
  mimeType: string;
  fileSize: number;
  url: string;
};

function unwrapData<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

function normalizeCampaign(campaign: ApiCampaign): CampaignSummary {
  const beneficiary = campaign.beneficiary || {};
  return {
    ...campaign,
    location: campaign.location ?? undefined,
    coverImage: campaign.coverImage ?? undefined,
    endDate: campaign.endDate ?? undefined,
    beneficiary: {
      id: beneficiary.id || "unknown",
      firstName: beneficiary.firstName || "Unknown",
      lastName: beneficiary.lastName || "User",
      role: beneficiary.role ?? "BENEFICIARY",
      location: beneficiary.location ?? undefined,
      profileImage: beneficiary.profileImage ?? undefined,
      isIdentityVerified: beneficiary.isIdentityVerified ?? false
    }
  };
}

export async function listCampaigns() {
  try {
    const response = await apiGet<ApiResponse<ApiCampaign[]> | ApiCampaign[]>("/campaigns");
    return unwrapData(response).map(normalizeCampaign);
  } catch (error) {
    console.warn("Using fallback campaigns because backend campaigns could not be loaded", error);
    return fallbackCampaigns;
  }
}

export async function getCampaign(slugOrId: string) {
  try {
    const response = await apiGet<ApiResponse<ApiCampaign> | ApiCampaign>(`/campaigns/${slugOrId}`);
    return normalizeCampaign(unwrapData(response));
  } catch (error) {
    console.warn("Using fallback campaign because backend campaign could not be loaded", error);
    return fallbackCampaigns.find((campaign) => campaign.slug === slugOrId || campaign.id === slugOrId) ?? fallbackCampaigns[0];
  }
}

export async function createCampaignRequest(payload: {
  title: string;
  description: string;
  story?: string;
  category: CampaignCategory;
  goalAmount: number;
  minimumDonation?: number;
  location?: string;
  documents?: string[];
}) {
  const response = await apiPost<ApiResponse<ApiCampaign> | ApiCampaign>("/campaigns", {
    ...payload,
    minimumDonation: payload.minimumDonation ?? 1,
    documents: payload.documents ?? []
  });

  return normalizeCampaign(unwrapData(response));
}

export async function listMyCampaignRequests() {
  try {
    const response = await apiGet<ApiResponse<ApiCampaign[]> | ApiCampaign[]>("/users/campaigns");
    return unwrapData(response).map(normalizeCampaign);
  } catch (error) {
    console.warn("Beneficiary campaigns could not be loaded", error);
    return [];
  }
}

export async function uploadCampaignEvidence(files: Array<{ uri: string; name: string; mimeType?: string | null }>) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? "application/octet-stream"
    } as unknown as Blob);
  });

  const response = await apiUpload<ApiResponse<UploadedEvidence[]> | UploadedEvidence[]>("/users/uploads/evidence", formData);
  return unwrapData(response);
}
