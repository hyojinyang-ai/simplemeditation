# Technology Stack - React Native Mobile Conversion

**Project:** SimpleMeditation Mobile Apps
**Researched:** 2026-03-12
**Scope:** Adding React Native mobile (iOS + Android) to existing React web app
**Overall Confidence:** MEDIUM (based on training data through January 2025, unable to verify current versions)

## Research Limitations

**IMPORTANT:** This research is based on training data current through January 2025. I was unable to access:
- Context7 for library version verification
- Official documentation websites (Expo, Turborepo, React Native)
- Web search for 2026 current best practices

All version recommendations are based on late 2024/early 2025 standards and should be verified against current documentation before implementation.

## Recommended Stack

### Monorepo Infrastructure

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Turborepo** | ^2.0.0+ | Monorepo build orchestration | Industry standard for JS monorepos in 2025. Superior caching, task pipelines, remote caching support. Better DX than Nx for React/RN hybrid. Vercel-maintained (matches existing deployment). |
| **pnpm** | ^9.0.0+ | Package manager | Fastest, most space-efficient. Native workspace support. Better than npm/yarn for monorepos. Handles React Native metro bundler requirements well. |
| **TypeScript** | ^5.8.0 | Shared type system | Already in use. Path aliases for shared packages, strict mode for catching cross-platform issues early. |

**Confidence:** MEDIUM - Turborepo and pnpm were leading choices as of late 2024, but ecosystem may have evolved.

**Alternative Considered:**
- **Nx** - More powerful, steeper learning curve. Overkill for 3-package monorepo (shared, web, mobile). Better for 10+ packages.
- **Yarn Workspaces** - Mature but slower than pnpm. No built-in task orchestration like Turborepo.
- **Lerna** - Declining usage by 2024, superseded by Turborepo/Nx.

### React Native Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Expo** | SDK 52+ | Managed React Native workflow | Aligns with project constraints (single developer, faster iteration). EAS Build handles iOS/Android builds without local Xcode/Android Studio. OTA updates via EAS Update. Strong plugin ecosystem. Expo Router for navigation (file-based routing matching web patterns). |
| **React Native** | 0.76+ | Mobile framework | Expo SDK 52 targets RN 0.76 (verify current pairing). New architecture (Fabric + TurboModules) enabled by default in Expo 52+. |
| **Expo Router** | ^4.0.0+ | File-based routing | Matches React Router patterns on web. Universal navigation links. Deep linking built-in. Type-safe routing. |

**Confidence:** MEDIUM - Expo SDK 51 was current in late 2024, SDK 52 expected early 2025. Verify current stable version.

**Why Expo, Not Bare React Native:**
- Project explicitly chooses Expo for "faster development, managed workflow, easier deployment" (from PROJECT.md)
- Single developer context - Expo reduces native config overhead
- Expo Audio, Notifications, TaskManager cover all project requirements
- Can eject to bare workflow later if needed (rare)

### Mobile-Specific Libraries

#### Audio System

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **expo-av** | ^14.0.0+ | Audio playback | Official Expo audio solution. Handles background audio, audio mixing, playback control. Supports MP3/audio files already in `public/sounds/`. Can layer multiple sounds (ambient + drone simulation). |
| **expo-audio** | ^14.0.0+ | Modern audio API | New audio API introduced in Expo SDK 52 (verify). May replace expo-av as recommended approach. Check current Expo docs for migration path. |

**Confidence:** LOW - Expo audio APIs were in transition in late 2024. expo-audio was experimental. Verify current stable recommendation.

**Web Audio API Replacement:**
- Web uses Web Audio API (`AudioContext`, `OscillatorNode`) for generative meditation drone
- Mobile limitation: expo-av does NOT support real-time audio synthesis like Web Audio API
- **Mitigation strategy:** Pre-render meditation drone as audio files, or use react-native-audio-toolkit for lower-level control (requires custom native module)
- **Recommendation:** Simplify mobile audio to layered playback of pre-recorded files. Match 80% of web experience without synthesis complexity.

#### Storage

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **react-native-mmkv** | ^3.0.0+ | Fast local storage | 30x faster than AsyncStorage. Synchronous API (works with Zustand persist). Encryption support. Actively maintained by Margelo. Industry standard for RN storage in 2025. |
| **@react-native-async-storage/async-storage** | ^2.0.0+ | Fallback/migration | Use only for migrating existing localStorage data if needed. MMKV is superior for all new code. |

