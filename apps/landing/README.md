# 🏛️ Atena School

A premium, localized landing page and CMS for **Atena School**, a language and academic tutoring center in Cittanova, Italy. Built with modern web technologies for performance, SEO, and ease of management.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Supabase CLI** (for local development)
- **Stripe Account** (for payments integration)

### 2. Installation
```bash
git clone <repository-url>
cd atenas-school
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

### 4. Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (IT/EN support)
- **Form Management**: React Hook Form + Zod
- **Editor**: [Tiptap](https://tiptap.dev/) (Rich-text for CMS)

---

## ✨ Key Features

- **Multilingual Support**: Full localization (Italian & English) across the entire site.
- **Dynamic CMS**: Admin dashboard to manage courses, teachers, blog posts, and testimonials.
- **High Performance**: Optimized with Next.js `unstable_cache` and centralized cache revalidation.
- **Secure Admin**: Role-based access control (RBAC) via Supabase Auth and Server Actions.
- **Clean Architecture**: Repository pattern for data fetching ensures strict type safety and maintainability.
- **SEO Ready**: Automated metadata generation, sitemap support, and Canonical URLs.

---

## ⚙️ Build & Performance Optimizations

### 1. Build and Run Commands
*   **Compile Production Build**:
    ```bash
    npx pnpm build
    # or to target only this project:
    npx pnpm --filter landing build
    ```
*   **Start Production Server**:
    ```bash
    npx pnpm --filter landing start
    ```

### 2. Next.js Rendering Strategies
*   **Static & ISR (Incremental Static Regeneration)** (`○`): Core marketing routes (e.g. `/`, `/courses`, `/blog`) are compiled to flat static HTML. Under `Revalidate: 1h`, Next.js checks database updates periodically and regenerates the static page cache in the background without needing a full rebuild.
*   **SSG (Static Site Generation)** (`●`): Dynamic pages like `/blog/[slug]` are pre-rendered at build time using `generateStaticParams()` to guarantee instant SEO load times.
*   **Dynamic / SSR (Server-Side Rendering)** (`ƒ`): Routes requiring user session context or live booking details (e.g. `/book/[type]/[id]`, `/checkout/[type]/[id]`, `/auth/callback`) are compiled to run dynamically on demand.

### 3. Media & Assets Compression
*   **WebP Standard**: Raw PNG files (logo resources and backgrounds) have been converted to WebP to reduce first-load sizes (logo decreased from 110KB to 36KB).
*   **Favicon & Apple Icons**: Compressed using macOS `sips` commands (e.g. `icon.png` is reduced from 110KB to 2.5KB) to prevent network resource bloat warnings.
*   **Font Loading**: Satoshi and Clash Display fonts are bound using `display=swap` to avoid visual layout shifts (CLS) on slow connections.
*   **Server Component Support**: Phosphor Icons use React Context, which can conflict with SSR. They are wrapped in a client-side exporter (`src/components/Icons.tsx`) to allow server-rendered page compilations to build cleanly.

---

## 📂 Project Structure

- `src/app/[locale]`: Multilingual routing and page layouts.
- `src/components`: UI components organized by feature (admin, ui, forms).
- `src/lib/data.ts`: Centralized data fetching and mapping layer.
- `src/lib/constants.ts`: Global constants, including `CACHE_TAGS` and `TABLE_MAP`.
- `src/app/actions.ts`: Secure Server Actions for all database mutations.
- `supabase/`: Database migrations and Edge Functions.

---

## 📖 Documentation

For more detailed technical information, please refer to:
- [**Developer Guide**](./DEVELOPER_GUIDE.md) — Architecture, Caching, and CMS details.
- [**AI Context**](./AI_CONTEXT.md) — Technical rules for AI Agents.

---

## 📄 License
Privately owned by **Atena School**. All rights reserved.
