export type UserRole = "DONOR" | "BENEFICIARY" | "ADMIN" | "VERIFIER";
export type CampaignCategory = "MEDICAL" | "EDUCATION" | "EMERGENCY" | "COMMUNITY" | "BUSINESS" | "OTHER";
export type CampaignStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "FUNDED" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export type DonationType = "ONE_TIME" | "DAILY" | "WEEKLY" | "MONTHLY";
export type PaymentMethod = "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER" | "OFFLINE";
export type DonationMode = "INDIVIDUAL" | "SPLIT" | "GROUP";
export type DonationKind = "MONEY" | "ITEMS" | "MONEY_AND_ITEMS";

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  location?: string;
  profileImage?: string;
  isIdentityVerified: boolean;
}

export interface CampaignSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CampaignCategory;
  status: CampaignStatus;
  goalAmount: number;
  raisedAmount: number;
  minimumDonation: number;
  location?: string;
  coverImage?: string;
  isFeatured: boolean;
  beneficiary: UserSummary;
  endDate?: string;
  requestedItems?: Array<{
    id: string;
    name: string;
    category: "SHELTER" | "FOOD" | "CLOTHING" | "MEDICAL" | "EDUCATION" | "HYGIENE" | "OTHER";
    quantityNeeded: number;
    quantityReceived: number;
    unit: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
  }>;
  campaignMedia?: Array<{
    id: string;
    type: "LIVE_STREAM" | "RECORDED_VIDEO" | "IMAGE";
    title: string;
    description?: string;
    thumbnailUrl: string;
    streamUrl?: string;
    status: "LIVE" | "SCHEDULED" | "RECORDED";
    startsAt?: string;
    durationLabel?: string;
  }>;
}

export interface DonationIntent {
  campaignId: string;
  amount: number;
  kind?: DonationKind;
  type: DonationType;
  paymentMethod: PaymentMethod;
  mode?: DonationMode;
  isAnonymous?: boolean;
  message?: string;
  phoneNumber?: string;
  callbackUrl?: string;
  itemDonations?: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    condition: "NEW" | "GOOD" | "USED";
    deliveryMethod: "PICKUP" | "DROP_OFF";
    donorContact: string;
  }>;
  paymentDetails?: {
    provider: "PAYSTACK_DEMO";
    payerName: string;
    payerEmail: string;
    cardLast4?: string;
    mobileMoneyProvider?: "MTN" | "VODAFONE" | "AIRTELTIGO";
    bankName?: string;
    accountName?: string;
    transferReference?: string;
    offlinePledgeNote?: string;
  };
  splitPayments?: Array<{
    label: string;
    amount: number;
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
  }>;
  groupDonation?: {
    groupName: string;
    organizerName: string;
    expectedMembers: number;
    allowMemberMessages: boolean;
  };
}

export interface DonationRecord extends DonationIntent {
  id: string;
  campaignTitle: string;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  authorizationUrl?: string;
}

export interface UserSettings {
  displayName: string;
  email: string;
  phoneNumber: string;
  defaultPaymentMethod: PaymentMethod;
  defaultDonationType: DonationType;
  defaultAnonymousDonations: boolean;
  currency: "GHS" | "USD";
  language: "English" | "Twi" | "Ga" | "Ewe";
  biometricLogin: boolean;
  donationReceipts: boolean;
  twoFactorAuth: boolean;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  donationReceipts: boolean;
  campaignUpdates: boolean;
  groupInvites: boolean;
  weeklyImpactSummary: boolean;
  marketingMessages: boolean;
}

export interface ImpactStats {
  totalRaised: number;
  beneficiariesHelped: number;
  totalDonors: number;
  mobileDownloads: number;
}