**Confidence:** HIGH - MMKV was widely adopted standard by 2024. Synchronous API critical for Zustand persist middleware.

**Why MMKV over AsyncStorage:**
- Current web app uses localStorage (synchronous). MMKV provides similar API.
- Zustand persist middleware needs synchronous storage for optimal performance
- AsyncStorage is async, requires zustand-persist-async middleware (less stable)
- MMKV performance critical for mood tracking (frequent writes during sessions)

#### Notifications

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **expo-notifications** | ^0.28.0+ | Push notifications, local scheduling | Official Expo solution. Handles permission management, local notifications (meditation reminders), push notifications (future expansion). Works with EAS for FCM/APNs config. |

**Confidence:** MEDIUM - Version estimate based on late 2024 releases. Verify current stable.

#### Background Tasks

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **expo-task-manager** | ^11.0.0+ | Background execution | Required for background audio during meditation sessions. Coordinates with expo-av for uninterrupted playback. |
| **expo-background-fetch** | ^12.0.0+ | Periodic background updates | Optional. For syncing analytics or checking streaks even when app closed. iOS limits to ~15min intervals. |

**Confidence:** MEDIUM - Versions based on Expo SDK 51 timeline.

#### Home Screen Widgets

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **react-native-widget-extension** | ^1.0.0+ (iOS) | iOS widgets | Community solution for iOS 14+ widgets. Requires Expo config plugin. Displays quick-start meditation, streak counter. |
| **react-native-android-widget** | ^0.10.0+ (Android) | Android widgets | Separate implementation for Android. Less mature than iOS. Consider deferring to later phase. |

**Confidence:** LOW - Widget libraries were emerging/experimental in 2024. May not be production-ready. Consider post-MVP.

**Recommendation:** Defer widgets to Phase 2. Focus on core app first. Widget ecosystem was immature as of early 2025.

### Shared Code Architecture

#### State Management

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **Zustand** | ^5.0.0+ | Cross-platform state | Already in use on web. Works identically on RN. Move to shared package unchanged. |
| **zustand/middleware** | (included) | Persist middleware | Already using `persist` for localStorage. Adapt to use MMKV storage on mobile, localStorage on web. Platform-specific storage adapter pattern. |

**Confidence:** HIGH - Zustand is platform-agnostic, proven in production across web/mobile.

#### Forms & Validation

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **React Hook Form** | ^7.61.0+ | Form management | Already in use. Works identically on RN. Share form logic in meditation-core package. |
| **Zod** | ^3.25.0+ | Schema validation | Already in use. Platform-agnostic. Share validation schemas across web/mobile. |

**Confidence:** HIGH - Both libraries are platform-agnostic and already in use.

#### UI Component Strategy

**DO NOT SHARE:**
- shadcn/ui (web) - Radix UI primitives don't work on React Native
- Tailwind CSS (web) - Not supported on React Native

**INSTEAD:**
- **React Native Paper** (^5.12.0+) - Material Design for RN, or
- **NativeBase** (^3.4.0+) - Cross-platform component library, or
- **tamagui** (^1.90.0+) - Universal design system (works web + RN, uses React Native Web)

**Recommendation: tamagui** if budget allows learning curve. Otherwise, separate UI layers (web keeps shadcn, mobile uses RN Paper). Share only business logic, not UI components.

**Confidence:** MEDIUM - tamagui was gaining adoption in 2024 but has steeper setup. RN Paper is safer, mature choice.

### Build & Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **EAS Build** | Latest | Cloud builds for iOS/Android | Expo's managed build service. No local Xcode/Android Studio required. Handles certificates, provisioning profiles. Required for single-developer workflow. |
| **EAS Submit** | Latest | App store deployment | Automated submission to App Store / Play Store from CI/CD. |
| **EAS Update** | Latest | OTA updates | Push updates without app store review (for JS/asset changes, not native). Critical for fast iteration. |

**Confidence:** HIGH - EAS is the standard Expo build solution, mature and production-proven.

**Cost Note:** EAS Build free tier: 30 builds/month. Likely sufficient during development. Production apps need paid plan ($29/month).

### Analytics & Monitoring

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **@vercel/analytics** | ^2.0.0+ | Web analytics | Keep for web app. Does NOT work on React Native. |
| **expo-analytics-segment** | ^13.0.0+ | Mobile analytics | Expo's Segment wrapper. Send events to Segment (free tier), which forwards to Vercel, Mixpanel, etc. Unified analytics pipeline. |
| **Sentry React Native** | ^5.36.0+ | Error tracking | Production error monitoring. React Native requires special setup (source maps, release tracking). Use @sentry/react-native, not @sentry/browser. |

