export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type RequestOptions = {
  token?: string | null;
};

function authHeaders(options: RequestOptions = {}) {
  const token = options.token ?? getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

async function readError(response: Response) {
  const text = await response.text();
  if (!text) return `Request failed with ${response.status}`;

  try {
    const payload = JSON.parse(text) as { error?: string; message?: string; details?: unknown };
    return payload.error ?? payload.message ?? text;
  } catch {
    return text;
  }
}

export async function apiGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: authHeaders(options)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeaders(options) ?? {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(authHeaders(options) ?? {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiDownload(path: string, filename: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: authHeaders(options) });
  if (!response.ok) throw new Error(await readError(response));
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("boame_access_token");
}

export function setStoredSession(accessToken: string, email: string) {
  window.localStorage.setItem("boame_access_token", accessToken);
  window.localStorage.setItem("boame_user_email", email);
  window.dispatchEvent(new Event("boame-auth-change"));
}

export function clearStoredSession() {
  window.localStorage.removeItem("boame_access_token");
  window.localStorage.removeItem("boame_user_email");
  window.dispatchEvent(new Event("boame-auth-change"));
}
