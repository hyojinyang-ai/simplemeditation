# Phase 2: Shared Logic Extraction - Research

**Researched:** 2026-03-13
**Domain:** Zustand state management extraction to monorepo shared packages
**Confidence:** HIGH

## Summary

Phase 2 extracts core meditation logic from the web app into shared packages for cross-platform reuse. This involves moving Zustand store, TypeScript types, utility functions to `@repo/meditation-core` and quotes data to `@repo/meditation-content`. The key technical challenge is abstracting localStorage to a storage adapter interface that works with both Zustand's persist middleware and future React Native MMKV storage.

The web app currently uses Zustand 5.0.11 with localStorage for persistence, storing meditation entries with pre/post mood tracking, session minutes, sounds, notes, and quotes. The store includes streak calculation logic, mood value mappings, and configuration objects with Lucide icons and Tailwind classes. These must be separated: pure business logic moves to meditation-core, UI configuration stays in web app, and content data moves to meditation-content.

**Primary recommendation:** Use Zustand persist middleware with custom StateStorage adapter interface. Export store factory function `createMeditationStore(storage, key)` from meditation-core. Keep mood/sound configs with Tailwind classes in web app. Write TDD tests in meditation-core before migration to catch regressions early.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Storage Abstraction Strategy:**
- Method-based API with three methods: `getItem(key)`, `setItem(key, value)`, `removeItem(key)`
- Storage adapter deals with strings only—Zustand persist middleware handles JSON serialization
- Adapters throw errors on failure (apps handle try-catch and recovery)
- Storage key is configurable—apps pass 'zen-mood-entries-v2' or custom key to store factory
- Eager loading on store creation (current behavior preserved)

**Icon/UI Dependencies Handling:**
- Split data from presentation: meditation-core exports plain data only (mood types, labels)
- Colors use Tailwind classes (keep current structure: 'bg-zen-lavender-light text-zen-lavender')
- No Lucide icon imports in meditation-core—apps provide their own icon mappings
- Create @repo/meditation-content package in Phase 2 for quotes and future content
- Quote data and getRandomQuote() function both live in meditation-content

**Zustand Store Migration:**
- Export configured store: `createMeditationStore(storageAdapter, storageKey)` returns the store
- Store auto-generates id (crypto.randomUUID()) and timestamp (Date.now()) in addEntry
- Entries parameter type remains `Omit<MoodEntry, 'id' | 'timestamp'>`
- Preserve existing store methods: `addEntry`, `setMeditating`
- Preserve existing state shape: `{ entries: MoodEntry[], isMeditating: boolean }`

**Utility Function Boundaries:**
- Move to meditation-core: Mood value mappings (preMoodToValue, postMoodToValue), streak calculation logic
- Move to meditation-content: stoicQuotes array, getRandomQuote() function
- Keep in apps: Analytics tracking (platform-specific—Vercel Analytics for web, Firebase/Amplitude for mobile)
- Stay in web app: Mood/sound configs with Tailwind classes (web UI concern, mobile will create its own)

**Testing Strategy:**
- Write unit tests in meditation-core before web app migration (TDD approach)
- Test core calculations: streak tracking, mood value mappings
- Mock storage adapter for meditation-core tests (in-memory implementation)
- Apps test integration with real storage adapters
- Write tests in Phase 2 before extracting code to catch bugs early

**TypeScript Configuration:**
- Match web app's TypeScript settings for consistency
- No project references (Phase 1 decision holds—keep packages independent)
- Each package has isolated tsconfig

**Migration Approach:**
- Hybrid migration: Extract store + types together (tightly coupled), then utilities
- Wave 1: Types, store, storage adapter interface → meditation-core
- Wave 2: Utilities (mood values, streak tracking) → meditation-core
- Wave 3: Quotes + getRandomQuote → meditation-content
- Keep old meditation-store.ts temporarily with deprecation comment for rollback safety
- Verify with both automated tests (run web app test suite) and manual testing (full meditation flow walkthrough)

**Error Handling Boundaries:**
- Errors bubble to apps—meditation-core doesn't catch storage adapter errors
- Apps wrap store operations in try-catch and control error UX (toasts, retry buttons, fallback UI)
- If storage.getItem() fails during store init, throw error to app (let app decide response)
- Export typed error classes from meditation-core: `StorageError`, `SerializationError`, `StoreInitError`
- Apps can catch specific error types for fine-grained error handling

### Claude's Discretion

- Exact test coverage percentage and test file organization
- Storage adapter interface naming conventions
- Error message text and error code values
- Package.json exports field configuration
- Whether to use Zustand persist middleware or custom persistence (prefer persist middleware if it works with adapter pattern)

### Deferred Ideas (OUT OF SCOPE)

