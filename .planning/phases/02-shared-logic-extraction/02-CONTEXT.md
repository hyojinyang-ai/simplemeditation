# Phase 2: Shared Logic Extraction - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract core meditation logic (Zustand store, TypeScript types, utility functions) from web app into meditation-core package. Create meditation-content package for quotes data. Web app consumes shared code via imports instead of local implementations. Maintain identical functionality—no feature changes, just code reorganization for cross-platform reuse.

</domain>

<decisions>
## Implementation Decisions

### Storage Abstraction Strategy
- Method-based API with three methods: `getItem(key)`, `setItem(key, value)`, `removeItem(key)`
- Storage adapter deals with strings only—Zustand persist middleware handles JSON serialization
- Adapters throw errors on failure (apps handle try-catch and recovery)
- Storage key is configurable—apps pass 'zen-mood-entries-v2' or custom key to store factory
- Eager loading on store creation (current behavior preserved)

### Icon/UI Dependencies Handling
- Split data from presentation: meditation-core exports plain data only (mood types, labels)
- Colors use Tailwind classes (keep current structure: 'bg-zen-lavender-light text-zen-lavender')
- No Lucide icon imports in meditation-core—apps provide their own icon mappings
- Create @repo/meditation-content package in Phase 2 for quotes and future content
- Quote data and getRandomQuote() function both live in meditation-content

### Zustand Store Migration
- Export configured store: `createMeditationStore(storageAdapter, storageKey)` returns the store
- Store auto-generates id (crypto.randomUUID()) and timestamp (Date.now()) in addEntry
- Entries parameter type remains `Omit<MoodEntry, 'id' | 'timestamp'>`
- Preserve existing store methods: `addEntry`, `setMeditating`
- Preserve existing state shape: `{ entries: MoodEntry[], isMeditating: boolean }`

### Utility Function Boundaries
- **Move to meditation-core:** Mood value mappings (preMoodToValue, postMoodToValue), streak calculation logic
- **Move to meditation-content:** stoicQuotes array, getRandomQuote() function
- **Keep in apps:** Analytics tracking (platform-specific—Vercel Analytics for web, Firebase/Amplitude for mobile)
- **Stay in web app:** Mood/sound configs with Tailwind classes (web UI concern, mobile will create its own)

### Testing Strategy
- Write unit tests in meditation-core before web app migration (TDD approach)
- Test core calculations: streak tracking, mood value mappings
- Mock storage adapter for meditation-core tests (in-memory implementation)
- Apps test integration with real storage adapters
- Write tests in Phase 2 before extracting code to catch bugs early

### TypeScript Configuration
- Match web app's TypeScript settings for consistency
- No project references (Phase 1 decision holds—keep packages independent)
- Each package has isolated tsconfig

### Migration Approach
- Hybrid migration: Extract store + types together (tightly coupled), then utilities
- Wave 1: Types, store, storage adapter interface → meditation-core
- Wave 2: Utilities (mood values, streak tracking) → meditation-core
- Wave 3: Quotes + getRandomQuote → meditation-content
- Keep old meditation-store.ts temporarily with deprecation comment for rollback safety
- Verify with both automated tests (run web app test suite) and manual testing (full meditation flow walkthrough)

### Error Handling Boundaries
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

</decisions>

<code_context>
## Existing Code Insights

### Current Implementation
**apps/web/src/lib/meditation-store.ts (148 lines):**
- Zustand store with `loadEntries()` from localStorage
- TypeScript types: PreMood, PostMood, Mood, SoundType, MoodEntry
- Store state: `{ entries: MoodEntry[], isMeditating: boolean }`
- Store methods: `addEntry`, `setMeditating`
- Mood configs: preMoodConfig, postMoodConfig with Lucide icons and Tailwind classes
- Sound config: soundConfig with Lucide icons
- Utilities: stoicQuotes array, getRandomQuote(), preMoodToValue, postMoodToValue mappings

**apps/web/src/lib/analytics.ts:**
- Vercel Analytics tracking functions (stays in web app)
- Streak calculation logic (implied by requirements) should move to meditation-core

**packages/meditation-core/src/index.ts (17 lines):**
- Placeholder exports only: PACKAGE_NAME, PACKAGE_VERSION, validatePackage()
- Vitest configured with node environment (no jsdom needed)
- Ready for business logic extraction

### Integration Points
- Web app imports from `@/lib/meditation-store` → will change to `@repo/meditation-core`
- Components use `useMeditationStore()` hook → same hook name preserved
- MoodEntry type used in components → export from meditation-core
- localStorage key 'zen-mood-entries-v2' → passed as config to store

### Established Patterns
- localStorage usage: `getItem()`, `setItem()` with JSON serialization
- Error handling: current code uses try-catch returning empty array on failure (will change to throw errors)
- Zustand patterns: functional store updates with `set()`
- Phase 1 JIT approach: src/index.ts exports, no build step (continue for meditation-core)

</code_context>

<specifics>
## Specific Ideas

**Storage adapter API inspiration:**
- Zustand persist middleware expects `{ getItem(key): string | null, setItem(key, value): void, removeItem(key): void }`
- Keep it compatible with Zustand's built-in storage interface for easier integration

**Rollback strategy:**
- Keep deprecated meditation-store.ts as safety net
- If web app breaks after migration, can temporarily revert imports
- Delete deprecated file only after Phase 2 fully validated

**Testing before migration:**
- Write meditation-core tests first
- Verify test suite passes
- Then migrate web app imports
- Run web app tests to ensure no regression
- Manual walkthrough: pre-mood → meditate → post-mood → view analytics

**Package structure:**
- @repo/meditation-core: store, types, utilities
- @repo/meditation-content: quotes, future guided content
- Both packages use same vitest setup as established in Phase 1

</specifics>

<deferred>
## Deferred Ideas

None—discussion stayed within phase scope. All decisions directly support Phase 2's goal of extracting shared logic while maintaining web app functionality.

</deferred>

---

*Phase: 02-shared-logic-extraction*
*Context gathered: 2026-03-12*
