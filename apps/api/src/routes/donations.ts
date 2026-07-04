import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

export const donationRouter = Router();

const paymentMethodSchema = z.enum(["CARD", "MOBILE_MONEY", "BANK_TRANSFER", "OFFLINE"]);
const donationTypeSchema = z.enum(["ONE_TIME", "DAILY", "WEEKLY", "MONTHLY"]);
const donationModeSchema = z.enum(["INDIVIDUAL", "SPLIT", "GROUP"]);
const donationKindSchema = z.enum(["MONEY", "ITEMS", "MONEY_AND_ITEMS"]);

const initializeDonationSchema = z.object({
  campaignId: z.string().min(1),
  amount: z.number().min(0),
  kind: donationKindSchema.default("MONEY"),
  paymentMethod: paymentMethodSchema,
  type: donationTypeSchema.default("ONE_TIME"),
  mode: donationModeSchema.default("INDIVIDUAL"),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(280).optional(),
  phoneNumber: z.string().max(24).optional(),
  itemDonations: z
    .array(
      z.object({
        itemId: z.string().min(1),
        itemName: z.string().min(1),
        quantity: z.number().min(1),
        condition: z.enum(["NEW", "GOOD", "USED"]),
        deliveryMethod: z.enum(["PICKUP", "DROP_OFF"]),
        donorContact: z.string().min(6)
      })
    )
    .optional(),
  paymentDetails: z
    .object({
      provider: z.literal("PAYSTACK_DEMO"),
      payerName: z.string().min(2),
      payerEmail: z.string().email(),
      cardLast4: z.string().optional(),
      mobileMoneyProvider: z.enum(["MTN", "VODAFONE", "AIRTELTIGO"]).optional(),
      bankName: z.string().optional(),
      accountName: z.string().optional(),
      transferReference: z.string().optional(),
      offlinePledgeNote: z.string().optional()
    })
    .optional(),
  splitPayments: z
    .array(
      z.object({
        label: z.string().min(1),
        amount: z.number().min(1),
        paymentMethod: paymentMethodSchema,
        phoneNumber: z.string().max(24).optional()
      })
    )
    .optional(),
  groupDonation: z
    .object({
      groupName: z.string().min(2),
      organizerName: z.string().min(2),
      expectedMembers: z.number().int().min(2).max(500),
      allowMemberMessages: z.boolean()
    })
    .optional()
}).superRefine((payload, context) => {
  if (payload.kind !== "ITEMS" && payload.amount < 1) {
    context.addIssue({ code: "custom", path: ["amount"], message: "Money donations must be at least 1." });
  }

  if (payload.kind !== "MONEY" && (!payload.itemDonations || payload.itemDonations.length < 1)) {
    context.addIssue({ code: "custom", path: ["itemDonations"], message: "Item donations require at least one requested item." });
  }

  if (payload.kind !== "ITEMS" && !payload.paymentDetails) {
    context.addIssue({ code: "custom", path: ["paymentDetails"], message: "Money donations require payment details." });
  }

  if (payload.kind !== "ITEMS" && payload.paymentDetails) {
    if (payload.paymentMethod === "CARD" && !payload.paymentDetails.cardLast4) {
      context.addIssue({ code: "custom", path: ["paymentDetails", "cardLast4"], message: "Card payments require card details." });
    }

    if (payload.paymentMethod === "MOBILE_MONEY" && !payload.paymentDetails.mobileMoneyProvider) {
      context.addIssue({ code: "custom", path: ["paymentDetails", "mobileMoneyProvider"], message: "Mobile money payments require a network." });
    }

    if (payload.paymentMethod === "BANK_TRANSFER" && (!payload.paymentDetails.bankName || !payload.paymentDetails.accountName)) {
      context.addIssue({ code: "custom", path: ["paymentDetails", "bankName"], message: "Bank transfer payments require bank and account details." });
    }

    if (payload.paymentMethod === "OFFLINE" && !payload.paymentDetails.offlinePledgeNote) {
      context.addIssue({ code: "custom", path: ["paymentDetails", "offlinePledgeNote"], message: "Offline pledges require a pledge note." });
    }
  }

  if (payload.mode === "SPLIT" && payload.kind !== "ITEMS") {
    if (!payload.splitPayments || payload.splitPayments.length < 2) {
      context.addIssue({ code: "custom", path: ["splitPayments"], message: "Split donations need at least two payment parts." });
      return;
    }

    const splitTotal = payload.splitPayments.reduce((total, item) => total + item.amount, 0);
    if (Math.abs(splitTotal - payload.amount) > 0.01) {
      context.addIssue({ code: "custom", path: ["splitPayments"], message: "Split payment amounts must add up to the donation amount." });
    }
  }

  if (payload.mode === "GROUP" && !payload.groupDonation) {
    context.addIssue({ code: "custom", path: ["groupDonation"], message: "Group donation details are required." });
  }
});

