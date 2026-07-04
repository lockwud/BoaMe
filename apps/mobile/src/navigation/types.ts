import type { NavigatorScreenParams } from "@react-navigation/native";
import type { DonationKind, PaymentMethod } from "@boame/shared-types";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  CampaignDetail: { slug: string };
  CreateCampaign: undefined;
  Donate: { slug: string };
  Checkout: {
    authorizationUrl: string;
    reference: string;
    amount: number;
    campaignTitle: string;
    kind?: DonationKind;
    paymentMethod: PaymentMethod;
  };
  DonationSuccess: {
    reference: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    amount: number;
    campaignTitle: string;
    kind?: DonationKind;
    paymentMethod: PaymentMethod;
  };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Campaigns: undefined;
  Donations: undefined;
  Notifications: undefined;
  Settings: undefined;
};
