# Architecture Patterns: React + React Native Monorepo

**Domain:** Meditation app with shared business logic across web and native mobile
**Researched:** 2026-03-12
**Confidence:** MEDIUM (based on established patterns, pending tool-specific verification)

## Recommended Architecture

### High-Level Structure

```
SimpleMeditation/                    (monorepo root)
├── apps/
│   ├── web/                        (React web app - existing)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── mobile/                      (React Native with Expo)
│   │   ├── src/
│   │   ├── app/                    (Expo Router file-based routing)
│   │   ├── assets/
│   │   ├── app.json
│   │   └── package.json
│   └── (future: admin, landing, etc.)
│
├── packages/
│   ├── meditation-core/            (Shared business logic)
│   │   ├── src/
│   │   │   ├── store/              (Zustand store logic)
│   │   │   ├── types/              (TypeScript types)
│   │   │   ├── utils/              (Pure functions)
│   │   │   └── constants/          (Mood configs, quotes)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── meditation-audio/           (Platform-agnostic audio abstractions)
│   │   ├── src/
│   │   │   ├── types.ts            (Audio interface contracts)
│   │   │   └── utils.ts            (Shared audio logic)
│   │   └── package.json
│   │
│   ├── meditation-audio-web/       (Web Audio API implementation)
│   │   ├── src/
│   │   │   ├── ambient-engine.ts   (Existing implementation)
│   │   │   └── meditation-drone.ts
│   │   └── package.json
│   │
│   ├── meditation-audio-native/    (Expo Audio implementation)
│   │   ├── src/
│   │   │   ├── ambient-engine.ts   (Native implementation)
│   │   │   └── meditation-drone.ts (Pre-generated audio or simpler synth)
│   │   └── package.json
│   │
│   ├── meditation-storage/         (Platform-agnostic storage interface)
│   │   ├── src/
│   │   │   └── types.ts            (Storage interface)
│   │   └── package.json
│   │
│   ├── meditation-storage-web/     (localStorage implementation)
│   │   └── src/storage.ts
│   │
│   ├── meditation-storage-native/  (AsyncStorage/MMKV implementation)
│   │   └── src/storage.ts
│   │
│   ├── meditation-analytics/       (Platform-agnostic analytics)
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   └── events.ts
│   │   └── package.json
│   │
│   └── meditation-ui/              (Shared UI primitives - optional)
│       ├── src/
│       │   ├── colors.ts           (Zen color palette)
│       │   ├── typography.ts
│       │   └── animations.ts
│       └── package.json
│
├── package.json                     (Root workspace config)
├── turbo.json                       (Turborepo pipeline config)
└── tsconfig.base.json              (Shared TypeScript config)
```

### Component Boundaries

| Component | Responsibility | Depends On | Used By | Platform |
|-----------|---------------|------------|---------|----------|
| **meditation-core** | Business logic: mood tracking, session state, entry management | None (platform-agnostic) | web app, mobile app | Universal |
| **meditation-audio** | Audio interface contracts and shared logic | None | meditation-audio-web, meditation-audio-native | Universal |
| **meditation-audio-web** | Web Audio API implementation | meditation-audio | web app | Web only |
| **meditation-audio-native** | Expo Audio implementation | meditation-audio, expo-av | mobile app | Native only |
| **meditation-storage** | Storage interface (get, set, clear) | None | storage implementations | Universal |
| **meditation-storage-web** | localStorage adapter | meditation-storage | web app | Web only |
| **meditation-storage-native** | AsyncStorage/MMKV adapter | meditation-storage, @react-native-async-storage/async-storage | mobile app | Native only |
| **meditation-analytics** | Event definitions and tracking logic | None | web app, mobile app | Universal |
| **meditation-ui** | Design tokens (colors, fonts, spacing) | None | web app, mobile app | Universal |
| **apps/web** | React web application | All meditation-* packages (web variants) | End users | Web |
| **apps/mobile** | React Native mobile app | All meditation-* packages (native variants) | End users | iOS/Android |

