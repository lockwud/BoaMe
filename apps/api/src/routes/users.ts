import { Router } from "express";
import { z } from "zod";
import { registeredUsers } from "./auth.js";

export const userRouter = Router();

const settingsSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(6),
  defaultPaymentMethod: z.enum(["CARD", "MOBILE_MONEY", "BANK_TRANSFER", "OFFLINE"]),
  defaultDonationType: z.enum(["ONE_TIME", "DAILY", "WEEKLY", "MONTHLY"]),
  defaultAnonymousDonations: z.boolean(),
  currency: z.enum(["GHS", "USD"]),
  language: z.enum(["English", "Twi", "Ga", "Ewe"]),
  biometricLogin: z.boolean(),
  donationReceipts: z.boolean(),
  twoFactorAuth: z.boolean()
});

const notificationPreferenceSchema = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  donationReceipts: z.boolean(),
  campaignUpdates: z.boolean(),
  groupInvites: z.boolean(),
  weeklyImpactSummary: z.boolean(),
  marketingMessages: z.boolean()
});

let userSettings = {
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

let notificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  donationReceipts: true,
  campaignUpdates: true,
  groupInvites: true,
  weeklyImpactSummary: true,
  marketingMessages: false
};

const notifications = [
  {
    id: "notif-1",
    title: "Donation received",
    body: "Your ₵25 donation receipt is ready.",
    type: "PAYMENT_CONFIRMATION",
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "notif-2",
    title: "Campaign update",
    body: "A verified campaign you supported posted a new impact update.",
    type: "CAMPAIGN_UPDATE",
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

function decodeBearerToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = Buffer.from(parts[1], "base64").toString("utf8");
    return JSON.parse(payload) as { email?: string };
  } catch {
    return null;
  }
}

userRouter.get("/profile", (req, res) => {
  const authHeader = req.header("authorization");
  let userEmail: string | undefined;

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const decoded = decodeBearerToken(token);
    if (decoded?.email) {
      userEmail = decoded.email.toLowerCase();
    }
  }

  if (!userEmail) {
    return res.status(401).json({ message: "Unauthorized: missing or invalid token" });
  }

  const user = registeredUsers.get(userEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: `user-${userEmail}`,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role
  });
});
userRouter.put("/profile", (_req, res) => res.json({ message: "Profile updated" }));
userRouter.post("/change-password", (_req, res) => res.json({ message: "Password changed" }));
userRouter.get("/settings", (_req, res) => res.json(userSettings));
userRouter.put("/settings", (req, res, next) => {
  try {
    userSettings = settingsSchema.parse(req.body);
    res.json(userSettings);
  } catch (error) {
    next(error);
  }
});
userRouter.get("/notifications", (_req, res) => res.json(notifications));
userRouter.get("/notifications/preferences", (_req, res) => res.json(notificationPreferences));
userRouter.put("/notifications/preferences", (req, res, next) => {
  try {
    notificationPreferences = notificationPreferenceSchema.parse(req.body);
    res.json(notificationPreferences);
  } catch (error) {
    next(error);
  }
});
userRouter.put("/notifications/:id/read", (req, res) => {
  const notification = notifications.find((item) => item.id === req.params.id);
  if (notification) {
    notification.read = true;
  }
  res.json(notification ?? { id: req.params.id, read: true });
});
userRouter.get("/campaigns", (_req, res) => res.json([]));
userRouter.get("/donations", (_req, res) => res.json([]));
userRouter.get("/dashboard/stats", (_req, res) => res.json({ totalDonated: 0, campaignsSupported: 0, givingStreak: 0 }));
userRouter.post("/verification", (_req, res) => res.status(201).json({ message: "Verification submitted" }));
userRouter.get("/verification/status", (_req, res) => res.json({ status: "PENDING" }));
userRouter.post("/upload-image", (_req, res) => res.status(201).json({ url: "" }));
userRouter.post("/mobile/device", (_req, res) => res.status(201).json({ message: "Device registered" }));
userRouter.put("/mobile/device/:id", (_req, res) => res.json({ message: "Device updated" }));
userRouter.delete("/mobile/device/:id", (_req, res) => res.status(204).send());