None—discussion stayed within phase scope. All decisions directly support Phase 2's goal of extracting shared logic while maintaining web app functionality.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MONO-05 | Zustand stores extracted to meditation-core (useMeditationStore) | Zustand persist middleware + StateStorage interface enables cross-platform store |
| MONO-06 | TypeScript types extracted to meditation-core (Mood, Session, Entry) | Types exported via package.json exports field, consumed by web + mobile |
| MONO-07 | Utility functions extracted to meditation-core (streak tracking, mood calculations) | Pure functions testable with vitest, no DOM dependencies |
| MONO-08 | Storage adapter interface defined (getEntries, saveEntry, clearEntries methods) | CORRECTION: StateStorage interface (getItem/setItem/removeItem) matches Zustand persist API |
| MONO-09 | Web storage adapter implemented wrapping localStorage | StateStorage impl with localStorage calls, throws on errors |
| MONO-10 | Mobile storage adapter interface prepared (MMKV implementation in mobile phase) | zustand-mmkv-storage pattern provides reference for Phase 3 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.11 | State management | Already in use, minimal boilerplate, excellent TypeScript support, persist middleware built-in |
| vitest | ^3.2.4 | Testing framework | Already configured in Phase 1, fast, ESM-native, compatible with Zustand testing patterns |
| typescript | ^5.8.3 | Type system | Already in use, ensures type safety across packages |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | ^3.6.0 | Date utilities | Already in web app for streak calculations (subDays, startOfDay, format) |
| @testing-library/react | ^16.0.0 | Component testing | For integration tests of web app consuming meditation-core |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand persist | Custom persistence | Persist middleware handles edge cases (hydration, serialization, versioning). Custom adds maintenance burden. |
| Vitest | Jest | Jest more mature but slower, CommonJS-focused. Vitest faster, ESM-native, same API. Project already on Vitest. |
| StateStorage interface | Custom storage API | StateStorage matches Zustand's built-in interface, reducing impedance mismatch. Custom would require wrapping. |

**Installation:**

For meditation-core package:
```bash
cd packages/meditation-core
pnpm add zustand date-fns
pnpm add -D vitest @types/node
```

For meditation-content package:
```bash
cd packages/meditation-content
pnpm add -D vitest @types/node
```

Web app already has all dependencies installed.

## Architecture Patterns

### Recommended Project Structure
```
packages/
├── meditation-core/
│   ├── src/
│   │   ├── index.ts           # Main exports
│   │   ├── store.ts           # createMeditationStore factory
│   │   ├── types.ts           # TypeScript types (PreMood, PostMood, MoodEntry, etc.)
│   │   ├── utilities.ts       # Pure functions (streak, mood mappings)
│   │   ├── errors.ts          # Custom error classes
│   │   ├── storage.ts         # StateStorage interface
│   │   └── __tests__/         # Unit tests
│   │       ├── store.test.ts
│   │       ├── utilities.test.ts
│   │       └── storage.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
└── meditation-content/
    ├── src/
    │   ├── index.ts           # Main exports
    │   ├── quotes.ts          # stoicQuotes array + getRandomQuote
    │   └── __tests__/
    │       └── quotes.test.ts
    ├── package.json
    ├── tsconfig.json
    └── vitest.config.ts

apps/web/src/lib/
├── meditation-store.ts        # DEPRECATED after migration (kept temporarily)
├── web-storage-adapter.ts     # NEW: localStorage StateStorage implementation
└── analytics.ts               # Keep (platform-specific Vercel Analytics)
```

### Pattern 1: Store Factory with Storage Injection
**What:** Export factory function instead of pre-configured store, allowing apps to inject platform-specific storage.

**When to use:** When shared business logic needs platform-specific persistence (localStorage for web, MMKV for mobile).

**Example:**
```typescript
// packages/meditation-core/src/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { MeditationState } from './types';

export function createMeditationStore(
  storage: StateStorage,
  storageKey: string = 'meditation-entries'
) {
  return create<MeditationState>()(
    persist(
      (set) => ({
        entries: [],
        isMeditating: false,
        addEntry: (entry) =>
          set((state) => ({
            entries: [
              ...state.entries,
              {
                ...entry,
                id: crypto.randomUUID(),
                timestamp: Date.now()
              },
            ],
          })),
        setMeditating: (isActive) => set({ isMeditating: isActive }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => storage),
      }
    )
  );
}

// apps/web/src/lib/web-storage-adapter.ts
import { StateStorage } from 'zustand/middleware';
import { StorageError } from '@repo/meditation-core';

export const webStorageAdapter: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      throw new StorageError(`Failed to get item: ${name}`, error);
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      throw new StorageError(`Failed to set item: ${name}`, error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      throw new StorageError(`Failed to remove item: ${name}`, error);
    }
  },
};

// apps/web/src/lib/meditation-store.ts (NEW VERSION)
import { createMeditationStore } from '@repo/meditation-core';
import { webStorageAdapter } from './web-storage-adapter';

export const useMeditationStore = createMeditationStore(
  webStorageAdapter,
  'zen-mood-entries-v2'
);
```