**Confidence:** MEDIUM - Versions estimated from late 2024. Verify Sentry RN current stable release.

**Analytics Migration Strategy:**
- Web continues using `@vercel/analytics` directly
- Mobile uses expo-analytics-segment → Segment → Vercel integration
- Share event tracking types in meditation-core package
- Platform-specific analytics adapters in each app

### Development Tools

| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| **Metro** | ^0.80.0+ | React Native bundler | Built into RN/Expo. Handles .native.tsx extensions for platform-specific code. Configure to work with monorepo symlinks. |
| **Expo CLI** | Latest | Development workflow | `npx expo start` for dev server, `npx expo prebuild` if custom native code needed. |
| **EAS CLI** | Latest | Build/deploy workflow | `eas build`, `eas submit`, `eas update` commands. |

**Confidence:** MEDIUM - Metro bundler version tied to React Native version. Verify compatibility.

## Package Structure

```
SimpleMeditation/
├── apps/
│   ├── web/                    # Existing React + Vite app
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile/                 # New Expo app
│       ├── app/                # Expo Router file-based routing
│       │   ├── (tabs)/
│       │   │   ├── index.tsx   # Home/meditation player
│       │   │   ├── tracker.tsx
│       │   │   ├── analytics.tsx
│       │   │   └── settings.tsx
│       │   └── _layout.tsx
│       ├── assets/
│       ├── app.json            # Expo config
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── meditation-core/        # Shared business logic
│   │   ├── src/
│   │   │   ├── store/          # Zustand stores
│   │   │   │   └── meditation-store.ts
│   │   │   ├── types/          # Shared TypeScript types
│   │   │   │   ├── mood.ts
│   │   │   │   ├── session.ts
│   │   │   │   └── analytics.ts
│   │   │   ├── utils/          # Platform-agnostic utilities
│   │   │   │   ├── mood-calculations.ts
│   │   │   │   ├── streak-tracker.ts
│   │   │   │   └── date-utils.ts
│   │   │   ├── storage/        # Storage adapters
│   │   │   │   ├── storage-adapter.ts  # Interface
│   │   │   │   ├── web-storage.ts      # localStorage impl
│   │   │   │   └── mobile-storage.ts   # MMKV impl
│   │   │   └── analytics/      # Analytics adapters
│   │   │       ├── analytics-adapter.ts
│   │   │       ├── web-analytics.ts
│   │   │       └── mobile-analytics.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── eslint-config/          # Shared ESLint config
│       └── package.json
│
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # pnpm workspace definition
├── turbo.json                  # Turborepo pipeline config
└── tsconfig.json               # Root TypeScript config
```

**Confidence:** HIGH - This structure is standard for Turborepo + pnpm monorepos.

## Installation Instructions

### Initial Setup

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Initialize Turborepo in existing project
npx create-turbo@latest --example blank

# Or manually:
# 1. Create pnpm-workspace.yaml
# 2. Create turbo.json
# 3. Restructure existing app into apps/web/
# 4. Create packages/meditation-core/
# 5. Create apps/mobile/ with npx create-expo-app
```

### Core Dependencies (Mobile App)

```bash
cd apps/mobile

# Expo base
npx expo install expo@latest react-native@latest react@latest react-dom@latest

# Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens

# Audio
npx expo install expo-av
# OR (if expo-audio is now stable):
npx expo install expo-audio

# Storage
pnpm add react-native-mmkv

# Notifications
npx expo install expo-notifications expo-device

# Background tasks
npx expo install expo-task-manager expo-background-fetch

# State & forms (from shared package)
# (no install needed, imported from meditation-core)

# Analytics
npx expo install expo-analytics-segment
pnpm add @sentry/react-native

# UI components
pnpm add react-native-paper react-native-vector-icons
# OR
pnpm add tamagui @tamagui/config
```

### Shared Package Dependencies

```bash
cd packages/meditation-core

# State management
pnpm add zustand

# Validation
pnpm add zod react-hook-form @hookform/resolvers

# Date utilities
pnpm add date-fns

# Dev dependencies
pnpm add -D typescript @types/node
```

### Build Tools

```bash
# Root level
pnpm add -D turbo

# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS for project
cd apps/mobile
eas build:configure
```

## Migration Strategy

### Phase 1: Monorepo Structure
1. Install pnpm, create workspace config
2. Move existing app to `apps/web/`
3. Create `packages/meditation-core/` with basic structure
4. Configure Turborepo for web app (ensure existing build works)

### Phase 2: Extract Shared Logic
1. Move Zustand stores to meditation-core
2. Move types (Mood, Session, etc.) to meditation-core
3. Move utility functions (mood calculations, streaks) to meditation-core
4. Create storage adapter interface
5. Implement web storage adapter (localStorage wrapper)
6. Update web app to import from meditation-core
7. Verify web app still works

### Phase 3: Mobile App Scaffold
1. Create `apps/mobile/` with Expo
2. Configure Expo Router with tab navigation
3. Implement mobile storage adapter (MMKV)
4. Import meditation-core into mobile app
5. Create basic UI shell (no shadcn, use RN Paper or plain RN components)
6. Test state management and storage on mobile

### Phase 4: Feature Parity
1. Implement meditation player UI (mobile native)
2. Implement mood tracker UI (mobile native)
3. Implement analytics charts (react-native-chart-kit or victory-native)
4. Configure audio playback with expo-av
5. Port audio files to mobile bundle
6. Test core meditation flow end-to-end

### Phase 5: Mobile-Specific Features
1. Implement push notifications
2. Configure background audio with task manager
3. Add offline support (verify all features work without network)
4. Set up EAS Build for iOS and Android
5. Test on physical devices

### Phase 6: Deployment
1. Configure EAS Submit for app stores
2. Set up Sentry for mobile error tracking
3. Configure analytics pipeline (Segment integration)
4. Build and submit to TestFlight / Play Store Beta
5. Iterate on feedback

## Platform-Specific Considerations

### Audio Architecture

**Web (existing):**
- Web Audio API for real-time synthesis
- Dual-layer: ambient MP3 + generative drone (OscillatorNode)
- Full control over frequency, mixing, effects

**Mobile (new):**
- expo-av for playback only
- **Limitation:** No real-time synthesis (no AudioContext equivalent)
- **Solution options:**
  1. Pre-render meditation drone as MP3 files (e.g., 5min, 10min, 20min variants)
  2. Layer ambient sounds with pre-rendered drone using expo-av mixing
  3. Accept simpler audio experience (ambient sounds only, no drone)
  4. Use react-native-audio-toolkit for lower-level control (requires custom native module, breaks Expo managed workflow)

**Recommendation:** Option 1 - Pre-render drone variations. Simplest, stays in Expo managed workflow.

**Confidence:** HIGH - expo-av limitations are well-documented as of 2024.

### Storage Migration

**Web localStorage → Mobile MMKV:**

```typescript
// packages/meditation-core/src/storage/storage-adapter.ts
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Web implementation
import { StorageAdapter } from './storage-adapter';

export class WebStorage implements StorageAdapter {
  getItem(key: string) {
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }
  removeItem(key: string) {
    localStorage.removeItem(key);
  }
}

// Mobile implementation
import { MMKV } from 'react-native-mmkv';
import { StorageAdapter } from './storage-adapter';

const mmkv = new MMKV();

export class MobileStorage implements StorageAdapter {
  getItem(key: string) {
    return mmkv.getString(key) ?? null;
  }
  setItem(key: string, value: string) {
    mmkv.set(key, value);
  }
  removeItem(key: string) {
    mmkv.delete(key);
  }
}

// Zustand persist config
import { persist } from 'zustand/middleware';
import { storage } from './storage'; // Platform-specific import

