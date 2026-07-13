# Design System and Styling Guide

This document describes how to work with UI components, design tokens, styles, and themes across the monorepo using **Tailwind CSS v4** and **NativeWind v5**.

---

## 1. Architecture Overview

To maintain a consistent design language across CRM, Landing, and Mobile applications, the styling architecture is split into two shared workspace packages:

1. **`@repo/design`** ([packages/design](../packages/design)):
   - The single source of truth for the design language.
   - Contains all design tokens: colors (in OKLCH), fonts, spacing, radii, shadows, animations, and keyframes.
   - Exposes these tokens via the shared CSS stylesheet [theme.css](../packages/design/theme.css).
2. **`@repo/ui`** ([packages/ui](../packages/ui)):
   - Holds shared, pure presentation components (e.g., `Button`, `Input`, `Dialog`).
   - Must remain platform-agnostic and free of any business logic or network fetching.

---

## 2. Design Tokens (`@repo/design`)

All variables and configuration reside in [packages/design/theme.css](../packages/design/theme.css).

### Color Space (OKLCH)
We use the modern `oklch()` color format to define standard variables for `:root` (light theme) and `.dark` (dark theme). 
- Primary variable tokens: `--primary`, `--secondary`, `--background`, `--foreground`, `--muted`, `--accent`, `--border`, `--sidebar-background`, etc.

### Theme Mapping
The `@theme` block maps these CSS variables to Tailwind utility classes:
- Colors map to utility classes (e.g., `--color-primary: var(--primary)` -> `bg-primary`, `text-primary`).
- Fonts are mapped to `--font-sans`, `--font-serif`, and `--font-lato`.
- Container padding, center settings, and custom breakpoints are defined here.
- Animations and custom keyframes (such as `accordion-down`, `accordion-up`) are declared directly within this block.

---

## 3. How to Use in Applications

### 3.1. Setting Up Styles
In any application using Tailwind CSS v4, your main CSS entry point (e.g., `src/index.css`) should be structured as follows:

```css
/* Import Tailwind base, components, utilities */
@import "tailwindcss";

/* Import the shared design system tokens and variables */
@import "@repo/design/theme.css";

/* Tell Tailwind to scan your shared UI components package */
@source "../../../packages/ui";
```

### 3.2. Mandatory Rules for Developers

1. **No Hardcoded Values (AP-014 / Eng-Spec 12)**:
   - Never write raw hex/HSL/OKLCH color values or arbitrary sizing values (e.g., `color: #3b82f6` or `padding: 17px`).
   - Always use Tailwind utility classes (e.g., `text-primary`, `p-4`) or reference the CSS variable directly (e.g., `var(--primary)`).
2. **Unified CSS Gradients**:
   - Do not wrap Tailwind variables in `hsl()` or `rgb()` color functions when writing inline CSS styles, since the unified tokens already include the color space identifier (`oklch(...)`). 
   - Write: `background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`.

---

## 4. Mobile Apps (NativeWind v5)

NativeWind v5 brings Tailwind CSS v4's CSS-first approach to React Native (Expo) projects.

### 4.1. Configuration
- **Metro Bundler**: Wrapped inside [metro.config.js](../apps/mobile/metro.config.js) using the `withNativewind` helper.
- **PostCSS**: Uses `@tailwindcss/postcss` inside [postcss.config.js](../apps/mobile/postcss.config.js).
- **CSS Import**: The global CSS file `global.css` imports Tailwind layers and the shared design package:
  ```css
  @import "tailwindcss/theme.css" layer(theme);
  @import "tailwindcss/preflight.css" layer(base);
  @import "tailwindcss/utilities.css";
  @import "nativewind/theme";
  @import "@repo/design/theme.css";
  ```
  This CSS file must be imported in the application entrypoint (e.g. [index.ts](../apps/mobile/index.ts)).

### 4.2. TypeScript Integration
To avoid compilation errors like `TS2882` from TypeScript 6.0 due to unchecked side-effect CSS imports, the [nativewind-env.d.ts](../apps/mobile/nativewind-env.d.ts) declares support for CSS modules:
```typescript
/// <reference types="react-native-css/types" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
```
Use standard `className` strings on core React Native elements (e.g. `<View className="flex-1 bg-white items-center justify-center">`).
