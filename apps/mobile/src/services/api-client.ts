import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:5000/api/v1";
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
