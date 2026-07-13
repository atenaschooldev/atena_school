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
