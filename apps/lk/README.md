# Personal Cabinet App (`apps/app`)

This application is the unified personal portal for:
- **Students** (courses, homework, schedule, progress, billing)
- **Parents** (child performance, attendance, payment history, communication)
- **Teachers** (class management, grading, student performance metrics)

## Tech Stack
- **Framework**: Next.js (App Router)
- **UI & Styling**: `@repo/design` + Tailwind CSS
- **State & Auth**: Supabase Auth & Shared Monorepo API (`@atena/api` / `@repo/contracts`)

## Development
Run locally:
```bash
pnpm --filter app dev
```