### Data Flow

**Session Lifecycle (Cross-Platform):**

```
1. User selects pre-mood
   └─> meditation-core: updatePreMood(mood)
       └─> meditation-storage-*: persist to storage
           └─> meditation-analytics: trackPreMood(mood)

2. User selects duration & sound
   └─> meditation-core: updateSessionConfig(minutes, sound)
       └─> State updated in memory (not persisted until completion)

3. Session starts
   └─> meditation-audio-*: startSession(sound, duration)
       ├─> Platform-specific audio engine initializes
       ├─> Ambient sound loops (from local files)
       └─> Meditation drone synthesizes (Web) or plays pre-rendered (Native)
   └─> meditation-core: setMeditating(true)
       └─> meditation-analytics: trackSessionStart({sound, duration})

4. Session completes or is abandoned
   └─> meditation-audio-*: stopSession()
       └─> Fade out audio, cleanup resources
   └─> meditation-core: setMeditating(false)
       └─> meditation-analytics: trackSessionComplete() or trackSessionAbandoned()

5. User selects post-mood
   └─> meditation-core: completeEntry(postMood, note?)
       ├─> Create MeditationEntry with all data
       ├─> meditation-storage-*: addEntry(entry)
       └─> meditation-analytics: trackPostMood(postMood, preMood)

6. User views analytics
   └─> meditation-core: getEntries(), calculateStats()
       └─> meditation-storage-*: loadEntries()
           └─> Pure calculations in meditation-core
```

**Package Import Flow:**

```
apps/web
  ├─> @simplemeditation/meditation-core (business logic)
  ├─> @simplemeditation/meditation-audio-web (Web Audio API)
  ├─> @simplemeditation/meditation-storage-web (localStorage)
  ├─> @simplemeditation/meditation-analytics (events)
  └─> @simplemeditation/meditation-ui (design tokens)

apps/mobile
  ├─> @simplemeditation/meditation-core (same business logic)
  ├─> @simplemeditation/meditation-audio-native (Expo Audio)
  ├─> @simplemeditation/meditation-storage-native (AsyncStorage)
  ├─> @simplemeditation/meditation-analytics (same events)
  └─> @simplemeditation/meditation-ui (same design tokens)
```

**Dependency Direction Rule:** Packages never depend on apps. Apps depend on packages. Packages can depend on other packages with clear boundaries (core has no dependencies, implementations depend on interfaces).

## Patterns to Follow

### Pattern 1: Interface-Based Platform Abstraction

**What:** Define platform-agnostic interfaces, implement per-platform

**When:** Any functionality with platform-specific APIs (audio, storage, notifications, haptics)

**Example:**

```typescript
// packages/meditation-audio/src/types.ts
export interface IAudioEngine {
  start(sound: SoundType, duration: number): Promise<void>;
  stop(): Promise<void>;
  setVolume(level: number): void;
  fadeOut(durationMs: number): Promise<void>;
}

// packages/meditation-audio-web/src/ambient-engine.ts
import { IAudioEngine, SoundType } from '@simplemeditation/meditation-audio';

export class WebAudioEngine implements IAudioEngine {
  private audioContext?: AudioContext;
  private drone?: MeditationDrone;

  async start(sound: SoundType, duration: number): Promise<void> {
    this.audioContext = new AudioContext();
    // Web Audio API implementation
  }

  async stop(): Promise<void> { /* ... */ }
  setVolume(level: number): void { /* ... */ }
  async fadeOut(durationMs: number): Promise<void> { /* ... */ }
}

// packages/meditation-audio-native/src/ambient-engine.ts
import { IAudioEngine, SoundType } from '@simplemeditation/meditation-audio';
import { Audio } from 'expo-av';

export class NativeAudioEngine implements IAudioEngine {
  private sound?: Audio.Sound;

  async start(sound: SoundType, duration: number): Promise<void> {
    const { sound: audioInstance } = await Audio.Sound.createAsync(
      require(`../../assets/sounds/${sound}.mp3`),
      { shouldPlay: true, isLooping: true }
    );
    this.sound = audioInstance;
  }

  async stop(): Promise<void> { /* ... */ }
  setVolume(level: number): void { /* ... */ }
  async fadeOut(durationMs: number): Promise<void> { /* ... */ }
}
```

