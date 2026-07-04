import { Router } from "express";
import { prisma } from "../config/prisma.js";

export const adminRouter = Router();

// Get all users with pagination and search
adminRouter.get("/users", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 10) || 10));
    const query = String(req.query.q ?? "").trim().toLowerCase();

    // For enum fields, we fetch all and filter in memory
    const allUsers = query
      ? (await prisma.user.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            location: true,
            createdAt: true
          }
        })).filter((user: { firstName: string; lastName: string; email: string; phone: string; role: string; status: string }) =>
          [user.firstName, user.lastName, user.email, user.phone, user.role, user.status]
            .some((value: string) => value.toLowerCase().includes(query))
        )
      : await prisma.user.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            location: true,
            createdAt: true
          }
        });

    const total = allUsers.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    res.json({
      data: allUsers.slice(start, start + pageSize),
      page: safePage,
      pageSize,
      total,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get admin overview stats
adminRouter.get("/overview", async (_req, res) => {
  try {
    const [
      totalCampaigns,
      activeCampaigns,
      pendingPayouts,
      totalDonations,
      totalPayouts,
      pendingVerifications
    ] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.payoutRequest.count({ where: { status: "PENDING" } }),
      prisma.donation.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true }
      }),
      prisma.payoutRequest.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true }
      }),
      prisma.verification.count({ where: { status: "PENDING" } })
    ]);

    const pendingPayoutTotal = await prisma.payoutRequest.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true }
    });

    const donationSum = totalDonations._sum?.amount ?? 0;
    const pendingPayoutSum = pendingPayoutTotal._sum?.amount ?? 0;

    res.json({
      updatedAt: new Date().toISOString(),
      stats: [
        { 
          label: "Submitted campaigns", 
          value: String(totalCampaigns), 
          detail: `${pendingVerifications} awaiting verification` 
        },
        { 
          label: "Verified live", 
          value: String(activeCampaigns), 
          detail: `₵${(donationSum / 1000).toFixed(1)}k raised` 
        },
        { 
          label: "Payout queue", 
          value: `₵${(pendingPayoutSum / 1000).toFixed(1)}k`, 
          detail: `${pendingPayouts} beneficiary requests` 
        },
        { 
          label: "Pending verifications", 
          value: String(pendingVerifications), 
          detail: `${pendingVerifications} awaiting review` 
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch overview", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Global search
adminRouter.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q ?? "").trim().toLowerCase();
    if (!query) return res.json([]);

    const [users, campaigns, payouts] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 4,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }),
      prisma.campaign.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 4,
        select: {
          id: true,
          title: true,
          category: true,
          status: true
        }
      }),
      prisma.payoutRequest.findMany({
        where: {
          campaign: { title: { contains: query, mode: "insensitive" } }
        },
        take: 4,
        include: {
          campaign: { select: { title: true } },
          user: { select: { firstName: true, lastName: true } }
        }
      })
    ]);

    type SearchResult = { id: string; title: string; detail: string; tab: string; type: string };
    const results: SearchResult[] = [
      ...users.map((user) => ({
        id: user.id,
        title: `${user.firstName} ${user.lastName}`,
        detail: `${user.role} · ${user.email}`,
        tab: "users" as const,
        type: "User"
      })),
      ...campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        detail: `${campaign.category} · ${campaign.status}`,
        tab: "verification" as const,
        type: "Campaign"
      })),
      ...payouts.map((payout) => ({
        id: payout.id,
        title: payout.campaign.title,
        detail: `${payout.status} · ${payout.user.firstName} ${payout.user.lastName}`,
        tab: "payouts" as const,
        type: "Payout"
      }))
    ];

    res.json(results.slice(0, 8));
  } catch (error) {
    res.status(500).json({ error: "Search failed", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update user
adminRouter.put("/users/:id", async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true
      }
    });

    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

// Block user
adminRouter.post("/users/:id/block", async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "SUSPENDED" as const },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true
      }
    });

    res.json({ message: "User blocked", user });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

// Unblock user
adminRouter.post("/users/:id/unblock", async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE" as const },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true
      }
    });

    res.json({ message: "User unblocked", user });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

// Get all campaigns
adminRouter.get("/campaigns", async (_req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        raisedAmount: true,
        goalAmount: true,
        beneficiary: {
          select: {
            firstName: true,
            lastName: true,
            isIdentityVerified: true
          }
        }
      }
    });

    const formatted = campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      category: campaign.category,
      status: campaign.status,
      raisedAmount: campaign.raisedAmount,
      goalAmount: campaign.goalAmount,
      beneficiary: `${campaign.beneficiary.firstName} ${campaign.beneficiary.lastName}`,
      verificationStatus: campaign.beneficiary.isIdentityVerified ? "VERIFIED" : "PENDING"
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaigns", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Verify campaign
adminRouter.post("/campaigns/:id/verify", async (req, res) => {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { isVerified: true }
    });

    res.json({ message: "Campaign verified", campaignId: campaign.id });
  } catch (error) {
    res.status(404).json({ message: "Campaign not found" });
  }
});

