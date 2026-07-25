import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/config/env'

export function createClient() {
  let cookieStore: any;
  
  try {
    cookieStore = cookies();
  } catch (e) {
    // cookies() throws when called during static generation
  }

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          try {
            const store = await cookieStore;
            return store?.getAll() ?? []
          } catch {
            return []
          }
        },
        async setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            const store = await cookieStore;
            if (store) {
              cookiesToSet.forEach(({ name, value, options }) =>
                store.set(name, value, options)
              )
            }
          } catch {
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
