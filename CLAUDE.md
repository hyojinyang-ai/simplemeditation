# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stillness (formerly SimpleMeditation) is a meditation app built with React, TypeScript, and Vite. It provides guided meditation sessions with ambient sounds, mood tracking, and analytics. The app is designed for mobile-first experiences with a clean, zen-inspired UI.

This is a **Turborepo monorepo** with pnpm workspaces. The codebase is structured into multiple packages for better modularity and code sharing.

## Development Commands

**Root-level commands** (from repository root):

```bash
# Install dependencies
pnpm install

# Start development server (runs web app on http://localhost:8080)
pnpm dev

# Build all packages
pnpm build

# Run linter across all packages
pnpm lint

# Run tests across all packages
pnpm test
```

**Package-specific commands** (from repository root):

```bash
# Run commands for specific packages using --filter
pnpm --filter @repo/web dev
pnpm --filter @repo/web build
pnpm --filter @repo/web test
pnpm --filter @repo/web test:watch
pnpm --filter @repo/web lint

# Build for development mode (preserves console logs)
pnpm --filter @repo/web build:dev

# Preview production build
pnpm --filter @repo/web preview
```

## Monorepo Architecture

### Package Structure

```
apps/
└── web/                          # Main web application (@repo/web)
    ├── src/
    │   ├── components/           # React components
    │   │   └── ui/              # shadcn/ui primitives (DO NOT edit manually)
    │   ├── pages/               # Route pages
    │   ├── lib/                 # Web-specific utilities
    │   ├── hooks/               # Custom React hooks
    │   └── App.tsx
    └── package.json

packages/
├── meditation-core/              # Shared meditation logic (@repo/meditation-core)
│   ├── src/
│   │   ├── types.ts            # Core types (PreMood, PostMood, MoodEntry)
│   │   ├── store.ts            # Zustand store factory
│   │   ├── storage.ts          # Storage adapters
│   │   ├── errors.ts           # Error classes
│   │   └── utilities.ts        # Business logic utilities
│   └── package.json
├── meditation-content/           # Content library (@repo/meditation-content)
│   ├── src/
│   │   └── quotes.ts           # Stoic quotes collection
│   └── package.json
└── typescript-config/            # Shared TypeScript configs
    └── package.json
```

### Package Dependencies

- **@repo/web**: Depends on `@repo/meditation-core` and `@repo/meditation-content`
- **@repo/meditation-core**: Standalone package with Zustand store logic
- **@repo/meditation-content**: Standalone package with meditation content (quotes, etc.)

### Migration Status

The codebase recently migrated from a single-package structure to this monorepo. Core meditation logic has been extracted into `@repo/meditation-core`. Legacy files in `apps/web/src/lib/meditation-store.ts` are marked as DEPRECATED but kept for rollback safety.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 with SWC
- **Monorepo**: Turborepo + pnpm workspaces
- **Styling**: Tailwind CSS with custom zen color palette
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand (via `@repo/meditation-core`)
- **Persistence**: Browser localStorage
- **Routing**: React Router v6
- **Testing**: Vitest with Testing Library
- **Analytics**: Vercel Analytics

## Key Architecture Patterns

### State Management

**Zustand Store** (`packages/meditation-core/src/store.ts`):
- Centralized meditation state management
- Factory pattern: `createMeditationStore(storage)`
- Persists to localStorage with key `zen-mood-entries-v2`
- Each entry includes: id, preMood, postMood, timestamp, note, sessionMinutes, sound, savedQuote

**Mood Types** (defined in `@repo/meditation-core`):
- Pre-meditation: `stressed`, `tired`, `neutral`, `anxious`
- Post-meditation: `calm`, `relieved`, `peaceful`, `grateful`, `refreshed`

### Audio System

**Ambient Engine** (`apps/web/src/lib/ambient-engine.ts`):
- Dual-layer audio: pre-recorded ambient sounds + generative meditation drone
- Uses Web Audio API for real-time synthesis
- Ambient sounds: singing-bowl, gong, ambient-pad, nature, rain, ocean, wind, birds, fireplace
- Meditation drone: harmonic oscillators based on Om frequency (136.1 Hz) and Solfeggio tones
- Audio files located in `apps/web/public/sounds/`