**Benefits:**
- Apps import correct implementation based on platform
- Business logic in meditation-core remains platform-agnostic
- Easy to test with mock implementations
- Clear contracts reduce coupling

### Pattern 2: Conditional Package Resolution

**What:** Use package.json "exports" field to provide platform-specific entry points

**When:** Single package needs platform variants (alternative to separate packages)

**Example:**

```json
// packages/meditation-audio/package.json
{
  "name": "@simplemeditation/meditation-audio",
  "exports": {
    ".": {
      "react-native": "./src/native/index.ts",
      "default": "./src/web/index.ts"
    }
  }
}
```

**Benefits:**
- Single package import: `import { AudioEngine } from '@simplemeditation/meditation-audio'`
- Bundler automatically resolves correct platform
- Reduces number of packages to manage

**Tradeoff:** More complex package structure vs. simpler separate packages. Recommend separate packages for SimpleMeditation (clearer boundaries).

### Pattern 3: Zustand Store with Platform-Agnostic Persistence

**What:** Keep Zustand store logic in meditation-core, inject storage adapter

**When:** State management needs to work across platforms with different storage backends

**Example:**

```typescript
// packages/meditation-core/src/store/meditation-store.ts
import { create } from 'zustand';
import { IStorage } from '@simplemeditation/meditation-storage';

export const createMeditationStore = (storage: IStorage) => {
  return create<MeditationState>((set, get) => ({
    entries: [],

    async loadEntries() {
      const data = await storage.getItem('zen-mood-entries-v2');
      const entries = data ? JSON.parse(data) : [];
      set({ entries });
    },

    async addEntry(entry: MeditationEntry) {
      const newEntries = [...get().entries, entry];
      set({ entries: newEntries });
      await storage.setItem('zen-mood-entries-v2', JSON.stringify(newEntries));
    },

    // ... other actions
  }));
};

// packages/meditation-storage/src/types.ts
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// apps/web/src/App.tsx
import { createMeditationStore } from '@simplemeditation/meditation-core';
import { webStorage } from '@simplemeditation/meditation-storage-web';

const useMeditationStore = createMeditationStore(webStorage);

// apps/mobile/src/App.tsx
import { createMeditationStore } from '@simplemeditation/meditation-core';
import { nativeStorage } from '@simplemeditation/meditation-storage-native';

const useMeditationStore = createMeditationStore(nativeStorage);
```

**Benefits:**
- Store logic written once, works everywhere
- Easy to swap storage implementations (testing, migrations)
- Clear separation of concerns

### Pattern 4: File Extension Platform Targeting

**What:** Use `.web.tsx` and `.native.tsx` extensions for platform-specific components

**When:** UI component needs different implementations per platform (rare with good abstractions)

**Example:**

```
apps/mobile/src/components/
├── MeditationPlayer.tsx         (Shared logic)
├── MeditationPlayer.native.tsx  (React Native specific UI)
└── MeditationPlayer.web.tsx     (React DOM specific UI)
```

Metro (React Native) and Vite/Webpack (web) automatically resolve correct file.

**When to use:**
- Visual components that can't share markup (Canvas vs. SVG)
- Platform-specific navigation patterns
- Native modules without web equivalents

**When NOT to use:**
- Business logic (belongs in meditation-core)
- Anything that can be abstracted with interfaces

### Pattern 5: Shared Design Tokens

**What:** Export platform-agnostic design constants, consume in platform-specific styling

**When:** Maintaining consistent brand across web (Tailwind) and native (StyleSheet)

**Example:**