// Initialize donation
donationRouter.post("/initialize", async (req, res, next) => {
  try {
    const payload = initializeDonationSchema.parse(req.body);
    
    // Find the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: payload.campaignId },
          { slug: payload.campaignId }
        ]
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const reference = `BOAME-DON-${Date.now()}`;
    const netAmount = payload.amount - Math.round(payload.amount * 0.025);

    // Create donation record in database
    const donation = await prisma.donation.create({
      data: {
        campaignId: campaign.id,
        donorId: "placeholder", // Will come from auth in real implementation
        amount: payload.amount,
        netAmount,
        type: payload.type,
        paymentMethod: payload.paymentMethod,
        isAnonymous: payload.isAnonymous,
        message: payload.message,
        paymentReference: reference,
        paymentProvider: "PAYSTACK_DEMO",
        status: "COMPLETED",
        paymentData: payload.paymentDetails || {}
      }
    });

    res.status(201).json({
      reference,
      authorizationUrl: "https://checkout.paystack.com/development",
      donation: {
        id: donation.id,
        campaignId: donation.campaignId,
        campaignTitle: campaign.title,
        amount: donation.amount,
        type: donation.type,
        paymentMethod: donation.paymentMethod,
        kind: payload.kind,
        mode: payload.mode,
        isAnonymous: donation.isAnonymous,
        reference: donation.paymentReference,
        status: donation.status,
        createdAt: donation.createdAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get payment methods
donationRouter.get("/payment-methods", (_req, res) =>
  res.json([
    { id: "MOBILE_MONEY", label: "Mobile money", provider: "Paystack", requiredFields: ["payerName", "payerEmail", "mobileMoneyProvider", "phoneNumber"] },
    { id: "CARD", label: "Card", provider: "Paystack", requiredFields: ["payerName", "payerEmail", "cardNumber", "expiry", "cvv"] },
    { id: "BANK_TRANSFER", label: "Bank transfer", provider: "Paystack transfer", requiredFields: ["payerName", "payerEmail", "bankName", "accountName"] },
    { id: "OFFLINE", label: "Offline pledge", provider: "BoaMe operations", requiredFields: ["payerName", "payerEmail", "offlinePledgeNote"] }
  ])
);

// Verify donation
donationRouter.get("/verify/:reference", async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { paymentReference: req.params.reference },
      include: {
        campaign: {
          select: { title: true }
        }
      }
    });

    if (!donation) {
      return res.json({ reference: req.params.reference, status: "SUCCESS" });
    }

    res.json({
      id: donation.id,
      reference: donation.paymentReference,
      status: donation.status,
      amount: donation.amount,
      campaignTitle: donation.campaign.title
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify donation", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get donation history
donationRouter.get("/history", async (_req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          select: { title: true }
        }
      }
    });

    const formatted = donations.map(donation => ({
      id: donation.id,
      campaignId: donation.campaignId,
      campaignTitle: donation.campaign.title,
      amount: donation.amount,
      type: donation.type,
      paymentMethod: donation.paymentMethod,
      isAnonymous: donation.isAnonymous,
      reference: donation.paymentReference,
      status: donation.status,
      createdAt: donation.createdAt.toISOString()
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donations", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get recurring donations
donationRouter.get("/recurring", async (_req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { type: { not: "ONE_TIME" } },
      include: {
        campaign: {
          select: { title: true }
        }
      }
    });

    const formatted = donations.map(donation => ({
      id: donation.id,
      campaignId: donation.campaignId,
      campaignTitle: donation.campaign.title,
      amount: donation.amount,
      type: donation.type,
      paymentMethod: donation.paymentMethod,
      isAnonymous: donation.isAnonymous,
      reference: donation.paymentReference,
      status: donation.status,
      createdAt: donation.createdAt.toISOString()
    }));

    res.json(formatted);
  } catch (error) {
    res.json([]);
  }
});

// Update recurring donation
donationRouter.put("/recurring/:id", (_req, res) => res.json({ message: "Recurring donation updated" }));
donationRouter.delete("/recurring/:id", (_req, res) => res.status(204).send());

// Mobile donation initiation
donationRouter.post("/mobile/initiate", async (req, res, next) => {
  try {
    const payload = initializeDonationSchema.parse(req.body);
    
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: payload.campaignId },
          { slug: payload.campaignId }
        ]
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(201).json({ 
      message: "Mobile donation initiated", 
      campaignTitle: campaign.title,
      amount: payload.amount,
      reference: `BOAME-MOBILE-${Date.now()}`
    });
  } catch (error) {
    next(error);
  }
});

// Get donation by ID
donationRouter.get("/:id", async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id },
      include: {
        campaign: {
          select: { title: true }
        }
      }
    });

    if (!donation) {
      return res.json({ id: req.params.id, status: "not_found" });
    }

    res.json({
      id: donation.id,
      campaignTitle: donation.campaign.title,
      amount: donation.amount,
      status: donation.status,
      paymentMethod: donation.paymentMethod,
      createdAt: donation.createdAt.toISOString()
    });
  } catch (error) {
    res.json({ id: req.params.id, status: "error" });
  }
});

// Generate receipt
donationRouter.post("/:id/receipt", (_req, res) => res.json({ message: "Receipt generated" }));

// Refund donation
donationRouter.post("/:id/refund", (_req, res) => res.json({ message: "Refund requested" }));