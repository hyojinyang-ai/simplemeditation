---
phase: 03
slug: mobile-app-scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
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
| 03-01-01 | 01 | 0 | APP-01 | setup | `test -d apps/mobile && expo --version` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | APP-01 | integration | `pnpm --filter meditation-mobile test` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | APP-02 | integration | `pnpm --filter meditation-mobile test` | ✅ (from 01) | ⬜ pending |
| 03-03-01 | 03 | 1 | APP-03 | unit | `pnpm --filter meditation-mobile test` | ✅ (from 01) | ⬜ pending |
| 03-04-01 | 04 | 2 | APP-04, APP-05 | unit | `pnpm --filter meditation-mobile test` | ✅ (from 01) | ⬜ pending |
| 03-05-01 | 05 | 2 | APP-06, APP-07 | unit | `pnpm --filter meditation-mobile test` | ✅ (from 01) | ⬜ pending |
| 03-06-01 | 06 | 3 | APP-08 | e2e | manual iOS Simulator launch | N/A (manual) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/mobile/jest.config.js` — Jest configuration with jest-expo preset
- [ ] `apps/mobile/__tests__/setup.test.ts` — Verify app renders without crashes
- [ ] `apps/mobile/__tests__/navigation.test.ts` — Verify tab navigation exists
- [ ] `apps/mobile/__tests__/storage-adapter.test.ts` — Verify MMKV storage adapter
- [ ] `apps/mobile/__tests__/meditation-core-import.test.ts` — Verify meditation-core imports

Wave 0 creates Jest infrastructure and 5 test files before implementation tasks.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App launches without crashes | APP-08 | Requires iOS Simulator | Run `npx expo run:ios`, observe app launches and displays navigation shell |
| Tab navigation renders correctly | APP-02 | Visual verification | Tap each tab (index, tracker, analytics, settings), verify screens render |
| Meditation entry persists after restart | APP-07 | State persistence across app lifecycle | Create test entry, force quit app (Cmd+Q in Simulator), relaunch, verify entry exists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