**Sources:**
- [Zustand Persist Documentation](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)
- [Zustand v5 persist middleware bug fix](https://github.com/pmndrs/zustand) (v5.0.10 fixed state inconsistencies, web app on v5.0.11 is safe)

### Pattern 2: Streak Calculation as Pure Function
**What:** Extract stateful analytics calculation to pure, testable function.

**When to use:** When complex calculation logic (like consecutive day streaks) needs to be shared across platforms.

**Example:**
```typescript
// packages/meditation-core/src/utilities.ts
import { startOfDay, subDays } from 'date-fns';
import type { MoodEntry } from './types';

export function calculateStreak(entries: MoodEntry[]): number {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const dayStart = startOfDay(subDays(new Date(), i)).getTime();
    const dayEnd = dayStart + 86400000; // 24 hours in ms
    const hasEntry = entries.some(
      (e) => e.timestamp >= dayStart && e.timestamp < dayEnd
    );
    if (hasEntry) {
      streak++;
    } else {
      break; // Streak ends on first missing day
    }
  }
  return streak;
}

export const preMoodToValue: Record<PreMood, number> = {
  stressed: 1,
  anxious: 2,
  tired: 2,
  neutral: 3,
};

export const postMoodToValue: Record<PostMood, number> = {
  calm: 4,
  relieved: 4,
  peaceful: 5,
  grateful: 5,
  refreshed: 5,
};

// packages/meditation-core/src/__tests__/utilities.test.ts
import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../utilities';

describe('calculateStreak', () => {
  it('returns 0 when no entries', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 3 for 3 consecutive days', () => {
    const now = Date.now();
    const oneDayMs = 86400000;
    const entries = [
      { timestamp: now, preMood: 'neutral' } as any,
      { timestamp: now - oneDayMs, preMood: 'neutral' } as any,
      { timestamp: now - oneDayMs * 2, preMood: 'neutral' } as any,
    ];
    expect(calculateStreak(entries)).toBe(3);
  });

  it('stops counting at first missing day', () => {
    const now = Date.now();
    const oneDayMs = 86400000;
    const entries = [
      { timestamp: now, preMood: 'neutral' } as any,
      { timestamp: now - oneDayMs, preMood: 'neutral' } as any,
      // Day 2 missing
      { timestamp: now - oneDayMs * 3, preMood: 'neutral' } as any,
    ];
    expect(calculateStreak(entries)).toBe(2);
  });
});
```

**Source:** Extracted from existing `apps/web/src/components/Analytics.tsx` lines 26-32.

### Pattern 3: Content Package for Static Data
**What:** Separate package for quotes and future guided content, keeping core logic package lean.

**When to use:** When data (quotes, sound libraries, future guided meditations) doesn't contain business logic but needs sharing.

**Example:**
```typescript
// packages/meditation-content/src/quotes.ts
export interface Quote {
  text: string;
  author: string;
}

export const stoicQuotes: Quote[] = [
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
  },
  {
    text: "It is not things that disturb us, but our judgments about things.",
    author: "Epictetus",
  },
  // ... 13 more quotes from meditation-store.ts
];

export function getRandomQuote(): Quote {
  return stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];
}

// packages/meditation-content/src/index.ts
export { stoicQuotes, getRandomQuote, type Quote } from './quotes';

// apps/web/src/pages/Index.tsx (after migration)
import { getRandomQuote } from '@repo/meditation-content';

const quote = getRandomQuote();
```

**Rationale:** Content scales differently than logic. Future: localization, A/B testing different quotes, server-fetched content. Separate package allows independent versioning.

### Pattern 4: Custom Error Classes with Type Guards
**What:** Export typed error classes from shared package for fine-grained error handling in apps.

**When to use:** When apps need to distinguish between error types (storage full, network timeout, serialization failure) for UX decisions.

**Example:**
```typescript
// packages/meditation-core/src/errors.ts
export class MeditationError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype); // Fix instanceof for ES5
  }
}

export class StorageError extends MeditationError {}
export class SerializationError extends MeditationError {}
export class StoreInitError extends MeditationError {}

// Type guard helpers
export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

// apps/web/src/hooks/use-meditation-error.ts
import { isStorageError, StorageError } from '@repo/meditation-core';
import { toast } from '@/hooks/use-toast';

export function handleMeditationError(error: unknown) {
  if (isStorageError(error)) {
    toast({
      title: 'Storage Error',
      description: 'Failed to save meditation. Check browser storage.',
      variant: 'destructive',
    });
    // Could offer "Clear old entries" action
  } else {
    toast({
      title: 'Unknown Error',
      description: 'Something went wrong. Please try again.',
      variant: 'destructive',
    });
  }
}
```

**Sources:**
- [Understanding Custom Errors in TypeScript](https://medium.com/@Nelsonalfonso/understanding-custom-errors-in-typescript-a-complete-guide-f47a1df9354c)
- [Custom Exceptions in modern js/ts](https://dev.to/manuartero/custom-exceptions-in-modern-js-ts-2in9)

### Anti-Patterns to Avoid

- **Over-globalizing State:** Not every piece of state needs Zustand. If state is only used by one component, useState is still the right call. Only move shared state to meditation-core.
- **Storing Server Data in Zustand:** Don't use Zustand for API-fetched data. Use React Query/TanStack Query for server state (already in web app). Zustand is for client-side meditation entries only.
- **Object Selectors Without useShallow:** In Zustand v5, object selectors without `useShallow` cause React to throw maximum update depth errors. Always use primitive selectors or `useShallow` for multi-field selections.
- **Not Versioning Persisted State:** The first time you change a persisted store's shape without a migration, users will see broken state. Version from the start using persist middleware's `version` option.

**Sources:**
- [Common Mistakes with Zustand State Management](https://www.linkedin.com/posts/rameshbaddi_zustand-reactjs-nextjs-activity-7381180834323746817-9_OE)
- [Solving zustand persisted store re-hydration merging state issue](https://dev.to/atsyot/solving-zustand-persisted-store-re-hydtration-merging-state-issue-1abk)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence | Custom localStorage wrapper with JSON serialization | Zustand persist middleware | Handles hydration timing, SSR edge cases, versioning, partial persistence (partialize), storage adapters, async storage. Writing custom loses all these features. |
| Storage abstraction | Custom storage interface | Zustand StateStorage interface | Zustand expects `{ getItem, setItem, removeItem }` returning `string | null | Promise<string | null>`. Custom interface adds wrapper layer. |
| React Native storage | Custom MMKV wrapper | zustand-mmkv-storage library | Actively maintained (Dec 2025 update), <1KB, handles lazy loading + instance caching + hydration. Zero reason to build custom. |
| Date calculations | Custom day counting logic | date-fns library | Already in web app. Handles timezones, DST, leap years correctly. Custom date math always has bugs. |
| Error base classes | Extending Error directly | Set prototype with Object.setPrototypeOf | `instanceof` checks break in transpiled ES5 without prototype chain fix. This is a known TypeScript gotcha. |

**Key insight:** Zustand's persist middleware is production-hardened. The SimpleMeditation web app already uses it successfully. Custom persistence would reintroduce solved problems (hydration races, partial updates, error handling). The only custom code needed is the StateStorage adapter, which is a thin 10-line wrapper around localStorage.

**Sources:**
- [Zustand persist middleware documentation](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)
- [zustand-mmkv-storage library](https://github.com/1mehdifaraji/zustand-mmkv-storage)
- [Custom errors in TypeScript](https://bobbyhadz.com/blog/typescript-extend-error-class)

## Common Pitfalls

### Pitfall 1: Forgetting to Export Types from package.json
**What goes wrong:** TypeScript can resolve types in development (direct `.ts` imports) but fails when web app is built or mobile app imports the package. Error: "Cannot find module '@repo/meditation-core' or its corresponding type declarations."

**Why it happens:** The package.json `exports` field controls what consumers can import. Without explicit type exports, TypeScript can't find `.d.ts` files.

**How to avoid:**
```json
// packages/meditation-core/package.json
{
  "name": "@repo/meditation-core",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  }
}
```

The `"types"` condition must come FIRST. If placed after `"default"`, TypeScript will ignore it.

**Warning signs:** Build works locally, fails in CI. Mobile app can't resolve imports. Type errors about missing declarations.

**Sources:**
- [Guide to package.json exports field](https://hirok.io/posts/package-json-exports)
- [Live types in a TypeScript monorepo](https://colinhacks.com/essays/live-types-typescript-monorepo)

### Pitfall 2: Breaking Store Hydration with Eager State Access
**What goes wrong:** Component reads `entries` from store before persist middleware finishes hydrating from storage. User sees empty state flash, then data loads. Or worse: component writes empty state back to storage, wiping user data.

**Why it happens:** Zustand persist is async. Initial store state is empty `{ entries: [] }`. Middleware loads persisted data shortly after, updating state. If component renders before hydration completes, it sees empty state.

**How to avoid:**
```typescript
// packages/meditation-core/src/store.ts
export function createMeditationStore(storage: StateStorage, storageKey: string) {
  return create<MeditationState>()(
    persist(
      (set) => ({
        entries: [],
        isMeditating: false,
        _hasHydrated: false, // Track hydration status
        addEntry: (entry) => set((state) => ({ /* ... */ })),
        setMeditating: (isActive) => set({ isMeditating: isActive }),
        setHasHydrated: (state) => set({ _hasHydrated: state }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => storage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  );
}

// apps/web/src/components/Analytics.tsx
const { entries, _hasHydrated } = useMeditationStore();

if (!_hasHydrated) {
  return <LoadingSpinner />;
}

// Safe: hydration complete, entries are real
const streak = calculateStreak(entries);
```

**Warning signs:** Streak shows 0 on first render, then correct value. Entries disappear after reload. Race conditions in tests.

**Sources:**
- [Making Zustand Persist Play Nice with Async Storage & React Suspense](https://dev.to/finalgirl321/making-zustand-persist-play-nice-with-async-storage-react-suspense-part-12-58l1)
- [Zustand persist documentation - hasHydrated pattern](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)

### Pitfall 3: Importing UI Dependencies into meditation-core
**What goes wrong:** Accidentally import Lucide icons or Tailwind config into meditation-core. Mobile app build fails because `lucide-react` doesn't exist in React Native. Or worse: bundle size balloons because core package pulls in web-specific dependencies.

**Why it happens:** Current `meditation-store.ts` imports icons for mood/sound configs. Easy to copy-paste entire config object when extracting.

**How to avoid:**
```typescript
// packages/meditation-core/src/types.ts (CORRECT)
export type PreMood = 'stressed' | 'tired' | 'neutral' | 'anxious';

export const preMoodLabels: Record<PreMood, string> = {
  stressed: 'Stressed',
  tired: 'Tired',
  neutral: 'Neutral',
  anxious: 'Anxious',
};

export const preMoodColors: Record<PreMood, string> = {
  stressed: 'bg-zen-rose-light text-zen-rose',
  tired: 'bg-zen-lavender-light text-zen-lavender',
  neutral: 'bg-zen-sky-light text-zen-sky',
  anxious: 'bg-zen-blue-light text-zen-blue',
};

// apps/web/src/lib/web-mood-config.ts (CORRECT - web-specific)
import { Frown, BatteryLow, Minus, AlertTriangle } from 'lucide-react';
import { preMoodLabels, preMoodColors } from '@repo/meditation-core';

export const preMoodConfig = {
  stressed: { icon: Frown, label: preMoodLabels.stressed, color: preMoodColors.stressed },
  tired: { icon: BatteryLow, label: preMoodLabels.tired, color: preMoodColors.tired },
  // ...
};

// packages/meditation-core/src/types.ts (WRONG - DO NOT DO THIS)
import { Frown } from 'lucide-react'; // ❌ Mobile can't resolve this
```

**Warning signs:** Mobile build fails with "Module not found: lucide-react". `pnpm why lucide-react` shows meditation-core depends on it. Bundle analyzer shows meditation-core > 500KB.

### Pitfall 4: Not Mocking Zustand Store in Tests
**What goes wrong:** Tests fail with "Cannot read property 'getState' of undefined" or "store is not defined". Test isolation breaks: state from one test leaks into another.

**Why it happens:** Zustand creates a singleton store. Without mocking, all tests share the same store instance. Tests must reset state between runs.

**How to avoid:**
```typescript
// packages/meditation-core/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});

// packages/meditation-core/src/__tests__/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMeditationStore } from '../store';
import type { StateStorage } from 'zustand/middleware';

// In-memory storage for tests
const createMockStorage = (): StateStorage => {
  let storage: Record<string, string> = {};
  return {
    getItem: (name) => storage[name] || null,
    setItem: (name, value) => { storage[name] = value; },
    removeItem: (name) => { delete storage[name]; },
  };
};

describe('createMeditationStore', () => {
  let store: ReturnType<typeof createMeditationStore>;

  beforeEach(() => {
    // Fresh store for each test
    store = createMeditationStore(createMockStorage(), 'test-key');
  });

  it('initializes with empty entries', () => {
    expect(store.getState().entries).toEqual([]);
  });

  it('adds entry with generated id and timestamp', () => {
    store.getState().addEntry({ preMood: 'stressed' });
    const entries = store.getState().entries;

    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBeDefined();
    expect(entries[0].timestamp).toBeGreaterThan(0);
    expect(entries[0].preMood).toBe('stressed');
  });
});
```

**Warning signs:** Tests pass individually, fail when run together. Flaky tests. "State is undefined" errors.

**Sources:**
- [Zustand Testing Guide](https://zustand.docs.pmnd.rs/guides/testing)
- [Writing unit tests of zustand state management store with vitest](https://gist.github.com/mustafadalga/475769fcb77b08a813bf5dae0a145027)
- [Vitest and Zustand only works with slight modifications from docs](https://github.com/pmndrs/zustand/discussions/1918)

### Pitfall 5: Mismatched Storage Key Between Old and New Store
**What goes wrong:** After migration, web app creates new store with different storage key. User's meditation history disappears. Existing localStorage data at `zen-mood-entries-v2` is orphaned.

**Why it happens:** Factory function introduces storage key as parameter. Easy to forget existing key name or mistype it.

**How to avoid:**
```typescript
// apps/web/src/lib/meditation-store.ts (MIGRATION - CRITICAL)
import { createMeditationStore } from '@repo/meditation-core';
import { webStorageAdapter } from './web-storage-adapter';

// ✅ CORRECT: Use existing key to preserve user data
export const useMeditationStore = createMeditationStore(
  webStorageAdapter,
  'zen-mood-entries-v2' // Match existing key from old store
);

// ❌ WRONG: Different key loses all user data
export const useMeditationStore = createMeditationStore(
  webStorageAdapter,
  'meditation-entries' // New key - users lose history!
);
```

**Verification step:** Before deleting old store file, check localStorage in browser DevTools. Key should match. After migration, verify entries still exist.

**Warning signs:** User reports lost meditation history after update. localStorage shows both old and new keys with different data. Analytics shows sudden drop in "returning user" streak days.

## Code Examples

Verified patterns from official sources and existing codebase:

### Zustand Persist with StateStorage (Official Pattern)
```typescript
// Source: https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

// Custom storage implementing StateStorage interface
const customStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

interface MyState {
  bears: number;
  addBear: () => void;
}

const useStore = create<MyState>()(
  persist(
    (set) => ({
      bears: 0,
      addBear: () => set((state) => ({ bears: state.bears + 1 })),
    }),
    {
      name: 'bear-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
);
```

### React Native MMKV Storage Adapter (Reference for Phase 3)
```typescript
// Source: https://github.com/1mehdifaraji/zustand-mmkv-storage
// For reference only - Phase 3 will implement mobile storage
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

const mmkv = new MMKV();

export const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  removeItem: (name) => {
    mmkv.delete(name);
  },
};

// Usage in React Native app
const useMeditationStore = createMeditationStore(
  mmkvStorage,
  'meditation-entries'
);
```

### Streak Calculation (Extracted from Existing Code)
```typescript
// Source: apps/web/src/components/Analytics.tsx lines 26-32
import { startOfDay, subDays } from 'date-fns';

function calculateStreak(entries: MoodEntry[]): number {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = startOfDay(subDays(new Date(), i)).getTime();
    const hasEntry = entries.some(
      (e) => e.timestamp >= day && e.timestamp < day + 86400000
    );
    if (hasEntry) streak++;
    else break;
  }
  return streak;
}
```

### Package.json Exports for TypeScript Monorepo
```json
// Source: https://colinhacks.com/essays/live-types-typescript-monorepo
// packages/meditation-core/package.json
{
  "name": "@repo/meditation-core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "dependencies": {
    "zustand": "^5.0.11",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4",
    "@types/node": "^22.16.5"
  }
}
```

**Note:** "types" must come first in exports. TypeScript ignores it if placed after "default".

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zustand v4 devtools import path | Zustand v5 unified middleware | v5.0.0 (2024) | Import from 'zustand/middleware' instead of 'zustand/middleware/devtools'. Web app already on v5.0.11. |
| Manual localStorage wrapper | Zustand persist middleware | Built-in since v3 | Middleware handles hydration, versioning, partial persistence. No reason to build custom. |
| AsyncStorage for React Native | MMKV for React Native | ~2021 (react-native-mmkv) | MMKV is ~30x faster, synchronous. zustand-mmkv-storage adapter (Dec 2025) makes integration trivial. |
| Direct TypeScript imports in monorepo | package.json exports field | TypeScript 4.7 (2022) | Explicit public API, prevents internal imports, supports conditional exports for different module systems. |
| Jest for testing | Vitest for testing | Vitest 1.0 (2023) | Vitest is faster, ESM-native, same API as Jest. Project already on Vitest 3.2.4. |

**Deprecated/outdated:**
- **Zustand devtools separate import:** Now unified in 'zustand/middleware' (v5+)
- **getStorage/serialize/deserialize in persist:** Replaced by `storage` option with createJSONStorage helper (v4+)
- **Custom localStorage wrappers:** Persist middleware handles serialization, errors, hydration. Custom wrappers are legacy pattern.

**Critical bug fix:**
- **Zustand v5.0.9 persist middleware bug:** Fixed in v5.0.10 (January 2026). If using v5.0.9 or earlier, state inconsistencies possible. Web app is on v5.0.11 ✅ safe.

**Sources:**
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand persist documentation](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)
- [How to Persist State with AsyncStorage and MMKV in React Native](https://oneuptime.com/blog/post/2026-01-15-react-native-asyncstorage-mmkv/view)

## Open Questions

1. **Should meditation-core export mood/sound labels with colors as-is, or split into separate exports?**
   - What we know: Colors use Tailwind classes. Mobile will use different styling system (React Native Paper). Labels are universal.
   - What's unclear: Will mobile reuse color class strings and map to RN Paper colors? Or expect hex codes? Or just ignore colors entirely?
   - Recommendation: Export labels and color classes separately. Mobile can choose to import labels only. If mobile needs colors, Phase 3 will add hex code mapping utility. Don't over-engineer now.

2. **Should streak calculation consider timezone or always use browser's local time?**
   - What we know: Current implementation uses `startOfDay(subDays(new Date(), i))` which uses local browser time. User traveling across timezones could break streak.
   - What's unclear: Do users expect streak to reset at midnight local time, or midnight in their "home" timezone? What about users meditating on airplanes?
   - Recommendation: Keep current behavior (browser local time) for simplicity. Future enhancement: let users set "home timezone" in settings. Phase 2 isn't the place to solve edge cases.

3. **Should storage adapter throw custom errors or native DOMException?**
   - What we know: User decision says adapters throw errors. StorageError custom class defined.
   - What's unclear: Should we wrap native localStorage errors (QuotaExceededError, SecurityError) in StorageError, or let them bubble through?
   - Recommendation: Wrap in StorageError with original error as `cause`. Apps can check error type without knowing browser-specific error names. Easier to mock in tests.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 with node environment (meditation-core, meditation-content) |
| Config file | packages/meditation-core/vitest.config.ts (exists from Phase 1) |
| Quick run command | `pnpm --filter @repo/meditation-core test` |
| Full suite command | `pnpm test` (runs all packages via turbo) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MONO-05 | Store factory creates functional store | unit | `pnpm --filter @repo/meditation-core test src/__tests__/store.test.ts -x` | ❌ Wave 0 |
| MONO-05 | addEntry generates id and timestamp | unit | `pnpm --filter @repo/meditation-core test src/__tests__/store.test.ts -x` | ❌ Wave 0 |
| MONO-05 | setMeditating toggles boolean state | unit | `pnpm --filter @repo/meditation-core test src/__tests__/store.test.ts -x` | ❌ Wave 0 |
| MONO-06 | Types exported from package | unit | `pnpm --filter @repo/meditation-core test src/__tests__/types.test.ts -x` | ❌ Wave 0 |
| MONO-07 | calculateStreak counts consecutive days | unit | `pnpm --filter @repo/meditation-core test src/__tests__/utilities.test.ts -x` | ❌ Wave 0 |
| MONO-07 | preMoodToValue/postMoodToValue mappings | unit | `pnpm --filter @repo/meditation-core test src/__tests__/utilities.test.ts -x` | ❌ Wave 0 |
| MONO-08 | StateStorage interface type-checks | unit | TypeScript compilation (`pnpm build`) | ❌ Wave 0 |
| MONO-09 | Web storage adapter calls localStorage | integration | `pnpm --filter @repo/web test src/lib/__tests__/web-storage-adapter.test.ts -x` | ❌ Wave 0 |
| MONO-09 | Web storage adapter throws StorageError on failure | integration | `pnpm --filter @repo/web test src/lib/__tests__/web-storage-adapter.test.ts -x` | ❌ Wave 0 |
| MONO-10 | MMKV adapter interface documented | manual-only | N/A - verification via docs review | N/A |

**Note:** MONO-10 is documentation/interface design only. Phase 3 will implement and test actual MMKV adapter.

### Sampling Rate
- **Per task commit:** `pnpm --filter @repo/meditation-core test` (meditation-core unit tests)
- **Per wave merge:** `pnpm test` (all packages - web app integration tests included)
- **Phase gate:** Full suite green + manual walkthrough (web app: pre-mood → meditate → post-mood → analytics streak verified)

### Wave 0 Gaps

#### meditation-core Tests
- [ ] `packages/meditation-core/src/__tests__/store.test.ts` — covers MONO-05
  - Test: Store factory with mock storage creates working store
  - Test: addEntry generates unique id and current timestamp
  - Test: setMeditating toggles isMeditating boolean
  - Test: Persist middleware saves to storage on state change
- [ ] `packages/meditation-core/src/__tests__/utilities.test.ts` — covers MONO-07
  - Test: calculateStreak returns 0 for empty entries
  - Test: calculateStreak counts 3 consecutive days correctly
  - Test: calculateStreak stops at first missing day
  - Test: preMoodToValue maps all 4 pre-moods
  - Test: postMoodToValue maps all 5 post-moods
- [ ] `packages/meditation-core/src/__tests__/types.test.ts` — covers MONO-06
  - Test: All exported types compile without errors (TypeScript test)

#### meditation-content Tests
- [ ] `packages/meditation-content/src/__tests__/quotes.test.ts`
  - Test: stoicQuotes array has 15 items
  - Test: getRandomQuote returns valid Quote object
  - Test: getRandomQuote returns different quotes (run 20 times, expect >1 unique)

#### Web App Integration Tests
- [ ] `apps/web/src/lib/__tests__/web-storage-adapter.test.ts` — covers MONO-09
  - Test: getItem returns value from localStorage
  - Test: setItem writes to localStorage
  - Test: removeItem deletes from localStorage
  - Test: getItem throws StorageError when localStorage throws
- [ ] `apps/web/src/lib/__tests__/meditation-store.test.ts` — covers integration
  - Test: useMeditationStore imports successfully
  - Test: Store persists entries to localStorage key 'zen-mood-entries-v2'

#### Test Infrastructure
- [ ] Mock storage helper: `packages/meditation-core/src/__tests__/helpers/mock-storage.ts`
  - In-memory StateStorage implementation for tests
  - Used by all store tests to avoid localStorage dependency

**Framework install:** Already installed (vitest in all packages from Phase 1)

**Estimated Wave 0 effort:** 2-3 hours to write all tests before extraction begins.

## Sources

### Primary (HIGH confidence)
- [Zustand Persisting store data - Official Docs](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data) - StateStorage interface, persist middleware, createJSONStorage
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - v5.0.11 release notes, persist middleware source code
- [zustand-mmkv-storage GitHub](https://github.com/1mehdifaraji/zustand-mmkv-storage) - React Native storage adapter reference
- [Live types in a TypeScript monorepo](https://colinhacks.com/essays/live-types-typescript-monorepo) - package.json exports best practices
- Existing codebase: apps/web/src/lib/meditation-store.ts, apps/web/src/components/Analytics.tsx

### Secondary (MEDIUM confidence)
- [Zustand Testing Guide](https://zustand.docs.pmnd.rs/guides/testing) - Vitest setup and mocking patterns
- [Writing unit tests of zustand state management store with vitest](https://gist.github.com/mustafadalga/475769fcb77b08a813bf5dae0a145027) - Practical examples
- [Understanding Custom Errors in TypeScript](https://medium.com/@Nelsonalfonso/understanding-custom-errors-in-typescript-a-complete-guide-f47a1df9354c) - Error class patterns
- [Guide to package.json exports field](https://hirok.io/posts/package-json-exports) - TypeScript conditional exports
- [Common Mistakes with Zustand State Management](https://www.linkedin.com/posts/rameshbaddi_zustand-reactjs-nextjs-activity-7381180834323746817-9_OE) - Anti-patterns verified by community

### Tertiary (LOW confidence)
- [How to Persist State with AsyncStorage and MMKV in React Native](https://oneuptime.com/blog/post/2026-01-15-react-native-asyncstorage-mmkv/view) - Dated January 2026, unverified publication
- [Managing TypeScript Packages in Monorepos](https://nx.dev/blog/managing-ts-packages-in-monorepos) - Nx-specific but generalizable patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zustand v5.0.11 already in use, persist middleware documented, vitest already configured
- Architecture: HIGH - StateStorage interface is official Zustand pattern, existing code provides extraction blueprint
- Pitfalls: MEDIUM - Common mistakes documented in community sources, some inferred from existing code patterns
- Validation: HIGH - Test infrastructure exists, test patterns well-documented, clear mapping from requirements to tests

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (30 days - Zustand is stable, unlikely to have breaking changes in 1 month)

**Key verification performed:**
- ✅ Checked web app package.json: zustand ^5.0.11 installed
- ✅ Verified existing meditation-store.ts structure (148 lines, contains all extraction targets)
- ✅ Confirmed vitest configured in meditation-core package (Phase 1 setup)
- ✅ Cross-referenced StateStorage interface with official Zustand docs
- ✅ Validated streak calculation logic matches Analytics.tsx implementation
- ✅ Verified storage key 'zen-mood-entries-v2' in existing code

**Research satisfies all requirements:**
- MONO-05: Store factory pattern with StateStorage injection
- MONO-06: Types exported via package.json exports field
- MONO-07: Utilities (streak, mood mappings) as pure functions
- MONO-08: StateStorage interface (getItem/setItem/removeItem) matches Zustand
- MONO-09: Web storage adapter wraps localStorage, throws errors
- MONO-10: MMKV adapter reference pattern documented for Phase 3
