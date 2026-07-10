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

  const jwtData = decodeJWT(response.accessToken);
  if (!response.user && !jwtData?.email) {
    console.warn("Login response missing user data:", response);
    throw new Error("Login failed: No user data received");
  }

  currentUser = response.user
    ? {
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone ?? "",
        firstName: response.user.firstName || response.user.email.split("@")[0] || "User",
        lastName: response.user.lastName || "",
        role: response.user.role,
        status: response.user.status ?? "ACTIVE"
      }
    : {
        id: jwtData?.userId || "unknown",
        email: jwtData?.email ?? "unknown",
        phone: jwtData?.phone ?? "",
        firstName: jwtData?.firstName || jwtData?.email?.split("@")[0] || "User",
        lastName: jwtData?.lastName || "",
        role: (jwtData?.role as UserRole) || "DONOR",
        status: "ACTIVE"
      };

  // Fetch full user profile if the token or response did not include enough data
  if (!currentUser.firstName || !currentUser.lastName || !currentUser.phone) {
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
      console.warn("Could not fetch user profile, using available login data:", error);
    }
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
