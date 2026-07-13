import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase admin client using Service Role key.
 * NEVER import this in client components — it bypasses RLS.
 * Use only in Route Handlers, Server Actions, or Middleware.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Returns the list of allowed admin emails from the ADMIN_EMAILS env var.
 * Comma-separated, trimmed, lowercased.
 */
export function getAdminEmailWhitelist(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Checks whether the given user qualifies as an admin:
 *   - authenticated via Google OAuth
 *   - email is in the ADMIN_EMAILS whitelist
 */
export function isAdminUser(user: {
  email?: string | null;
  app_metadata?: { provider?: string };
}): boolean {
  const email = user.email?.toLowerCase() ?? '';
  const provider = user.app_metadata?.provider ?? '';
  const whitelist = getAdminEmailWhitelist();

  return provider === 'google' && whitelist.includes(email);
}
