---
phase: 02-shared-logic-extraction
plan: 02
subsystem: [store, utilities, testing]
tags: [zustand, persist-middleware, tdd, streak-calculation]
dependency_graph:
  requires: [MONO-06, MONO-08]
  provides: [MONO-05, MONO-07]
  affects: [web-app, meditation-core]
tech_stack:
  added: [zustand@5.0.11]
  patterns: [store-factory, tdd, mock-storage]
key_files:
  created:
    - packages/meditation-core/src/store.ts
    - packages/meditation-core/src/utilities.ts
    - packages/meditation-core/src/__tests__/store.test.ts
    - packages/meditation-core/src/__tests__/utilities.test.ts
    - packages/meditation-core/src/__tests__/helpers/mock-storage.ts
  modified:
    - packages/meditation-core/src/index.ts
    - packages/meditation-core/src/types.ts
    - packages/meditation-core/package.json
    - pnpm-lock.yaml
decisions:
  - id: STORE-01
    choice: Store factory with StateStorage injection
    rationale: Enables platform-specific persistence (localStorage for web, MMKV for mobile) without coupling business logic
    alternatives: [Pre-configured store, custom persistence layer]
    trade_offs: Slightly more verbose API but maximizes cross-platform compatibility
  - id: UTILS-01
    choice: Pure functions in utilities.ts for calculations
    rationale: Testable without DOM, shareable across platforms, no side effects
    alternatives: [Keep calculations in components, create calculator class]
    trade_offs: More files but better separation of concerns and testability
  - id: TDD-01
    choice: TDD approach with RED-GREEN-REFACTOR cycle
    rationale: Write tests before implementation ensures complete coverage and catches bugs early
    alternatives: [Test after implementation, no tests]
    trade_offs: Slightly slower initial development but prevents regressions and documents behavior
metrics:
  duration_minutes: 4
  tasks_completed: 3
  tests_added: 16
  files_created: 5
  files_modified: 4
  commits: 5
  completed_date: "2026-03-13"
---

# Phase 02 Plan 02: Store & Utilities Extraction Summary

Extracted Zustand store factory and utility functions from web app to meditation-core using TDD approach. Implemented storage abstraction with persist middleware, calculateStreak function, and mood value mappings. All 27 tests passing.

## What Was Built

### Zustand Store Factory (store.ts)
- `createMeditationStore(storage, storageKey)` factory function
- Uses Zustand persist middleware with `createJSONStorage`
- `addEntry` auto-generates id (crypto.randomUUID) and timestamp (Date.now)
- `setMeditating` toggles boolean state
- StateStorage injection enables platform-specific persistence
- 8/8 tests passing (store creation, persistence, hydration)

### Utility Functions (utilities.ts)
- `calculateStreak(entries)` - counts consecutive meditation days
  - Loops backwards from today up to 365 days
  - Breaks on first missing day
  - Handles multiple entries per day (counts as 1)
- `preMoodToValue` - maps pre-moods to numeric values (1-3 scale)
- `postMoodToValue` - maps post-moods to numeric values (4-5 scale)
- Uses date-fns for date calculations (startOfDay, subDays)
- 8/8 tests passing (streak logic, mood mappings)

### Test Infrastructure
- Created `createMockStorage()` helper for testing
- In-memory StateStorage implementation
- Used by all store tests to avoid localStorage dependency
- Enables isolated, fast unit tests

### Package Exports
- Updated index.ts to export all store and utility functions
- Added types-first exports in package.json
- Removed duplicate mood mappings from types.ts
- All 27 tests passing (9 types + 8 store + 8 utilities + 2 index)
- TypeScript compilation succeeds with no errors

## Testing Results

**TDD Approach:**
- Task 1: RED (failing tests) → GREEN (implementation) → 8/8 passing
- Task 2: RED (failing tests) → GREEN (implementation) → 8/8 passing
- Task 3: Verification → 27/27 passing

**Coverage:**
- Store: Factory creation, state initialization, id/timestamp generation, persist middleware, hydration
- Utilities: Empty entries, consecutive days, missing days, multiple same-day entries, mood mappings
- Integration: Package exports, TypeScript compilation, workspace discovery

**Commands:**
```bash
pnpm --filter @repo/meditation-core test                    # 27/27 passing
pnpm --filter @repo/meditation-core exec tsc --noEmit        # No errors
pnpm list --filter @repo/meditation-core --depth=0          # Dependencies verified
```

## Key Decisions

### Store Factory Pattern (STORE-01)
**Decision:** Export factory function instead of pre-configured store

**Rationale:**
- Web app needs localStorage persistence
- Mobile app (Phase 3) needs MMKV persistence
- Same business logic, different storage implementations
- Factory pattern enables dependency injection without coupling

**Implementation:**
```typescript
export function createMeditationStore(
  storage: StateStorage,
  storageKey: string = 'meditation-entries'
) {
  return create<MeditationState>()(
    persist(
      (set) => ({ /* state and actions */ }),
      { name: storageKey, storage: createJSONStorage(() => storage) }
    )
  );
}
```

