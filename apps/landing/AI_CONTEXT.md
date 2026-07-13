# 🤖 AI Agent Context — Atena School

This document provides essential context and rules for AI agents contributing to this project. Follow these rules to ensure architectural consistency and type safety.

---

## 🧭 Architectural Compass

1.  **Data Fetching**: NEVER call `supabase` directly in UI components. ALWAYS use the repository functions in `src/lib/data.ts`.
2.  **Mapping Layer**: When adding new database fields, update the mappers in `src/lib/data.ts` to provide default values and resolve `null` concerns.
3.  **Caching**:
    *   Functions in `data.ts` MUST use `unstable_cache`.
    *   ALWAYS use centralized tags from `src/lib/constants.ts` (`CACHE_TAGS`).
    *   After any mutation, ALWAYS call `revalidateTag` in the Server Action.
4.  **Admin UI**: Maintain consistency. Use the `AdminPageHeader` component for all administrative listing pages.

---

## 🛠 Tech Stack Quirks

- **Versioning**: Next.js 14 (App Router).
- **Internationalization**: Uses `next-intl`. Translations are in `/messages/*.json`.
- **Database Types**: Generated types are in `src/types/database.types.ts`.
- **Styling**: Tailwind CSS. Primary brand color is `primary` (teal-like).

---

## 📋 Common Tasks Pattern

### Adding a new Database-driven section:
1.  Define the table name and cache tag in `src/lib/constants.ts`.
2.  Add a fetcher function in `src/lib/data.ts` with `unstable_cache`.
3.  Create a Server Action in `src/app/actions.ts` for management (CRUD), including `revalidateTag`.
4.  Implement the UI component using the data from the fetcher.

### Fixing "Null" or "Never" Type Errors:
- Do NOT use `!` or `@ts-ignore` for database results.
- Instead, update the mapper in `data.ts` to provide a fallback value (e.g., `|| ''` or `|| 0`).
- Cast complex Supabase queries to `any` internally within the mapper if the generated types are too restrictive, but return a clean, strictly typed object.

---

## 🚫 Anti-Patterns to Avoid
- **Hardcoding Cache Tags**: Always use the `CACHE_TAGS` constant.
- **Client-Side DB Calls**: Mutations should be Server Actions. Fetching should be Server Components.
- **Duplicate Logic**: If a UI pattern (like a table or header) is reused in Admin, create a shared component.
- **Inline Styles**: Always use Tailwind classes or the centralized `index.css` for complex animations.

---

## 🔗 Critical References
- [README.md](./README.md)
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