export const useMeditationStore = create(
  persist(
    (set) => ({ /* state */ }),
    {
      name: 'zen-mood-entries-v2',
      storage: {
        getItem: (name) => {
          const str = storage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          storage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => storage.removeItem(name),
      },
    }
  )
);
```

**Confidence:** HIGH - Pattern is well-established for platform-specific storage in monorepos.

### UI Component Strategy

**Do NOT share UI components** between web and mobile. Different primitives:
- Web: shadcn/ui (Radix UI) + Tailwind CSS
- Mobile: React Native Paper / tamagui + StyleSheet

**DO share:**
- Business logic (Zustand stores)
- Types (Mood, Session, etc.)
- Utility functions (calculations, formatting)
- Validation schemas (Zod)
- Constants (mood configs, sound configs)

**Example - Mood Configuration (shared):**

```typescript
// packages/meditation-core/src/types/mood.ts
export type PreMood = 'stressed' | 'tired' | 'neutral' | 'anxious';
export type PostMood = 'calm' | 'relieved' | 'peaceful' | 'grateful' | 'refreshed';

export interface MoodConfig {
  label: string;
  icon: string; // Icon name (Lucide on web, MaterialCommunityIcons on mobile)
  color: string; // Semantic color name
}

export const preMoodConfig: Record<PreMood, MoodConfig> = {
  stressed: { label: 'Stressed', icon: 'zap', color: 'rose' },
  tired: { label: 'Tired', icon: 'moon', color: 'blue' },
  // ...
};
```

**Platform-specific UI:**

```typescript
// apps/web/src/components/MoodPicker.tsx (existing)
import { Brain, Moon, Minus, Zap } from 'lucide-react';
import { preMoodConfig } from '@meditation/core';

// Icon mapping
const iconMap = {
  'brain': Brain,
  'moon': Moon,
  'zap': Zap,
  // ...
};

// apps/mobile/app/components/MoodPicker.tsx (new)
import { preMoodConfig } from '@meditation/core';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Icon mapping (different names for RN icons)
const iconMap = {
  'brain': 'brain',
  'moon': 'moon-waning-crescent',
  'zap': 'lightning-bolt',
  // ...
};
```

**Confidence:** HIGH - This separation pattern is React/RN standard practice.

## Alternatives Considered

### Monorepo Tools

| Tool | Pros | Cons | Verdict |
|------|------|------|---------|
| **Turborepo** | Fast, simple, great DX. Vercel-backed. Remote caching. | Less powerful than Nx for very large monorepos. | **RECOMMENDED** - Perfect fit for this project scale. |
| **Nx** | Most powerful, extensive plugin ecosystem, advanced features. | Steeper learning curve, overkill for 3 packages. | Overkill for this project. |
| **Lerna** | Mature, widely known. | Slower than modern alternatives, declining adoption. | Superseded by Turborepo/Nx. |
| **Yarn Workspaces** | Simple, built into Yarn. | No task orchestration, slower than pnpm. | Missing Turborepo's build caching. |

### React Native Approach

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Expo (managed)** | Fast dev, no native config, EAS Build, OTA updates. | Some native modules unavailable. Less control. | **RECOMMENDED** - Matches project constraints. |
| **Bare React Native** | Full control, any native module. | Requires Xcode/Android Studio, manual config, slower iteration. | Too complex for single developer. |
| **React Native Web** | One codebase for all platforms. | Compromised UX (not native feel), large bundle, poor web performance. | Anti-pattern. Web and mobile should feel different. |

### Storage Solutions

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **react-native-mmkv** | 30x faster, synchronous API, encryption, actively maintained. | Requires custom native module (works in Expo via config plugin). | **RECOMMENDED** - Industry standard. |
| **AsyncStorage** | Official React Native, simple API. | Async (complicates Zustand persist), slower, deprecated. | Only for legacy migration. |
| **expo-sqlite** | Relational queries, large datasets. | Overkill for simple key-value storage, async API. | Not needed for this app. |
| **WatermelonDB** | Powerful ORM, offline-first. | Heavy, complex setup, overkill. | Not needed for this app. |

### UI Component Libraries

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **React Native Paper** | Material Design, mature, excellent docs, theme support. | Material look (not iOS native feel). | **RECOMMENDED** - Safest choice. |
| **tamagui** | Universal (web + mobile), optimizing compiler, great performance. | Steeper learning curve, newer (less mature). | Future consideration if universal UI needed. |
| **NativeBase** | Large component library, theme system. | Declining adoption by 2024, heavier bundle. | Falling behind RN Paper. |
| **Bare React Native** | Full control, smallest bundle. | Build every component from scratch, slow. | Too time-consuming for single dev. |

## Anti-Patterns to Avoid

### 1. React Native Web for Existing Web App
**Don't:** Rewrite web app to use React Native Web for "universal" codebase.
**Why:** Existing web app is production-ready with shadcn/ui + Tailwind. RN Web compromises web UX, bloats bundle, loses Vite's fast builds.
**Instead:** Keep web and mobile UI separate. Share only business logic.

### 2. Sharing UI Components Across Platforms
**Don't:** Try to make shadcn/ui components work on mobile, or create abstraction layer for "universal" components.
**Why:** Web uses Radix UI (DOM), mobile uses RN primitives (View, Text). Different paradigms. Abstraction layer adds complexity, produces mediocre UX on both platforms.
**Instead:** Separate UI layers, shared business logic.

### 3. AsyncStorage with Synchronous State
**Don't:** Use AsyncStorage with Zustand persist middleware.
**Why:** AsyncStorage is async, Zustand persist expects synchronous storage. Requires async middleware, causes race conditions, complicates state hydration.
**Instead:** Use MMKV (synchronous API, drop-in localStorage replacement).

### 4. Bare React Native for Faster Development
**Don't:** Choose bare React Native to "have full control from the start."
**Why:** Project constraints specify single developer, faster iteration. Bare RN requires Xcode/Android Studio, manual native config, slower build times.
**Instead:** Start with Expo managed workflow. Can eject to bare workflow later if needed (rarely necessary).

### 5. Lerna for New Monorepos
**Don't:** Use Lerna because it's "more mature" or "widely known."
**Why:** Lerna is deprecated/maintenance mode as of 2024. Slower than Turborepo/Nx, no built-in caching.
**Instead:** Use Turborepo (simpler) or Nx (more powerful).

### 6. Simulating Web Audio API on Mobile
**Don't:** Try to recreate Web Audio API's real-time synthesis on React Native using complex audio libraries.
**Why:** React Native audio ecosystem lacks Web Audio API equivalent. expo-av is playback-only. react-native-audio-toolkit requires native code, breaks Expo managed workflow.
**Instead:** Pre-render meditation drone variations as audio files. Accept that mobile audio is playback-focused.

## Critical Dependencies

**Must-have for mobile app to work:**

1. **react-native-mmkv** - Storage. Without this, mood tracking data doesn't persist reliably.
2. **expo-av** or **expo-audio** - Audio playback. Core meditation feature.
3. **expo-notifications** - Meditation reminders. Key value prop for mobile.
4. **expo-task-manager** - Background audio. Meditation sessions can't be interrupted.
5. **Turborepo** + **pnpm** - Monorepo foundation. Enables code sharing.

**Nice-to-have (can defer):**

1. **expo-analytics-segment** - Analytics. Can launch with basic analytics, add later.
2. **@sentry/react-native** - Error tracking. Important for production, not MVP blocker.
3. **expo-background-fetch** - Background sync. Nice for streaks, not essential.
4. **Widget libraries** - Home screen widgets. Defer to post-MVP. Ecosystem immature as of early 2025.

## Version Compatibility Matrix

**Based on late 2024 / early 2025 ecosystem:**

| Expo SDK | React Native | React | Node.js | TypeScript |
|----------|--------------|-------|---------|------------|
| 52 | 0.76.x | 18.3.x | 18+ | 5.3+ |
| 51 | 0.74.x | 18.2.x | 18+ | 5.3+ |

**Confidence:** MEDIUM - SDK 51 was current in late 2024. Verify current stable Expo SDK version before starting.

**Important:** Always use `npx expo install` for Expo dependencies, not `pnpm add`. Expo CLI ensures version compatibility.

## Open Questions for Implementation

1. **Expo audio API status** - Is expo-audio stable and recommended in 2026, or still expo-av?
2. **Turborepo current version** - Is 2.x stable, or still 1.x?
3. **Widget library maturity** - Are iOS/Android widget libraries production-ready in 2026?
4. **tamagui adoption** - Has tamagui reached maturity as universal design system?
5. **Expo SDK version** - What is current stable SDK (52, 53, 54)?
6. **MMKV Expo integration** - Does MMKV require custom config plugin, or is it now built into Expo?

**Action:** Verify all versions and library choices against official documentation before Phase 1 implementation.

## Sources

**Limitation:** Unable to access web search, WebFetch, or Context7 during research. All recommendations based on training data current through January 2025.

**Verification Required:**
- Expo documentation (https://docs.expo.dev) - Current SDK version, expo-audio vs expo-av status
- Turborepo documentation (https://turbo.build/repo/docs) - Current version and setup guide
- React Native MMKV (https://github.com/mrousavy/react-native-mmkv) - Current version and Expo integration
- Expo Router documentation - Current version and API
- React Native Paper (https://callstack.github.io/react-native-paper/) - Current version

**Confidence Levels:**
- Monorepo setup (Turborepo + pnpm): MEDIUM
- Expo managed workflow: MEDIUM
- MMKV storage: HIGH
- Audio strategy (pre-rendered files): HIGH
- UI separation strategy: HIGH
- Widget libraries: LOW (ecosystem was immature in early 2025)

---

*Research completed: 2026-03-12*
*Researcher: Claude (training data through January 2025)*
*Next step: Verify all versions and library choices against current official documentation*
