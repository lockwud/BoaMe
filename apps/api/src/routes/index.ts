import { Router } from "express";
import { adminRouter } from "./admin.js";
import { authRouter } from "./auth.js";
import { campaignRouter } from "./campaigns.js";
import { donationRouter } from "./donations.js";
import { payoutRouter } from "./payouts.js";
import { userRouter } from "./users.js";
import { webhookRouter } from "./webhooks.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "boame-api" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/campaigns", campaignRouter);
apiRouter.use("/donations", donationRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/payouts", payoutRouter);
apiRouter.use("/webhooks", webhookRouter);