```typescript
// packages/meditation-ui/src/colors.ts
export const colors = {
  zenBlue: '#3B82F6',
  zenBlueDark: '#1E40AF',
  zenBlueLight: '#DBEAFE',
  zenLavender: '#A78BFA',
  zenLavenderLight: '#EDE9FE',
  // ... rest of palette
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// apps/web/tailwind.config.js
import { colors, spacing } from '@simplemeditation/meditation-ui';

export default {
  theme: {
    extend: {
      colors: {
        'zen-blue': colors.zenBlue,
        'zen-blue-dark': colors.zenBlueDark,
        // ...
      },
      spacing: spacing,
    },
  },
};

// apps/mobile/src/theme/styles.ts
import { colors, spacing } from '@simplemeditation/meditation-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.zenBlue,
    padding: spacing.md,
  },
  // ...
});
```

**Benefits:**
- Single source of truth for design
- Easy to update brand colors globally
- Type-safe constants

### Pattern 6: Analytics Event Definitions in Core

**What:** Define event types and schemas in meditation-analytics, implement platform-specific tracking

**When:** Want consistent analytics across platforms with different providers

**Example:**

```typescript
// packages/meditation-analytics/src/events.ts
export const events = {
  PAGE_VIEW: 'page_view',
  SESSION_START: 'session_start',
  SESSION_COMPLETE: 'session_complete',
  MOOD_SELECTED: 'mood_selected',
} as const;

export interface SessionStartEvent {
  sound: SoundType;
  duration_minutes: number;
  timestamp: number;
}

export interface IAnalytics {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
}

// apps/web/src/lib/analytics.ts
import { track as vercelTrack } from '@vercel/analytics';
import { IAnalytics, events, SessionStartEvent } from '@simplemeditation/meditation-analytics';

export const analytics: IAnalytics = {
  track(event, properties) {
    vercelTrack(event, properties);
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }
  },
  identify(userId, traits) {
    // Vercel Analytics doesn't have identify, no-op
  },
};

// apps/mobile/src/lib/analytics.ts
import * as Analytics from 'expo-firebase-analytics';
import { IAnalytics } from '@simplemeditation/meditation-analytics';

export const analytics: IAnalytics = {
  async track(event, properties) {
    await Analytics.logEvent(event, properties);
  },
  async identify(userId, traits) {
    await Analytics.setUserId(userId);
    if (traits) {
      await Analytics.setUserProperties(traits);
    }
  },
};
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Platform Checks in Shared Code

**What goes wrong:** Code in meditation-core checks `Platform.OS` or `typeof window`

**Why bad:** Breaks platform-agnostic contract, creates hidden dependencies, hard to test

**Instead:** Use dependency injection and interfaces

```typescript
// ❌ BAD - Platform check in core
export function saveEntry(entry: MeditationEntry) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('entries', JSON.stringify(entry));
  } else {
    AsyncStorage.setItem('entries', JSON.stringify(entry));
  }
}

// ✅ GOOD - Injected storage interface
export function createStore(storage: IStorage) {
  return {
    async saveEntry(entry: MeditationEntry) {
      await storage.setItem('entries', JSON.stringify(entry));
    },
  };
}
```

### Anti-Pattern 2: Duplicate Business Logic

**What goes wrong:** Copy-pasting mood calculation, streak logic, session timer to both apps

**Why bad:** Bugs fixed in one place don't fix the other, divergence over time, wasted effort

**Instead:** Extract to meditation-core package

```typescript
// ❌ BAD - Logic duplicated in apps/web and apps/mobile
// apps/web/src/utils/stats.ts
export function calculateStreak(entries: MeditationEntry[]): number {
  // 50 lines of streak logic
}

// apps/mobile/src/utils/stats.ts
export function calculateStreak(entries: MeditationEntry[]): number {
  // 50 lines of THE SAME streak logic (or worse, slightly different)
}

