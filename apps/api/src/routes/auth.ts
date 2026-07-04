import { Router } from "express";
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

authRouter.post("/register", (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    // Store user data
    registeredUsers.set(payload.email.toLowerCase(), {
      email: payload.email,
      phone: payload.phone,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      password: payload.password
    });
    res.status(201).json({ message: "Registration accepted", user: { ...payload, password: undefined } });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", (req, res) => {
  const { email } = req.body;
  const user = registeredUsers.get(email?.toLowerCase());
  
  if (user) {
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
  } else {
    // Default user for demo
    res.json({
      accessToken: "development-token",
      refreshToken: "development-refresh-token",
      user: {
        id: "demo-user",
        email: email || "demo@boame.com",
        phone: "+233241234567",
        firstName: "Demo",
        lastName: "User",
        role: "DONOR",
        status: "ACTIVE"
      }
    });
  }
});

authRouter.post("/logout", (_req, res) => res.status(204).send());
authRouter.post("/refresh-token", (_req, res) => res.json({ accessToken: "development-token" }));
authRouter.post("/forgot-password", (_req, res) => res.json({ message: "Password reset instructions queued" }));
authRouter.post("/reset-password", (_req, res) => res.json({ message: "Password reset completed" }));
authRouter.get("/verify-email", (_req, res) => res.json({ message: "Email verified" }));
authRouter.post("/verify-phone", (_req, res) => res.json({ message: "Phone verified" }));
authRouter.post("/mobile/register", (_req, res) => res.status(201).json({ message: "Mobile device registered" }));
authRouter.post("/mobile/login", (req, res) => {
  const { email } = req.body;
  
  // Try to find registered user
  const user = email ? registeredUsers.get(email.toLowerCase()) : null;
  
  if (user) {
    // Return actual registered user data
    const tokenPayload = {
      userId: `user-${registeredUsers.size}`,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role
    };
    
    // Create a simple token with user data embedded
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
  } else if (email) {
    // For unregistered emails, create a user object from the email
    const emailName = email.split('@')[0];
    const tokenPayload = {
      userId: "user-" + Date.now(),
      email: email,
      firstName: emailName,
      lastName: "",
      phone: "",
      role: "DONOR"
    };
    
    const tokenPayloadString = JSON.stringify(tokenPayload);
    const encodedPayload = Buffer.from(tokenPayloadString).toString('base64');
    const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;
    
    res.json({
      accessToken,
      user: {
        id: tokenPayload.userId,
        email: email,
        phone: "",
        firstName: emailName,
        lastName: "",
        role: "DONOR",
        status: "ACTIVE"
      }
    });
  } else {
    // No email provided
    res.json({
      accessToken: "mobile-development-token",
      user: {
        id: "demo-user",
        email: "demo@boame.com",
        phone: "",
        firstName: "User",
        lastName: "User",
        role: "DONOR",
        status: "ACTIVE"
      }
    });
  }
});
authRouter.post("/mobile/logout", (_req, res) => res.status(204).send());
authRouter.post("/mobile/refresh", (_req, res) => res.json({ accessToken: "mobile-development-token" }));