**Important**: Audio playback requires user interaction to start (browser autoplay policies).

### Routing

Four main routes (in `apps/web/src/`):
- `/` - Home page with meditation player
- `/tracker` - Mood tracking interface
- `/analytics` - Charts and statistics
- `/settings` - User preferences

Bottom navigation persists across all pages.

### Styling

**Custom Tailwind Theme** (`apps/web/tailwind.config.js`):
- Zen color palette: `zen-blue`, `zen-lavender`, `zen-green`, `zen-sky`, `zen-rose`
- Each color has `-light` and some have `-deep` variants
- Custom animations: `breathe`, `float`, `fade-in`, `shimmer`
- Fonts: Sora (display), Inter (body)
- HSL-based color system for theme consistency

**Path Alias**: `@/` maps to `apps/web/src/`

### shadcn/ui Components

UI components in `apps/web/src/components/ui/` are auto-generated. To add new components:

```bash
cd apps/web
npx shadcn@latest add [component-name]
```

Do NOT manually edit these files unless fixing bugs. They are meant to be composed, not modified.

### Persistence Model

Data is stored locally in the browser using `localStorage`:
- Storage key: `zen-mood-entries-v2`
- No authentication or cross-device sync
- Clearing browser data removes saved history

### Analytics & Tracking

**Vercel Analytics** tracks user engagement:
- Page views, meditation sessions, mood transformations
- Sound selections, feature usage (quotes saved, notes added)
- Audio errors and performance metrics

**Implementation**:
- Analytics utility: `apps/web/src/lib/analytics.ts`
- Component integration: Tracking embedded in Index, MeditationPlayer, and page components

**Documentation**: See `ANALYTICS.md` for complete event catalog.

## Development Guidelines

### Adding New Meditation Sounds
1. Add audio file to `apps/web/public/sounds/`
2. Update `SOUND_FILES` mapping in `apps/web/src/lib/ambient-engine.ts`
3. Add sound type to `SoundType` in `packages/meditation-core/src/types.ts`
4. Update `SoundPicker` component UI

### Adding New Moods
1. Update `PreMood` or `PostMood` type in `packages/meditation-core/src/types.ts`
2. Add configuration to mood labels/colors in the same file
3. Update `MoodCheck` component in web app

### Working with Shared Packages

When making changes to `@repo/meditation-core` or `@repo/meditation-content`:
1. Make changes in the package source (`packages/*/src/`)
2. The web app will hot-reload automatically (no build step needed for TS-only packages)
3. Export new functionality from the package's `index.ts`
4. Import in web app: `import { ... } from '@repo/meditation-core'`

### Testing

Run tests from repository root:
```bash
# All packages
pnpm test

# Specific package
pnpm --filter @repo/web test
pnpm --filter @repo/meditation-core test
```

Test files use Vitest with jsdom environment. Setup files are in `src/test/setup.ts` within each package.

## Important Patterns

- **Monorepo**: Use Turborepo's `--filter` flag for package-specific commands
- **Mobile-first**: UI designed for mobile with responsive breakpoints
- **Pull-to-refresh**: Custom hook `use-pull-to-refresh` for native-like experience
- **Local storage**: Primary data persistence (key: `zen-mood-entries-v2`)
- **Graceful audio handling**: All audio operations wrapped in try-catch for browser compatibility
- **Theme system**: Uses `next-themes` with `class` attribute strategy (light mode default)

## Known Quirks

- Audio requires user interaction to start (call `audio.play()` after user tap/click)
- Meditation drone uses Web Audio API which may not work in all browsers
- localStorage is cleared when user clears browser data
- Legacy meditation store file (`apps/web/src/lib/meditation-store.ts`) is deprecated but kept for rollback
- Component tagging (lovable-tagger) only runs in development mode
