import type { CampaignSummary, ImpactStats } from "@boame/shared-types";

export const impactStats: ImpactStats = {
  totalRaised: 482500,
  beneficiariesHelped: 1240,
  totalDonors: 18500,
  mobileDownloads: 9200
};

export const sampleCampaigns: CampaignSummary[] = [
  {
    id: "camp_medical_kofi",
    slug: "kofi-heart-treatment",
    title: "Heart treatment support for Kofi",
    description: "Help Kofi complete urgent cardiac care at Korle Bu Teaching Hospital. Health support for cardiac treatment and medical care.",
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
    },
    requestedItems: [
      { id: "item_medication", name: "Post-surgery medication", category: "MEDICAL", quantityNeeded: 30, quantityReceived: 12, unit: "packs", priority: "HIGH" },
      { id: "item_transport", name: "Hospital transport vouchers", category: "OTHER", quantityNeeded: 20, quantityReceived: 5, unit: "vouchers", priority: "MEDIUM" }
    ],
    campaignMedia: [
      {
        id: "media_kofi_update",
        type: "RECORDED_VIDEO",
        title: "Doctor briefing and family update",
        description: "A short verified update from the care team.",
        thumbnailUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        status: "RECORDED",
        durationLabel: "3 min"
      }
    ]
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
    },
    requestedItems: [
      { id: "item_exercise_books", name: "Exercise books", category: "EDUCATION", quantityNeeded: 600, quantityReceived: 210, unit: "books", priority: "HIGH" },
      { id: "item_uniforms", name: "School uniforms", category: "CLOTHING", quantityNeeded: 120, quantityReceived: 38, unit: "sets", priority: "HIGH" },
      { id: "item_learning_kits", name: "Learning kits", category: "EDUCATION", quantityNeeded: 120, quantityReceived: 44, unit: "kits", priority: "MEDIUM" }
    ],
    campaignMedia: [
      {
        id: "media_school_update",
        type: "RECORDED_VIDEO",
        title: "Classroom supply handover",
        description: "Watch the latest supply delivery from Tamale.",
        thumbnailUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        status: "RECORDED",
        durationLabel: "5 min"
      }
    ]
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
    },
    requestedItems: [
      { id: "item_tents", name: "Family tents", category: "SHELTER", quantityNeeded: 45, quantityReceived: 11, unit: "tents", priority: "HIGH" },
      { id: "item_blankets", name: "Blankets and bedsheets", category: "SHELTER", quantityNeeded: 160, quantityReceived: 48, unit: "pieces", priority: "HIGH" },
      { id: "item_food", name: "Food packs", category: "FOOD", quantityNeeded: 300, quantityReceived: 95, unit: "packs", priority: "HIGH" },
      { id: "item_clothes", name: "Clean clothes", category: "CLOTHING", quantityNeeded: 220, quantityReceived: 73, unit: "bags", priority: "MEDIUM" }
    ],
    campaignMedia: [
      {
        id: "media_flood_live",
        type: "LIVE_STREAM",
        title: "Live relief camp update",
        description: "Field team stream from South Tongu distribution point.",
        thumbnailUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        status: "LIVE",
        startsAt: "2026-06-30T16:30:00Z"
      },
      {
        id: "media_flood_recorded",
        type: "RECORDED_VIDEO",
        title: "Shelter needs walkthrough",
        description: "A verified walkthrough of tents, blankets, and food pack needs.",
        thumbnailUrl: "https://images.unsplash.com/photo-1523774294084-94691d7bb289?auto=format&fit=crop&w=1200&q=80",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        status: "RECORDED",
        durationLabel: "7 min"
      }
    ]
  }
];
