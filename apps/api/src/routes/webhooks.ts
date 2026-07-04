import { Router } from "express";

export const webhookRouter = Router();

webhookRouter.post("/paystack", (_req, res) => res.json({ received: true }));
webhookRouter.post("/hubtel", (_req, res) => res.json({ received: true }));
webhookRouter.post("/mobile/payment", (_req, res) => res.json({ received: true }));
