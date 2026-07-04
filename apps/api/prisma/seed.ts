import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@boame.com" },
    update: {},
    create: {
      email: "admin@boame.com",
      phone: "+233200000001",
      password,
      firstName: "BoaMe",
      lastName: "Admin",
      role: "ADMIN",
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      verificationStatus: "APPROVED"
    }
  });

  const beneficiary = await prisma.user.upsert({
    where: { email: "beneficiary@boame.com" },
    update: {},
    create: {
      email: "beneficiary@boame.com",
      phone: "+233200000002",
      password,
      firstName: "Ama",
      lastName: "Mensah",
      role: "BENEFICIARY",
      location: "Accra",
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      verificationStatus: "APPROVED"
    }
  });

  const campaign = await prisma.campaign.upsert({
    where: { slug: "kofi-heart-treatment" },
    update: {},
    create: {
      title: "Heart treatment support for Kofi",
      slug: "kofi-heart-treatment",
      description: "Help Kofi complete urgent cardiac care at Korle Bu Teaching Hospital.",
      story: "Kofi needs community-backed support to finish treatment and return home healthy.",
      category: "MEDICAL",
      status: "ACTIVE",
      goalAmount: 42000,
      raisedAmount: 31850,
      minimumDonation: 1,
      location: "Accra, Greater Accra",
      coverImage: "https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=1200&q=80",
      isFeatured: true,
      isVerified: true,
      beneficiaryId: beneficiary.id
    }
  });

  await prisma.campaignMedia.create({
    data: {
      campaignId: campaign.id,
      type: "RECORDED_VIDEO",
      title: "Doctor briefing and family update",
      description: "A short verified update from the care team.",
      thumbnailUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
      streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      status: "RECORDED",
      durationLabel: "3 min"
    }
  });

  await prisma.systemSetting.upsert({
    where: { key: "platform_fee" },
    update: { value: { percentage: 2.5, fixed: 0.5 } },
    create: {
      key: "platform_fee",
      value: { percentage: 2.5, fixed: 0.5 },
      description: "Donation transaction fee model",
      isPublic: true,
      updatedBy: admin.id
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
