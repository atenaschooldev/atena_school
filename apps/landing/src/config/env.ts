import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // App
  NEXT_PUBLIC_SITE_URL: z.string().url().transform((val) => {
    if (process.env.NODE_ENV === 'development' && !val.includes('localhost') && !val.includes('127.0.0.1')) {
      return 'http://localhost:3000';
    }
    return val;
  }).default(
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://atenaschool.com'
  ),
  NEXT_PUBLIC_APP_URL: z.string().url().transform((val) => {
    if (process.env.NODE_ENV === 'development' && !val.includes('localhost') && !val.includes('127.0.0.1')) {
      return 'http://localhost:3002';
    }
    return val;
  }).default(
    process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : 'https://app.atenaschool.com'
  ),
  ADMIN_EMAILS: z.string().default('').transform((val) => {
    if (!val) return [];
    return val.split(',').map(e => e.trim());
  }),
  
  // Analytics & Monitoring
  NEXT_PUBLIC_GA_ID: z.string().optional().transform((val) => {
    if (!val || val === "G-XXXXXXXXXX") return undefined;
    return val;
  }),
  NEXT_PUBLIC_GTM_ID: z.string().optional().transform((val) => {
    if (!val || val === "GTM-XXXXXXX") return undefined;
    return val;
  }),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional().transform((val) => {
    if (!val || val === "clarity-id-here" || val === "clXXXXXX") return undefined;
    return val;
  }),
});

// Since this is Next.js, we check if we are in server or client to pick the right variables
const processEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || '',
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
