import { Router } from "express";
import { prisma } from "../config/prisma.js";

export const campaignRouter = Router();

// Get featured campaigns
campaignRouter.get("/featured", async (_req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      include: {
        beneficiary: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            location: true,
            isIdentityVerified: true
          }
        },
        media: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    const formatted = campaigns.map(campaign => ({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      status: campaign.status,
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      minimumDonation: campaign.minimumDonation,
      location: campaign.location,
      coverImage: campaign.coverImage,
      isFeatured: campaign.isFeatured,
      endDate: campaign.endDate?.toISOString(),
      beneficiary: {
        id: campaign.beneficiary.id,
        firstName: campaign.beneficiary.firstName,
        lastName: campaign.beneficiary.lastName,
        role: campaign.beneficiary.role,
        location: campaign.beneficiary.location,
        isIdentityVerified: campaign.beneficiary.isIdentityVerified
      },
      campaignMedia: campaign.media.map(m => ({
        id: m.id,
        type: m.type,
        title: m.title,
        description: m.description,
        thumbnailUrl: m.thumbnailUrl,
        streamUrl: m.streamUrl,
        status: m.status,
        startsAt: m.startsAt?.toISOString(),
        durationLabel: m.durationLabel
      }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch featured campaigns", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get urgent campaigns (emergency category)
campaignRouter.get("/urgent", async (_req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { category: "EMERGENCY", status: "ACTIVE" },
      include: {
        beneficiary: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch urgent campaigns", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get all campaigns
campaignRouter.get("/", async (_req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: {
        beneficiary: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            location: true,
            isIdentityVerified: true
          }
        },
        media: true
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = campaigns.map(campaign => ({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      status: campaign.status,
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      minimumDonation: campaign.minimumDonation,
      location: campaign.location,
      coverImage: campaign.coverImage,
      isFeatured: campaign.isFeatured,
      endDate: campaign.endDate?.toISOString(),
      beneficiary: {
        id: campaign.beneficiary.id,
        firstName: campaign.beneficiary.firstName,
        lastName: campaign.beneficiary.lastName,
        role: campaign.beneficiary.role,
        location: campaign.beneficiary.location,
        isIdentityVerified: campaign.beneficiary.isIdentityVerified
      },
      campaignMedia: campaign.media.map(m => ({
        id: m.id,
        type: m.type,
        title: m.title,
        description: m.description,
        thumbnailUrl: m.thumbnailUrl,
        streamUrl: m.streamUrl,
        status: m.status,
        startsAt: m.startsAt?.toISOString(),
        durationLabel: m.durationLabel
      }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaigns", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Create new campaign
campaignRouter.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      goalAmount,
      location,
      story,
      minimumDonation,
      beneficiaryId
    } = req.body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now();

    const campaign = await prisma.campaign.create({
      data: {
        title,
        slug,
        description,
        story,
        category: category || "OTHER",
        goalAmount: goalAmount || 0,
        minimumDonation: minimumDonation || 1,
        location,
        beneficiaryId: beneficiaryId || "placeholder",
        status: "PENDING_APPROVAL"
      }
    });

    res.status(201).json({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      status: campaign.status,
      beneficiaryId: campaign.beneficiaryId
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create campaign", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get campaign by ID or slug
campaignRouter.get("/:id", async (req, res) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: req.params.id },
          { slug: req.params.id }
        ]
      },
      include: {
        beneficiary: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            location: true,
            isIdentityVerified: true
          }
        },
        media: true,
        updates: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Increment views
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { views: { increment: 1 } }
    });

    const formatted = {
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      story: campaign.story,
      category: campaign.category,
      status: campaign.status,
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      minimumDonation: campaign.minimumDonation,
      location: campaign.location,
      coverImage: campaign.coverImage,
      imageUrl: campaign.imageUrl,
      videoUrl: campaign.videoUrl,
      isFeatured: campaign.isFeatured,
      isVerified: campaign.isVerified,
      views: campaign.views,
      startDate: campaign.startDate?.toISOString(),
      endDate: campaign.endDate?.toISOString(),
      beneficiary: {
        id: campaign.beneficiary.id,
        firstName: campaign.beneficiary.firstName,
        lastName: campaign.beneficiary.lastName,
        role: campaign.beneficiary.role,
        location: campaign.beneficiary.location,
        isIdentityVerified: campaign.beneficiary.isIdentityVerified
      },
      campaignMedia: campaign.media.map(m => ({
        id: m.id,
        type: m.type,
        title: m.title,
        description: m.description,
        thumbnailUrl: m.thumbnailUrl,
        streamUrl: m.streamUrl,
        status: m.status,
        startsAt: m.startsAt?.toISOString(),
        durationLabel: m.durationLabel
      })),
      updates: campaign.updates
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update campaign
campaignRouter.put("/:id", async (req, res) => {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ message: "Campaign updated", id: campaign.id });
  } catch (error) {
    res.status(404).json({ message: "Campaign not found" });
  }
});

// Delete campaign
campaignRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "Campaign not found" });
  }
});

// Get campaign updates
campaignRouter.get("/:id/updates", async (req, res) => {
  try {
    const updates = await prisma.campaignUpdate.findMany({
      where: { campaignId: req.params.id },
      orderBy: { createdAt: "desc" }
    });

    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign updates", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Add campaign update
campaignRouter.post("/:id/updates", async (req, res) => {
  try {
    const update = await prisma.campaignUpdate.create({
      data: {
        campaignId: req.params.id,
        title: req.body.title,
        content: req.body.content,
        imageUrl: req.body.imageUrl,
        isPublic: req.body.isPublic !== false
      }
    });

    res.status(201).json({ message: "Update added", update });
  } catch (error) {
    res.status(500).json({ error: "Failed to add update", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get campaign donations
campaignRouter.get("/:id/donations", async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { campaignId: req.params.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign donations", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get campaign stats
campaignRouter.get("/:id/stats", async (req, res) => {
  try {
    const [campaign, donationStats] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: req.params.id },
        select: { views: true, shares: true }
      }),
      prisma.donation.count({
        where: { campaignId: req.params.id, status: "COMPLETED" }
      })
    ]);

    res.json({
      views: campaign?.views || 0,
      shares: campaign?.shares || 0,
      donations: donationStats
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign stats", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Approve campaign
campaignRouter.post("/:id/approve", async (req, res) => {
  try {
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE" }
    });

    res.json({ message: "Campaign approved" });
  } catch (error) {
    res.status(404).json({ message: "Campaign not found" });
  }
});

// Reject campaign
campaignRouter.post("/:id/reject", async (req, res) => {
  try {
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" }
    });

    res.json({ message: "Campaign rejected" });
  } catch (error) {
    res.status(404).json({ message: "Campaign not found" });
  }
});