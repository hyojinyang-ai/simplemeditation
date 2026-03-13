---
phase: 02-shared-logic-extraction
plan: 01
subsystem: [packages, content, types]
tags: [content-extraction, type-safety, storage-abstraction]
dependency_graph:
  requires: [MONO-01, MONO-03]
  provides: [MONO-06, MONO-08, MONO-10]
  affects: [web-app]
tech_stack:
  added: [date-fns@4.1.0]
  patterns: [JIT-package, platform-agnostic-storage]
key_files:
  created:
    - packages/meditation-content/src/quotes.ts
    - packages/meditation-content/src/__tests__/quotes.test.ts
    - packages/meditation-core/src/types.ts
    - packages/meditation-core/src/storage.ts
    - packages/meditation-core/src/errors.ts
    - packages/meditation-core/src/__tests__/types.test.ts
  modified:
    - packages/meditation-core/src/index.ts
    - packages/meditation-core/package.json
    - packages/meditation-content/package.json
    - pnpm-lock.yaml
decisions:
  - id: STORAGE-01
    choice: StateStorage interface matches Zustand's built-in interface exactly
    rationale: Enables seamless drop-in replacement for web localStorage and mobile MMKV
    alternatives: [Custom interface with different signatures]
    trade_offs: Locks us into Zustand's conventions but guarantees compatibility
  - id: CONTENT-01
    choice: Separate meditation-content package for quotes
    rationale: Content data changes independently from business logic
    alternatives: [Keep quotes in meditation-core]
    trade_offs: More packages to maintain but cleaner separation of concerns
  - id: COLORS-01
    choice: Export Tailwind classes directly in mood config
    rationale: Both web and mobile apps will use same color tokens (NativeWind for mobile)
    alternatives: [Export raw color values, platform-specific adapters]
    trade_offs: Couples to Tailwind but enables consistent theming
metrics:
  duration_minutes: 5
  tasks_completed: 3
  tests_added: 14
  files_created: 12
  commits: 2
  completed_date: "2026-03-13"
---

# Phase 02 Plan 01: Content & Type Foundations Summary

Created meditation-content package for stoic quotes and extracted core types, storage interface, and error classes to meditation-core. Both packages follow JIT pattern with passing tests and TypeScript compilation.

## What Was Built

### meditation-content Package
- New workspace package with 15 stoic quotes extracted from web app
- Export Quote interface, stoicQuotes array, and getRandomQuote function
- 5 passing tests covering array size, structure validation, and randomness
- Follows JIT package pattern (no build step, exports src/index.ts)

### meditation-core Type System
- Extracted PreMood, PostMood, SoundType, and MoodEntry types from web app
- Added mood labels and Tailwind color classes (no icon dependencies)
- Removed Lucide icon imports to keep package platform-agnostic
- 9 passing tests covering type validation and mood configurations

### Storage Abstraction Layer
- Defined StateStorage interface matching Zustand's built-in interface
- Platform-agnostic design supports web localStorage and mobile MMKV
- Added createStorageAdapter helper with error handling
- JSDoc documentation clarifies sync/async usage patterns

### Error Handling System
- Created base MeditationError class with proper prototype chain
- Specialized error classes: StorageError, SerializationError, StoreInitError
- Type guard functions for type-safe error handling
- Object.setPrototypeOf ensures instanceof checks work correctly

## Testing Results

**meditation-content:**
- 5/5 tests passing
- Coverage: Quote structure, array size, randomness, validation

**meditation-core:**
- 11/11 tests passing (9 new + 2 existing)
- Coverage: Type definitions, mood labels, mood colors

**TypeScript compilation:**
- Both packages compile without errors
- Exports configured correctly (types first)

## Workspace Integration

**Packages discovered:**
- @repo/meditation-content
- @repo/meditation-core
- @repo/typescript-config
- simple-meditation-monorepo (root)

**Dependencies resolved:**
- date-fns@4.1.0 added to meditation-core
- All workspace links functioning
- pnpm-lock.yaml updated

## Key Decisions

### StateStorage Interface Design (STORAGE-01)
**Decision:** Match Zustand's StateStorage interface exactly

