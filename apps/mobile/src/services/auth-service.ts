import type { UserRole } from "@boame/shared-types";
import { apiGet, apiPost, setAccessToken } from "./api-client";

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: string;
  };
}

let currentUser: AuthResponse["user"] | null = null;

// Simple JWT decoder to extract user info from token
function decodeJWT(token: string): { email?: string; role?: string; userId?: string; firstName?: string; lastName?: string; phone?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/mobile/login", { email, password });
  setAccessToken(response.accessToken);
  
  // Extract basic info from JWT token
  const jwtData = decodeJWT(response.accessToken);
  if (!jwtData?.email) {
    console.warn("Login response missing user data:", response);
    throw new Error("Login failed: No user data received");
  }
  
  // Initialize with JWT data
  currentUser = {
    id: jwtData.userId || "unknown",
    email: jwtData.email,
    phone: "",
    firstName: jwtData.email.split('@')[0] || "User",
    lastName: "",
    role: (jwtData.role as UserRole) || "DONOR",
    status: "ACTIVE"
  };
  
  // Fetch full user profile to get actual name and phone
  try {
    const profile = await apiGet<{ firstName: string; lastName: string; phone: string }>("/users/profile");
    if (profile) {
      currentUser = {
        ...currentUser,
        firstName: profile.firstName || currentUser.firstName,
        lastName: profile.lastName || currentUser.lastName,
        phone: profile.phone || currentUser.phone
      };
    }
  } catch (error) {
    console.warn("Could not fetch user profile, using JWT data:", error);
  }
  
  return response;
}

export function getCurrentUser() {
  return currentUser;
}

export function register(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<UserRole, "DONOR" | "BENEFICIARY">;
  location?: string;
}): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/register", payload);
}

export async function logout(): Promise<void> {
  await apiPost("/auth/mobile/logout", {});
  setAccessToken(null);
  currentUser = null;
}
