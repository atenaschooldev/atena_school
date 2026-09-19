const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export function getAdminToken(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("admin_token");
    if (stored) return stored;
  }
  return import.meta.env.VITE_ADMIN_TOKEN || "";
}

export function setAdminToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_token", token);
  }
}

export function clearAdminToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token");
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  let res: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    res = await fetch(`${BACKEND_URL}${normalizedPath}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
    clearTimeout(timeoutId);
  } catch (netErr: any) {
    if (netErr?.name === 'AbortError') {
      throw new Error(`Timeout di connessione con il backend (${BACKEND_URL}). Il server non risponde.`);
    }
    throw new Error(`Impossibile connettersi al backend (${BACKEND_URL}). Assicurati che il server backend sia attivo sulla porta 4000.`);
  }

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/auth/")) {
      clearAdminToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
        window.location.href = "/auth/sign-in";
      }
    }

    const text = await res.text();
    let errorMessage = `Errore server (${res.status})`;
    try {
      const parsed = JSON.parse(text);
      if (parsed) {
        if (Array.isArray(parsed.message)) {
          errorMessage = parsed.message.join(", ");
        } else if (typeof parsed.message === "string") {
          errorMessage = parsed.message;
        } else if (parsed.error && typeof parsed.error === "string") {
          errorMessage = parsed.error;
        }
      }
    } catch {
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
