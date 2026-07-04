import type { CampaignSummary, ImpactStats } from "@boame/shared-types";

export const impactStats: ImpactStats = {
  totalRaised: 482500,
  beneficiariesHelped: 1240,
  totalDonors: 18500,
  mobileDownloads: 9200
};

export const campaigns: CampaignSummary[] = [
  {
    id: "camp_medical_kofi",
    slug: "kofi-heart-treatment",
    title: "Heart treatment support for Kofi",
    description: "Help Kofi complete urgent cardiac care at Korle Bu Teaching Hospital.",
    category: "MEDICAL",
    status: "ACTIVE",
    goalAmount: 42000,
    raisedAmount: 31850,
    minimumDonation: 1,
    location: "Accra, Greater Accra",
    coverImage: "https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    endDate: "2026-08-30",
    beneficiary: {
      id: "user_kofi",
      firstName: "Kofi",
      lastName: "Adu",
      role: "BENEFICIARY",
      location: "Accra",
      isIdentityVerified: true
    }
  },
  {
    id: "camp_school_tamale",
    slug: "tamale-girls-school-supplies",
    title: "School supplies for girls in Tamale",
    description: "Provide books, uniforms, and learning kits for 120 students.",
    category: "EDUCATION",
    status: "ACTIVE",
    goalAmount: 28000,
    raisedAmount: 16420,
    minimumDonation: 1,
    location: "Tamale, Northern Region",
    coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    beneficiary: {
      id: "user_school",
      firstName: "Naa",
      lastName: "Yakubu",
      role: "BENEFICIARY",
      location: "Tamale",
      isIdentityVerified: true
    }
  },
  {
    id: "camp_flood_volta",
    slug: "volta-flood-relief",
    title: "Emergency relief for Volta flood families",
    description: "Food, medication, and temporary shelter for displaced households.",
    category: "EMERGENCY",
    status: "ACTIVE",
    goalAmount: 65000,
    raisedAmount: 49200,
    minimumDonation: 1,
    location: "South Tongu, Volta Region",
    coverImage: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
    isFeatured: false,
    endDate: "2026-07-25",
    beneficiary: {
      id: "user_volta",
      firstName: "Akosua",
      lastName: "Deku",
      role: "BENEFICIARY",
      location: "Volta Region",
      isIdentityVerified: true
    }
  }
];
