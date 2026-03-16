---
phase: 03
slug: mobile-app-scaffold
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
updated: 2026-03-16
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x with jest-expo preset |
| **Config file** | apps/mobile/jest.config.js (Wave 0 creates) |
| **Quick run command** | `pnpm --filter meditation-mobile test` |
| **Full suite command** | `pnpm --filter meditation-mobile test` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter meditation-mobile test`
- **After every plan wave:** Run `pnpm --filter meditation-mobile test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-02-01 | 02 | 0 | APP-03, APP-04, APP-05 | setup | `cd apps/mobile && npm test -- --version` | ✅ W0 | ⬜ pending |
| 03-02-02 | 02 | 0 | APP-03, APP-04 | unit | `cd apps/mobile && npm test -- --testPathPattern="TabLayout\|Paper"` | ✅ W0 | ⬜ pending |
| 03-02-03 | 02 | 0 | APP-05, APP-06, APP-07 | unit | `cd apps/mobile && npm test -- --testPathPattern="storage\|persistence\|integration"` | ✅ W0 | ⬜ pending |
| 03-01-01 | 01 | 1 | APP-01 | setup | `ls apps/mobile/app.json && cat apps/mobile/package.json \| grep '@repo/meditation-core'` | ❌ W1 | ⬜ pending |
| 03-01-02 | 01 | 1 | APP-02 | integration | `grep -c "Tabs.Screen" apps/mobile/app/(tabs)/_layout.tsx` | ❌ W1 | ⬜ pending |
| 03-01-03 | 01 | 1 | APP-03, APP-04 | integration | `grep "PaperProvider" apps/mobile/app/_layout.tsx && grep "SafeAreaProvider" apps/mobile/app/_layout.tsx` | ❌ W1 | ⬜ pending |
| 03-01-04 | 01 | 1 | APP-04 | integration | `grep "from 'react-native-paper'" apps/mobile/app/(tabs)/index.tsx` | ❌ W1 | ⬜ pending |
| 03-03-01 | 03 | 2 | APP-06 | integration | `cat apps/mobile/lib/storage.ts \| grep "StateStorage"` | ❌ W2 | ⬜ pending |
| 03-03-02 | 03 | 2 | APP-07 | integration | `cat apps/mobile/lib/store.ts \| grep "createMeditationStore"` | ❌ W2 | ⬜ pending |
| 03-03-03 | 03 | 2 | APP-08 | integration | `grep "useMeditationStore" apps/mobile/app/(tabs)/index.tsx` | ❌ W2 | ⬜ pending |
| 03-03-04 | 03 | 2 | APP-08 | manual | Human verification (checkpoint) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 (Plan 03-02) creates test infrastructure before implementation:

- [x] `apps/mobile/jest.config.js` — Jest configuration with jest-expo preset
- [x] `apps/mobile/__tests__/TabLayout.test.tsx` — Verify 4 tabs render (APP-03)
- [x] `apps/mobile/__tests__/Paper.test.tsx` — Verify Paper components render (APP-04)
- [x] `apps/mobile/__tests__/store-integration.test.tsx` — Verify meditation-core imports (APP-05)
- [x] `apps/mobile/lib/__tests__/mmkv-storage.test.ts` — Verify MMKV storage adapter (APP-06)
- [x] `apps/mobile/lib/__tests__/store-persistence.test.ts` — Verify Zustand + MMKV integration (APP-07)

Wave 0 creates Jest infrastructure and 5 test files before Wave 1 implementation tasks.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App launches without crashes | APP-08 | Requires iOS Simulator | Run `npx expo run:ios`, observe app launches and displays navigation shell |
| Tab navigation renders correctly | APP-02 | Visual verification | Tap each tab (index, tracker, analytics, settings), verify screens render |
| Meditation entry persists after restart | APP-07 | State persistence across app lifecycle | Create test entry, force quit app (Cmd+Q in Simulator), relaunch, verify entry exists |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ compliant (revised 2026-03-16)
