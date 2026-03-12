# Technology Stack

**Analysis Date:** 2026-03-12

## Languages

**Primary:**
- TypeScript 5.8 - All source code and configuration
- TSX/JSX - React component definitions throughout `src/`

**Secondary:**
- JavaScript (ES2020) - Configuration files and utilities
- CSS - Custom theme and component styling via Tailwind

## Runtime

**Environment:**
- Node.js 22.14.0 (as specified in current environment)
- Browser-based execution (React web app)

**Package Manager:**
- npm (primary)
- Bun (alternative, supported via `bun.lock` and `bun.lockb`)
- Lockfiles: `bun.lock`, `bun.lockb` present

## Frameworks

**Core:**
- React 18.3.1 - UI component framework
- React DOM 18.3.1 - DOM rendering
- React Router v6.30.1 - Application routing (`src/App.tsx` configures 4 main routes: `/`, `/tracker`, `/analytics`, `/settings`)

**Build/Dev:**
- Vite 5.4.19 - Build tool and dev server (configured in `vite.config.ts`)
- @vitejs/plugin-react-swc 3.11.0 - SWC compiler for fast transpilation
- SWC - Rust-based transpiler integrated via Vite plugin

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework with custom zen color palette
- PostCSS 8.5.6 - CSS processing (configured in `postcss.config.js`)
- Autoprefixer 10.4.21 - Vendor prefix handling
- tailwindcss-animate 1.0.7 - Animation utilities

**UI Components:**
- shadcn/ui (generated primitives) - Radix UI-based component library
- Radix UI packages (full suite) - Unstyled, accessible UI primitives:
  - @radix-ui/react-accordion 1.2.11
  - @radix-ui/react-alert-dialog 1.1.15
  - @radix-ui/react-dialog 1.1.14
  - @radix-ui/react-select 2.2.5
  - @radix-ui/react-tabs 1.1.12
  - @radix-ui/react-tooltip 1.2.7
  - And 18 additional Radix components

**State Management:**
- Zustand 5.0.11 - Lightweight state management (`src/lib/meditation-store.ts` manages meditation entries, mood tracking, and session state with localStorage persistence)

**Data & API:**
- TanStack Query (React Query) 5.83.0 - Server state management and async data fetching (`src/App.tsx` configures QueryClient)
- @supabase/supabase-js 2.98.0 - Supabase client for database/auth (`src/integrations/supabase/client.ts`)

**Forms & Validation:**
- React Hook Form 7.61.1 - Form state and validation management
- @hookform/resolvers 3.10.0 - Validation schema resolvers
- Zod 3.25.76 - Schema validation library

**Routing & Navigation:**
- React Router DOM 6.30.1 - Client-side routing with 4 main pages

**UI & Interaction:**
- Framer Motion 12.35.1 - Animation library
- Sonner 1.7.4 - Toast notifications (`src/components/ui/sonner`)
- Embla Carousel React 8.6.0 - Carousel/slider component
- cmdk 1.1.1 - Command palette component
- input-otp 1.4.2 - OTP input handling
- Lucide React 0.462.0 - Icon library (used extensively for mood and sound icons)
- react-day-picker 8.10.1 - Date picker component
- vaul 0.9.9 - Drawer component primitive
- react-resizable-panels 2.1.9 - Resizable panel layout

**Charts & Data Visualization:**
- Recharts 2.15.4 - React chart library (used in `src/pages/AnalyticsPage.tsx`)

**Theme Management:**
- next-themes 0.3.0 - Theme switching and persistence (supports light/dark modes with `class` strategy)

**Utilities:**
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 2.6.0 - Merges Tailwind CSS classes intelligently
- date-fns 3.6.0 - Date utility library
- class-variance-authority 0.7.1 - Type-safe CSS variant management

**Analytics:**
- @vercel/analytics 2.0.0 - Vercel Analytics for user tracking and web vitals (`src/lib/analytics.ts` provides custom event tracking)

**Lovable Integration:**
- lovable-tagger 1.1.13 - Component tagging for Lovable editor (development mode only, `vite.config.ts` filters in development)

## Testing

**Framework:**
- Vitest 3.2.4 - Unit test runner (configured in `vitest.config.ts` with jsdom environment)
- @testing-library/react 16.0.0 - React testing utilities
- @testing-library/jest-dom 6.6.0 - Jest DOM matchers
- jsdom 20.0.3 - DOM implementation for Node.js

**Test Configuration:**
- `vitest.config.ts` - Test environment set to `jsdom` with setup file at `src/test/setup.ts`
- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Example test: `src/test/example.test.ts`

## Linting & Code Quality

**Linting:**
- ESLint 9.32.0 - JavaScript/TypeScript linter (config: `eslint.config.js`)
- @eslint/js 9.32.0 - ESLint recommended rules
- typescript-eslint 8.38.0 - TypeScript support for ESLint
- eslint-plugin-react-hooks 5.2.0 - React hooks best practices
- eslint-plugin-react-refresh 0.4.20 - React Fast Refresh rules

**Configuration Files:**
- `eslint.config.js` - ESLint configuration (ES2020 target, React hooks enforced)
- `tsconfig.json` - TypeScript compiler options (path alias `@/*` → `src/*`)
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node/build tooling TypeScript config
- `components.json` - shadcn/ui CLI configuration
- `.gitignore` - Git exclusion patterns

## Configuration

**Environment:**
- Vite env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (in `.env`)
- Dev server runs on `localhost:8080` (configured in `vite.config.ts`)
- HMR overlay disabled in development

**Build:**
- Production: `npm run build` → Vite optimized build to `dist/`
- Development: `npm run build:dev` → Preserves console logs and debug info
- Preview: `npm run preview` → Local preview of production build

**Development:**
- `npm run dev` → Vite dev server with hot reload
- `npm run lint` → ESLint check
- `npm run test` → Vitest run (single execution)
- `npm run test:watch` → Vitest watch mode

## Key Dependencies Summary

**Critical Infrastructure:**
- React 18 + TypeScript for type-safe component development
- Vite 5 for fast build/dev experience
- Zustand + React Query for state and server state management
- Tailwind CSS for styling with custom zen color system
- Supabase for optional backend (database/auth configured but primary persistence is localStorage)

**Web Audio:**
- Native Web Audio API integration in `src/lib/ambient-engine.ts` (not a package dependency, uses browser APIs)
- Creates generative meditation drones with Solfeggio frequencies and Om (136.1 Hz)
- Audio files stored in `public/sounds/` (9 MP3 files: singing-bowl, gong, ambient-pad, nature, rain, ocean, wind, birds, fireplace)

## Platform Requirements

**Development:**
- Node.js 22.14.0 (or compatible)
- npm or Bun package manager
- Modern browser with:
  - ES2020 support
  - Web Audio API (AudioContext, OscillatorNode, GainNode)
  - localStorage
  - Fetch API
  - Dynamic imports

**Production:**
- Vercel (Analytics integration, primary deployment target)
- CDN for static assets (audio files in `public/sounds/`)
- Modern browsers (Chrome, Firefox, Safari, Edge with Web Audio support)

---

*Stack analysis: 2026-03-12*