**Rationale:** The Zustand persist middleware expects this exact signature. By matching it precisely, we enable:
- Web app: Drop-in localStorage adapter
- Mobile app: Drop-in MMKV adapter (Phase 3)
- Zero adapter code needed

**Trade-offs:** Locks us into Zustand's conventions, but we're already committed to Zustand as our state management solution.

**Result:** Interface documented as platform-agnostic and ready for Phase 3 mobile implementation (satisfies MONO-10).

### Separate Content Package (CONTENT-01)
**Decision:** Create dedicated meditation-content package for quotes

**Rationale:** Content data changes independently from business logic. Separating concerns enables:
- Content updates without touching core logic
- Potential for multiple content themes/languages
- Clearer dependency graph

**Trade-offs:** One more package to maintain, but it's simple (no dependencies, pure data).

### Tailwind Color Export Strategy (COLORS-01)
**Decision:** Export Tailwind CSS classes directly in mood color configs

**Rationale:** Mobile app will use NativeWind (Tailwind for React Native), so same class names work across platforms. Consistent theming without platform-specific adapters.

**Alternative considered:** Export raw HSL values and let each platform implement styling. Rejected because it duplicates color mapping logic.

## Requirements Satisfied

**MONO-06:** Shared content data available across platforms
- ✅ meditation-content exports stoic quotes
- ✅ getRandomQuote function ready for both apps

**MONO-08:** Core types extracted to shared package
- ✅ PreMood, PostMood, MoodEntry, SoundType exported
- ✅ Mood labels and colors available (no UI dependencies)

**MONO-10:** Storage adapter interface prepared for mobile
- ✅ StateStorage interface matches Zustand
- ✅ Documented as platform-agnostic
- ✅ Ready for MMKV adapter in Phase 3

## Deviations from Plan

None - plan executed exactly as written. All tasks completed without issues.

## Next Steps

**Phase 02 Plan 02:** Extract meditation store logic
- Move Zustand store implementation to meditation-core
- Configure persist middleware with StateStorage interface
- Update web app to import from shared package

**Phase 02 Plan 03:** Add utility functions
- Date formatting helpers using date-fns
- Mood analytics calculations
- Entry filtering and sorting

## Files Modified

**Created (12 files):**
- packages/meditation-content/package.json
- packages/meditation-content/tsconfig.json
- packages/meditation-content/vitest.config.ts
- packages/meditation-content/src/index.ts
- packages/meditation-content/src/quotes.ts
- packages/meditation-content/src/__tests__/quotes.test.ts
- packages/meditation-core/src/types.ts
- packages/meditation-core/src/storage.ts
- packages/meditation-core/src/errors.ts
- packages/meditation-core/src/__tests__/types.test.ts

**Modified (3 files):**
- packages/meditation-core/src/index.ts (added exports)
- packages/meditation-core/package.json (added date-fns)
- pnpm-lock.yaml (workspace updates)

## Commits

1. **675672c** - feat(02-01): create meditation-content package with quotes
   - New @repo/meditation-content package
   - 15 stoic quotes with Quote interface
   - 5/5 tests passing

2. **165824e** - feat(02-01): extract types and storage interface to meditation-core
   - Types: PreMood, PostMood, SoundType, MoodEntry
   - Mood labels/colors (no icon dependencies)
   - StateStorage interface (platform-agnostic)
   - Custom error classes with type guards
   - 11/11 tests passing

## Self-Check: PASSED

**Created files verification:**
```
✅ packages/meditation-content/src/quotes.ts
✅ packages/meditation-content/src/__tests__/quotes.test.ts
✅ packages/meditation-content/src/index.ts
✅ packages/meditation-core/src/types.ts
✅ packages/meditation-core/src/storage.ts
✅ packages/meditation-core/src/errors.ts
✅ packages/meditation-core/src/__tests__/types.test.ts
```

**Commits verification:**
```
✅ 675672c (Task 1: meditation-content package)
✅ 165824e (Task 2: types and storage)
```

**Test results:**
```
✅ meditation-content: 5/5 tests passing
✅ meditation-core: 11/11 tests passing
✅ TypeScript compilation: No errors
```

**Workspace verification:**
```
✅ 4 packages discovered
✅ date-fns@4.1.0 resolved
✅ All workspace links functioning
```
