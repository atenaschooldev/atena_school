# 🚀 Vercel Deployment Guide (Atena School Landing)

This guide walks you through deploying the **Atena School Landing Page** to Vercel from this Turborepo monorepo.

---

## ⚙️ Vercel Project Configuration

When importing this repository into Vercel, use the following settings in the Vercel Dashboard:

1.  **Framework Preset**: Select `Next.js`.
2.  **Root Directory**: Set this to `apps/landing`. (Vercel will automatically climb up to the monorepo root to run dependency installations).
3.  **Build & Development Settings**:
    *   **Build Command**: `pnpm --filter landing build` (or leave as default, since `vercel.json` overrides this).
    *   **Install Command**: `pnpm install` (automatic monorepo resolver).
    *   **Output Directory**: `.next` (automatic).

---

## 🔑 Environment Variables

You **must** add the following environment variables in the **Settings > Environment Variables** tab of your Vercel project:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anonymous API key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SITE_URL` | The production URL of your deployment | `https://atenaschool.it` (or your Vercel domain) |
| `NEXT_PUBLIC_GA_ID` | *(Optional)* Google Analytics ID | `G-XXXXXXXXXX` |

---

## 📦 Verifying Local Build Before Deploying

To double-check that the code builds completely clean without server issues, run:

```bash
# Clean previous caches
rm -rf apps/landing/.next

# Build landing page
npx pnpm --filter landing build

# Start local production server
npx pnpm --filter landing start
```

Open `http://localhost:3000` to test the production bundle locally!