**Trade-offs:**
- Apps must create storage adapter and instantiate store
- Slightly more verbose than importing pre-configured store
- But: Eliminates platform-specific dependencies in core package
- But: Enables testing with mock storage

### Pure Functions for Calculations (UTILS-01)
**Decision:** Extract calculations to pure functions in utilities.ts

**Rationale:**
- Testable without DOM or React components
- No side effects, predictable output
- Shareable across web and mobile platforms
- date-fns already available (added in plan 02-01)

**Example:** calculateStreak logic extracted from Analytics.tsx lines 26-32

**Trade-offs:**
- More files to maintain (types, store, utilities separate)
- But: Better separation of concerns
- But: Tests run faster (no component mounting)
- But: Easier to debug and reason about

### TDD Approach (TDD-01)
**Decision:** Write tests before implementation (RED-GREEN-REFACTOR)

**Rationale:**
- Ensures complete test coverage from start
- Tests document expected behavior
- Catches bugs before they ship
- Prevents regressions during web app migration (Wave 3)

**Process:**
1. RED: Write failing tests → commit
2. GREEN: Implement minimal code to pass → commit
3. REFACTOR: Clean up (if needed) → commit

**Results:**
- 16 new tests written before implementation
- 100% pass rate after implementation
- Zero rework needed for test failures

## Requirements Satisfied

**MONO-05:** Zustand stores extracted to meditation-core
- ✅ createMeditationStore factory implemented
- ✅ Uses Zustand persist middleware
- ✅ StateStorage injection for cross-platform compatibility
- ✅ 8/8 store tests passing

**MONO-07:** Utility functions extracted to meditation-core
- ✅ calculateStreak counts consecutive meditation days
- ✅ preMoodToValue and postMoodToValue exported
- ✅ Uses date-fns for date calculations
- ✅ 8/8 utility tests passing

## Deviations from Plan

None - plan executed exactly as written. All tasks completed following TDD protocol.

## Next Steps

**Phase 02 Plan 03:** Web app migration
- Create web storage adapter wrapping localStorage
- Update web app to import from meditation-core
- Remove old meditation-store.ts (deprecate with comment)
- Verify full meditation flow works
- Update Analytics component to use calculateStreak

**Phase 03:** Mobile app setup
- Create MMKV storage adapter for React Native
- Use same createMeditationStore factory
- Share all types, utilities, and store logic

## Files Modified

**Created (5 files):**
- packages/meditation-core/src/store.ts
- packages/meditation-core/src/utilities.ts
- packages/meditation-core/src/__tests__/store.test.ts
- packages/meditation-core/src/__tests__/utilities.test.ts
- packages/meditation-core/src/__tests__/helpers/mock-storage.ts

**Modified (4 files):**
- packages/meditation-core/src/index.ts (added store and utilities exports)
- packages/meditation-core/src/types.ts (removed duplicate mood mappings)
- packages/meditation-core/package.json (added zustand, updated exports)
- pnpm-lock.yaml (zustand dependency)

## Commits

1. **3a66cae** - test(02-02): add failing tests for utilities and mock storage
   - Mock StateStorage helper
   - 8 test cases for calculateStreak and mood mappings
   - RED phase (tests fail)

2. **0375be8** - feat(02-02): implement calculateStreak and mood value mappings
   - Uses date-fns (startOfDay, subDays)
   - preMoodToValue and postMoodToValue mappings
   - GREEN phase (8/8 tests passing)

3. **bbdc319** - test(02-02): add failing tests for store factory
   - 8 test cases covering store creation, persistence, hydration
   - RED phase (tests fail)

4. **45bd13f** - feat(02-02): implement createMeditationStore with Zustand persist
   - Added zustand@^5.0.11 dependency
   - Store factory with StateStorage injection
   - Uses persist middleware with createJSONStorage
   - GREEN phase (8/8 tests passing)

5. **fe46877** - chore(02-02): update meditation-core exports and verify package
   - Export store and utilities from index.ts
   - Remove duplicate mood mappings from types.ts
   - Update package.json exports (types first)
   - 27/27 tests passing, TypeScript compiles

## Self-Check: PASSED

**Created files verification:**
```
✅ packages/meditation-core/src/store.ts
✅ packages/meditation-core/src/utilities.ts
✅ packages/meditation-core/src/__tests__/store.test.ts
✅ packages/meditation-core/src/__tests__/utilities.test.ts
✅ packages/meditation-core/src/__tests__/helpers/mock-storage.ts
```

**Commits verification:**
```
✅ 3a66cae (Task 1 RED: utilities tests)
✅ 0375be8 (Task 1 GREEN: utilities implementation)
✅ bbdc319 (Task 2 RED: store tests)
✅ 45bd13f (Task 2 GREEN: store implementation)
✅ fe46877 (Task 3: exports and verification)
```

**Test results:**
```
✅ meditation-core: 27/27 tests passing
✅ TypeScript compilation: No errors
✅ Workspace discovery: zustand@5.0.11, date-fns@4.1.0 resolved
```

**Dependency verification:**
```
✅ zustand@5.0.11 added to meditation-core
✅ pnpm-lock.yaml updated
✅ All workspace links functioning
```
