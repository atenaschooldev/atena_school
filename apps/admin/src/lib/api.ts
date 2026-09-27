// In Vite dev server, route through proxy (empty string) to prevent any browser CORS/IPv6 issues
export const BACKEND_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_BACKEND_URL && !import.meta.env.VITE_BACKEND_URL.includes("4000") ? import.meta.env.VITE_BACKEND_URL : "")
  : (import.meta.env.VITE_BACKEND_URL || "");

const DEFAULT_TIMEOUT_MS = 45000; // 45 seconds (increased from 10s to prevent premature aborts)

export function getAdminToken(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("admin_token");
    if (stored) return stored;
  }
  return import.meta.env.VITE_ADMIN_TOKEN || "";
}

export function getAdminRefreshToken(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_refresh_token") || "";
  }
  return "";
}

export function setAdminToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_token", token);
  }
}

export function setAdminSession(token: string, refreshToken?: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_token", token);
    if (refreshToken) {
      localStorage.setItem("admin_refresh_token", refreshToken);
    }
  }
}

export function clearAdminToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getAdminRefreshToken();
  if (!refreshToken) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        clearAdminToken();
        return null;
      }

      const data = await res.json();
      if (data.access_token) {
        setAdminSession(data.access_token, data.refresh_token || refreshToken);
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { timeoutMs?: number; _isRetry?: boolean }
): Promise<T> {
  let token = getAdminToken();
  const timeoutMs = options?.timeoutMs || DEFAULT_TIMEOUT_MS;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath.includes("/undefined") || normalizedPath.includes("/null")) {
    console.error(`[apiFetch] Aborted request to invalid endpoint with undefined param: ${normalizedPath}`);
    throw new Error(`Endpoint non valido: ${normalizedPath}`);
  }

  const reqHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Fastify throws 500 error if "Content-Type: application/json" is provided without a body.
  // Only set application/json if a body is explicitly present and no Content-Type was specified.
  if (options?.body !== undefined && options?.body !== null) {
    if (!reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }
  }

  let res: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    res = await fetch(`${BACKEND_URL}${normalizedPath}`, {
      ...options,
      signal: controller.signal,
      headers: reqHeaders,
    });
    clearTimeout(timeoutId);
  } catch (netErr: any) {
    console.error(`[apiFetch Network Error] Failed to fetch ${BACKEND_URL || ''}${normalizedPath}:`, netErr);
    if (netErr?.name === 'AbortError') {
      throw new Error(`Timeout di connessione (${timeoutMs / 1000}s) con il server (${BACKEND_URL || 'localhost:4000'}).`);
    }
    throw new Error(`Impossibile connettersi al server (${BACKEND_URL || 'localhost:4000'}). Verifica la connessione di rete.`);
  }

  // Handle 401 (Unauthorized) with automatic silent refresh
  if (res.status === 401 && !path.includes("/auth/")) {
    if (!options?._isRetry) {
      const newToken = await attemptTokenRefresh();
      if (newToken) {
        // Retry the original request with the fresh token
        return apiFetch<T>(path, { ...options, _isRetry: true });
      }
    }

    clearAdminToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
      window.location.href = "/auth/sign-in";
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = `Errore server (${res.status})`;
    try {
      const parsed = JSON.parse(text);
      if (parsed) {
        if (Array.isArray(parsed.message)) {
          errorMessage = parsed.message.join(", ");
        } else if (typeof parsed.detail === "string") {
          errorMessage = parsed.detail;
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
  get: <T>(path: string, options?: RequestInit & { timeoutMs?: number }) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: RequestInit & { timeoutMs?: number }) =>
    apiFetch<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: any, options?: RequestInit & { timeoutMs?: number }) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestInit & { timeoutMs?: number }) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};

// Automatic background session heartbeat: silently refreshes session every 25 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    const refreshToken = getAdminRefreshToken();
    if (refreshToken && !window.location.pathname.startsWith("/auth/")) {
      attemptTokenRefresh().catch(() => {});
    }
  }, 1000 * 60 * 25);
}

