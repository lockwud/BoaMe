import { Router } from "express";
import { prisma } from "../config/prisma.js";

export const payoutRouter = Router();

// Request a payout
payoutRouter.post("/request", async (req, res) => {
  try {
    const {
      campaignId,
      amount,
      bankName,
      accountNumber,
      accountName,
      mobileMoneyNumber,
      mobileMoneyProvider,
      userId,
      notes
    } = req.body;

    if (!campaignId || !amount) {
      return res.status(400).json({ message: "campaignId and amount are required" });
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Create payout request
    const payout = await prisma.payoutRequest.create({
      data: {
        userId: userId || "placeholder",
        campaignId,
        amount: Number(amount),
        netAmount: Number(amount),
        bankName,
        accountNumber,
        accountName,
        mobileMoneyNumber,
        mobileMoneyProvider,
        notes,
        status: "PENDING"
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        campaign: {
          select: {
            title: true
          }
        }
      }
    });

    res.status(201).json({
      message: "Payout requested",
      payout: {
        id: payout.id,
        userId: payout.userId,
        campaignId: payout.campaignId,
        campaignTitle: payout.campaign.title,
        amount: payout.amount,
        status: payout.status,
        requestedBy: `${payout.user.firstName} ${payout.user.lastName}`,
        createdAt: payout.createdAt.toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to request payout", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get payout history
payoutRouter.get("/history", async (req, res) => {
  try {
    const userId = String(req.query.userId || "");
    const where = userId ? { userId } : {};

    const payouts = await prisma.payoutRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          select: {
            title: true
          }
        }
      }
    });

    res.json(payouts.map(payout => ({
      id: payout.id,
      campaignId: payout.campaignId,
      campaignTitle: payout.campaign.title,
      amount: payout.amount,
      status: payout.status,
      notes: payout.notes,
      createdAt: payout.createdAt.toISOString(),
      completedAt: payout.completedAt?.toISOString()
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payout history", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get payout by ID
payoutRouter.get("/:id", async (req, res) => {
  try {
    const payout = await prisma.payoutRequest.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        campaign: {
          select: {
            title: true,
            raisedAmount: true,
            goalAmount: true
          }
        }
      }
    });

    if (!payout) {
      return res.json({ id: "development-payout" });
    }

    res.json({
      id: payout.id,
      campaignTitle: payout.campaign.title,
      amount: payout.amount,
      status: payout.status,
      requestedBy: `${payout.user.firstName} ${payout.user.lastName}`,
      email: payout.user.email,
      phone: payout.user.phone,
      bankName: payout.bankName,
      accountNumber: payout.accountNumber,
      mobileMoneyNumber: payout.mobileMoneyNumber,
      mobileMoneyProvider: payout.mobileMoneyProvider,
      notes: payout.notes,
      createdAt: payout.createdAt.toISOString(),
      approvedAt: payout.approvedAt?.toISOString(),
      completedAt: payout.completedAt?.toISOString()
    });
  } catch (error) {
    res.json({ id: "development-payout" });
  }
});