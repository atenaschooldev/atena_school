import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@14.16.0";

const ALWAYS_ALLOWED_HEADERS = "authorization, x-client-info, apikey, content-type";

/**
 * Returns CORS headers that restrict the origin to SITE_URL env var.
 * Falls back to the request's own origin if SITE_URL is not set,
 * which is safe because the Stripe webhook handler doesn't use CORS at all.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigin = Deno.env.get("SITE_URL") ?? "";
  const requestOrigin = req.headers.get("origin") ?? "";

  // Only echo the request origin if it matches the configured SITE_URL.
  // If SITE_URL is not set we return an empty string — never fall back to
  // requestOrigin, which would be equivalent to Access-Control-Allow-Origin: *.
  const origin =
    allowedOrigin && requestOrigin.startsWith(allowedOrigin)
      ? requestOrigin
      : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": ALWAYS_ALLOWED_HEADERS,
  };
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }
  return null;
}

export function jsonResponse(
  data: unknown,
  status: number,
  req: Request,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

export function createSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key);
}

export function createStripe() {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });
}