// ✅ GOOD - Single source of truth
// packages/meditation-core/src/utils/stats.ts
export function calculateStreak(entries: MeditationEntry[]): number {
  // 50 lines of streak logic, used by both apps
}
```

### Anti-Pattern 3: Tight Coupling to UI Framework

**What goes wrong:** meditation-core imports React hooks or React Native components

**Why bad:** Can't reuse logic in non-React contexts (scripts, backend, CLI), bloats bundle

**Instead:** Keep core pure, create thin hook wrappers in apps

```typescript
// ❌ BAD - React dependency in core
// packages/meditation-core/src/store.ts
import { create } from 'zustand';

export const useMeditationStore = create<State>(...);  // Now core requires React

// ✅ GOOD - Core is pure, apps create hooks
// packages/meditation-core/src/store.ts
export class MeditationStore {
  // Plain class, no React
}

// apps/web/src/hooks/use-meditation-store.ts
import { MeditationStore } from '@simplemeditation/meditation-core';
import { create } from 'zustand';

export const useMeditationStore = create(/* wrap MeditationStore */);
```

**Exception:** For SimpleMeditation, Zustand in meditation-core is acceptable since both apps use React/Zustand. But avoid React-specific hooks in core.

### Anti-Pattern 4: Importing from Apps in Packages

**What goes wrong:** `packages/meditation-core` imports from `apps/web`

**Why bad:** Circular dependency, breaks build, violates dependency direction

**Instead:** Dependencies flow apps → packages, never packages → apps

```typescript
// ❌ BAD - Package importing from app
// packages/meditation-core/src/utils.ts
import { webAudioEngine } from '../../../apps/web/src/lib/audio';  // WRONG

// ✅ GOOD - App imports package, injects dependencies
// apps/web/src/App.tsx
import { createStore } from '@simplemeditation/meditation-core';
import { webAudioEngine } from './lib/audio';

const store = createStore(webAudioEngine);
```

### Anti-Pattern 5: Monolithic Shared Package

**What goes wrong:** Single `packages/shared` with everything (UI, logic, types, utils, audio, storage)

**Why bad:** Changes to unrelated features trigger rebuilds of all apps, unclear boundaries, import bloat

**Instead:** Create focused packages with single responsibilities

```typescript
// ❌ BAD - Monolithic package
packages/shared/
  ├── audio.ts
  ├── storage.ts
  ├── store.ts
  ├── analytics.ts
  ├── colors.ts
  └── utils.ts
// Importing colors triggers rebuild when audio changes

// ✅ GOOD - Focused packages
packages/
  ├── meditation-core/       (only business logic)
  ├── meditation-audio/      (only audio)
  ├── meditation-storage/    (only storage)
  ├── meditation-analytics/  (only analytics)
  └── meditation-ui/         (only design tokens)
