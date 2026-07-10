import Constants from "expo-constants";
import { Platform } from "react-native";

function normalizeApiUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const isLoopbackHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname);

    if (Platform.OS === "android" && isLoopbackHost) {
      parsed.hostname = "10.0.2.2";
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.replace(/\/$/, "");
  }
}

function getDevServerHost(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri?.split(":")[0];
}

function resolveApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl;
  const devServerHost = getDevServerHost();
  const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  const defaultUrl = `http://${devServerHost ?? defaultHost}:5000/api/v1`;
  const selectedUrl = configuredUrl || defaultUrl;

  return normalizeApiUrl(selectedUrl);
}

const apiUrl = resolveApiUrl();
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

function headers() {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function apiWrite<T>(path: string, method: "POST" | "PUT", body: unknown): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: headers(),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text();
    let errorMessage = message || `API request failed with ${response.status}`;
    try {
      const parsed = JSON.parse(message) as { message?: string; error?: string };
      errorMessage = parsed.message ?? parsed.error ?? errorMessage;
    } catch {
      // Keep the raw response text when the API did not return JSON.
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiWrite<T>(path, "POST", body);
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiWrite<T>(path, "PUT", body);
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData
  });

  if (!response.ok) {
    const message = await response.text();
    let errorMessage = message || `API request failed with ${response.status}`;
    try {
      const parsed = JSON.parse(message) as { message?: string; error?: string };
      errorMessage = parsed.message ?? parsed.error ?? errorMessage;
    } catch {
      // Keep raw response text.
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
