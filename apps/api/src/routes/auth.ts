import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["DONOR", "BENEFICIARY"]).default("DONOR")
});

// Store registered users in memory for demo purposes
export const registeredUsers = new Map<string, {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "DONOR" | "BENEFICIARY";
  password: string;
}>();

// Seed default admin user
(async () => {
  const hash = await bcrypt.hash("Password123!", 12);
  registeredUsers.set("admin@boame.com", {
    email: "admin@boame.com",
    phone: "+233240000000",
    firstName: "Admin",
    lastName: "User",
    role: "DONOR",
    password: hash
  });
})();

authRouter.post("/register", async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(payload.password, 12);
    // Store user data
    registeredUsers.set(payload.email.toLowerCase(), {
      email: payload.email,
      phone: payload.phone,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      password: hashedPassword
    });
    res.status(201).json({ message: "Registration accepted", user: { ...payload, password: undefined } });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = registeredUsers.get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    accessToken: "development-token",
    refreshToken: "development-refresh-token",
    user: {
      id: `user-${registeredUsers.size}`,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: "ACTIVE"
    }
  });
});

authRouter.post("/logout", (_req, res) => res.status(204).send());
authRouter.post("/refresh-token", (_req, res) => res.json({ accessToken: "development-token" }));
authRouter.post("/forgot-password", (_req, res) => res.json({ message: "Password reset instructions queued" }));
authRouter.post("/reset-password", (_req, res) => res.json({ message: "Password reset completed" }));
authRouter.get("/verify-email", (_req, res) => res.json({ message: "Email verified" }));
authRouter.post("/verify-phone", (_req, res) => res.json({ message: "Phone verified" }));
authRouter.post("/mobile/register", (_req, res) => res.status(201).json({ message: "Mobile device registered" }));
authRouter.post("/mobile/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  const user = registeredUsers.get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const tokenPayload = {
    userId: `user-${registeredUsers.size}`,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role
  };
  
  const tokenPayloadString = JSON.stringify(tokenPayload);
  const encodedPayload = Buffer.from(tokenPayloadString).toString('base64');
  const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;
  
  res.json({
    accessToken,
    user: {
      id: tokenPayload.userId,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: "ACTIVE"
    }
  });
});
authRouter.post("/mobile/logout", (_req, res) => res.status(204).send());
authRouter.post("/mobile/refresh", (_req, res) => res.json({ accessToken: "mobile-development-token" }));