```

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Build times** | <30s with Turborepo caching | <2min with remote cache enabled | Consider breaking meditation-ui into smaller packages, use Turbo remote cache |
| **Bundle size** | Tree-shaking handles it | Audit package imports, ensure platform-specific code not bundled | Code-split meditation-core by feature (mood, analytics, quotes) |
| **Storage** | Local storage works fine | Same (client-side only) | Add Supabase sync for cross-device, keep local-first |
| **Audio assets** | 6 sounds (~2MB total) OK | Consider dynamic imports per sound | CDN for audio files, lazy load on selection |
| **Type checking** | <5s per package | Use TypeScript project references | Use `skipLibCheck` carefully, isolate type generation |
| **Monorepo tasks** | Run all tasks in parallel | Selective task execution with filters | Distributed task execution (Turborepo remote cache + CI matrix) |

### Build Order Dependencies

**Phase 1: Foundation packages (no dependencies)**
- meditation-ui (design tokens)
- meditation-storage (interface only)
- meditation-audio (interface only)

**Phase 2: Core logic (depends on Phase 1)**
- meditation-core (depends on meditation-storage types, meditation-ui)
- meditation-analytics (standalone, but apps will use with core)

**Phase 3: Platform implementations (depends on Phase 1 interfaces)**
- meditation-storage-web
- meditation-storage-native
- meditation-audio-web
- meditation-audio-native

**Phase 4: Applications (depends on all packages)**
- apps/web (depends on meditation-core, meditation-audio-web, meditation-storage-web, meditation-analytics, meditation-ui)
- apps/mobile (depends on meditation-core, meditation-audio-native, meditation-storage-native, meditation-analytics, meditation-ui)

**Turborepo will handle this automatically via `dependsOn` in turbo.json.**

## Tooling Recommendations

### Monorepo Manager: Turborepo (Recommended for SimpleMeditation)

**Why Turborepo over Nx:**
- Simpler configuration (single `turbo.json` vs. Nx's multiple config files)
- Excellent incremental builds and caching out-of-the-box
- Better for single developer (less overhead)
- Built-in remote caching (Vercel integration)
- Works seamlessly with npm/pnpm/yarn workspaces

**Nx Alternative:**
- More features (code generators, dependency graphs, affected commands)
- Better for larger teams with many apps/packages
- More complex setup and learning curve

**For SimpleMeditation:** Turborepo is sufficient and easier to maintain.

### Package Manager: pnpm (Recommended)

**Why pnpm over npm/yarn:**
- Faster installs (content-addressable storage)
- Disk space efficient (single copy of each package version)
- Strict by default (prevents phantom dependencies)
- Built-in workspace support

**Alternative:** npm workspaces (simpler, but slower and less efficient)

### TypeScript: Project References

**Why:**
- Faster incremental builds
- Clear package boundaries
- Better IDE performance

**Setup:**

```json
// tsconfig.base.json (root)
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    // ... other options
  }
}

// packages/meditation-core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "references": [
    { "path": "../meditation-storage" },
    { "path": "../meditation-ui" }
  ]
}
```

## Migration Strategy

### Step 1: Initialize Monorepo (Don't move code yet)

```bash
# In SimpleMeditation root
npm init -w apps/web -w apps/mobile
npm install -D turbo

# Create turbo.json, adjust package.json workspaces
# Keep existing code in place temporarily
```

**Why first:** Establish structure before moving code prevents broken intermediate states.

### Step 2: Create Empty Packages

```bash
# Create package directories and package.json files
mkdir -p packages/meditation-core packages/meditation-ui packages/meditation-storage
# ... etc

# Add to root package.json workspaces
```

**Why second:** Packages exist but are empty, apps still work with local code.

### Step 3: Extract meditation-ui (Lowest Risk)

Move `src/lib/utils.ts` color constants, Tailwind theme to `packages/meditation-ui`.

**Why third:** Design tokens are low-risk, no complex dependencies, validates monorepo setup.

### Step 4: Extract meditation-storage Interface + Implementations

Create `IStorage` interface, move localStorage wrapper to meditation-storage-web.

**Why fourth:** Small, focused package, easy to test extraction process.

### Step 5: Extract meditation-core (Critical Path)

Move Zustand store, mood configs, quote data, utility functions to meditation-core.

**Why fifth:** Core business logic, depends on previous packages, highest value extraction.

### Step 6: Extract meditation-audio (Complex)

Define `IAudioEngine`, create web and native implementations.

**Why sixth:** Most complex due to platform differences, benefits from lessons learned in previous steps.

### Step 7: Create apps/mobile

Set up Expo app, install meditation-* packages, build UI consuming shared logic.

**Why last:** All packages ready, can focus on mobile-specific UI without worrying about logic.

## Sources

**Confidence:** MEDIUM

**Note:** This architecture is based on established React Native monorepo patterns (Turborepo documentation, Expo monorepo guides, React Native community best practices). Specific tool versions and API details should be verified with official documentation:

- Turborepo: https://turbo.build/repo/docs
- Expo monorepo: https://docs.expo.dev/guides/monorepos/
- React Native Web: https://necolas.github.io/react-native-web/
- pnpm workspaces: https://pnpm.io/workspaces

Web search tools were unavailable during research, so recommendations reflect January 2025 knowledge. Verify current best practices for 2026 tools and APIs during implementation.