// Get all donations
adminRouter.get("/donations", async (_req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        donor: {
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

    const formatted = donations.map((donation) => ({
      id: donation.id,
      campaignTitle: donation.campaign.title,
      amount: donation.amount,
      status: donation.status,
      paymentMethod: donation.paymentMethod,
      donor: `${donation.donor.firstName} ${donation.donor.lastName}`,
      createdAt: donation.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donations", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get all payouts with pagination
adminRouter.get("/payouts", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 10) || 10));
    const statusFilter = String(req.query.status ?? "ALL").toUpperCase();

    const payouts = await prisma.payoutRequest.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        campaign: { select: { title: true } }
      }
    });

    // Filter in memory for status
    const filteredPayouts = statusFilter === "ALL" 
      ? payouts 
      : payouts.filter(p => p.status === statusFilter);

    const total = statusFilter === "ALL"
      ? await prisma.payoutRequest.count()
      : filteredPayouts.length;

    const formatted = filteredPayouts.map((payout) => ({
      id: payout.id,
      campaignTitle: payout.campaign.title,
      amount: payout.amount,
      status: payout.status,
      destination: `${payout.bankName || payout.mobileMoneyProvider || "Transfer"} - ${payout.user.firstName} ${payout.user.lastName}`,
      requestedBy: `${payout.user.firstName} ${payout.user.lastName}`,
      method: payout.bankName ? "Bank transfer" : "Mobile money",
      requestedAt: payout.createdAt.toLocaleString(),
      approvedAt: payout.approvedAt?.toLocaleString()
    }));

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.json({
      data: formatted,
      page,
      pageSize,
      total,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payouts", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Approve payout
adminRouter.post("/payouts/:id/approve", async (req, res) => {
  try {
    const payout = await prisma.payoutRequest.findUnique({
      where: { id: req.params.id }
    });

    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    const approvedAmount = req.body.amount ? Number(req.body.amount) : payout.amount;

    if (isNaN(approvedAmount) || approvedAmount <= 0) {
      return res.status(400).json({ message: "Invalid payout amount" });
    }

    const updatedPayout = await prisma.payoutRequest.update({
      where: { id: req.params.id },
      data: {
        status: "SUCCESS",
        amount: approvedAmount,
        approvedAt: new Date()
      }
    });

    res.json({ 
      message: "Payout approved", 
      payout: {
        id: updatedPayout.id,
        status: updatedPayout.status,
        amount: updatedPayout.amount,
        approvedAt: updatedPayout.approvedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve payout", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Reject payout
adminRouter.post("/payouts/:id/reject", async (req, res) => {
  try {
    const payout = await prisma.payoutRequest.update({
      where: { id: req.params.id },
      data: { status: "FAILED" }
    });

    res.json({ 
      message: "Payout rejected", 
      payout: {
        id: payout.id,
        status: payout.status
      }
    });
  } catch (error) {
    res.status(404).json({ message: "Payout not found" });
  }
});

// Get alerts/risk flags
adminRouter.get("/alerts", async (_req, res) => {
  res.json([]);
});

// Dismiss alert
adminRouter.post("/alerts/:id/dismiss", (_req, res) => {
  res.status(404).json({ message: "Alert not found" });
});

// Change password
adminRouter.post("/change-password", (req, res) => {
  const password = String(req.body.password ?? "");
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  res.json({ message: "Admin password changed" });
});

// Get notifications
adminRouter.get("/notifications", async (_req, res) => {
  res.json({ unreadCount: 0, notifications: [] });
});

// Mark notification as read
adminRouter.put("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(404).json({ message: "Notification not found" });
  }
});

adminRouter.post("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(404).json({ message: "Notification not found" });
  }
});

// Mark all notifications as read
adminRouter.put("/notifications/read-all", async (_req, res) => {
  await prisma.notification.updateMany({ data: { isRead: true } });
  res.json({ message: "Notifications marked as read", unreadCount: 0, notifications: [] });
});

// Get financial reports
adminRouter.get("/financial/reports", async (_req, res) => {
  try {
    const [
      donationTotal,
      payoutTotal,
      donations,
      payouts
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true }
      }),
      prisma.payoutRequest.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true }
      }),
      prisma.donation.findMany({
        where: { status: "COMPLETED" },
        include: {
          campaign: { select: { title: true } }
        }
      }),
      prisma.payoutRequest.findMany({
        include: {
          user: { select: { firstName: true, lastName: true } },
          campaign: { select: { title: true } }
        }
      })
    ]);

    const totalDonations = donationTotal._sum?.amount ?? 0;
    const totalPayouts = payoutTotal._sum?.amount ?? 0;
    const platformFees = Math.round(totalDonations * 0.025);

    const ledger = [
      ...donations.map((donation) => ({
        id: donation.id,
        type: "DONATION" as const,
        title: donation.campaign.title,
        party: `Donor - ${donation.donorId}`,
        amount: donation.amount,
        fee: Math.round(donation.amount * 0.025),
        netAmount: donation.amount - Math.round(donation.amount * 0.025),
        status: donation.status,
        reference: donation.paymentReference,
        createdAt: donation.createdAt.toISOString()
      })),
      ...payouts.map((payout) => ({
        id: payout.id,
        type: "PAYOUT" as const,
        title: payout.campaign.title,
        party: `Beneficiary - ${payout.user.firstName} ${payout.user.lastName}`,
        amount: -payout.amount,
        fee: 0,
        netAmount: -payout.amount,
        status: payout.status,
        reference: `PAYOUT-${payout.id}`,
        createdAt: payout.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const netRaised = totalDonations - totalPayouts - platformFees;

    res.json({
      summary: {
        donationTotal: totalDonations,
        payoutTotal: totalPayouts,
        platformFees,
        netRaised,
        availableForPayout: totalPayouts,
        donationCount: donations.length,
        payoutCount: payouts.length
      },
      ledger,
      activeContributors: []
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate reports", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get system settings
adminRouter.get("/system/settings", async (_req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const featureFlags = settings.filter((s) => s.key.startsWith("feature_"));
    const mobileSettingsData = settings.filter((s) => s.key.startsWith("mobile_"));

    res.json({
      featureFlags: featureFlags.map((f) => ({
        id: f.key,
        ...(typeof f.value === "object" && f.value !== null ? f.value as Record<string, unknown> : {}),
        description: f.description
      })),
      mobileSettings: mobileSettingsData.map((f) => ({
        id: f.key,
        ...(typeof f.value === "object" && f.value !== null ? f.value as Record<string, unknown> : {}),
        description: f.description
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update system settings
adminRouter.put("/system/settings", async (req, res) => {
  try {
    if (Array.isArray(req.body.featureFlags)) {
      for (const flag of req.body.featureFlags) {
        await prisma.systemSetting.upsert({
          where: { key: flag.id },
          update: { value: flag },
          create: {
            key: flag.id,
            value: flag,
            description: flag.description,
            isPublic: false
          }
        });
      }
    }

    if (Array.isArray(req.body.mobileSettings)) {
      for (const setting of req.body.mobileSettings) {
        await prisma.systemSetting.upsert({
          where: { key: setting.id },
          update: { value: setting },
          create: {
            key: setting.id,
            value: setting,
            description: setting.description,
            isPublic: true
          }
        });
      }
    }

    res.json({ message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get feature flags
adminRouter.get("/feature-flags", async (_req, res) => {
  try {
    const flags = await prisma.featureFlag.findMany();
    res.json(flags.map((f) => ({
      id: f.id,
      key: f.key,
      enabled: f.enabled,
      description: f.description,
      platform: f.platform
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feature flags", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update feature flag
adminRouter.put("/feature-flags/:id", async (req, res) => {
  try {
    const flag = await prisma.featureFlag.update({
      where: { id: req.params.id },
      data: { enabled: Boolean(req.body.enabled) }
    });
    res.json({ message: "Feature flag updated", flag });
  } catch (error) {
    res.status(404).json({ message: "Feature flag not found" });
  }
});

// Create/update feature flag
adminRouter.post("/feature-flags/:id", async (req, res) => {
  try {
    const flag = await prisma.featureFlag.upsert({
      where: { id: req.params.id },
      update: { enabled: Boolean(req.body.enabled) },
      create: {
        id: req.params.id,
        key: req.params.id,
        enabled: Boolean(req.body.enabled),
        description: req.body.description || ""
      }
    });
    res.json({ message: "Feature flag updated", flag });
  } catch (error) {
    res.status(500).json({ error: "Failed to update feature flag", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get mobile settings
adminRouter.get("/mobile/settings", async (_req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { startsWith: "mobile_" } }
    });
    res.json(settings.map((s) => ({
      id: s.key,
      ...(typeof s.value === "object" && s.value !== null ? s.value as Record<string, unknown> : {}),
      description: s.description
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch mobile settings", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update mobile setting
adminRouter.put("/mobile/settings/:id", async (req, res) => {
  try {
    const setting = await prisma.systemSetting.update({
      where: { key: req.params.id },
      data: { value: { ...req.body } }
    });
    res.json({ message: "Mobile setting updated", setting });
  } catch (error) {
    res.status(404).json({ message: "Mobile setting not found" });
  }
});

// Create/update mobile setting
adminRouter.post("/mobile/settings/:id", async (req, res) => {
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key: req.params.id },
      update: { value: req.body },
      create: {
        key: req.params.id,
        value: req.body,
        description: req.body.description || "",
        isPublic: true
      }
    });
    res.json({ message: "Mobile setting updated", setting });
  } catch (error) {
    res.status(500).json({ error: "Failed to update mobile setting", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get mobile stats
adminRouter.get("/mobile/stats", async (_req, res) => {
  try {
    const [downloads, activeDevices] = await Promise.all([
      prisma.mobileSession.count(),
      prisma.mobileSession.count({
        where: { expiresAt: { gt: new Date() } }
      })
    ]);
    res.json({ downloads, activeDevices });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch mobile stats", message: error instanceof Error ? error.message : "Unknown error" });
  }
});