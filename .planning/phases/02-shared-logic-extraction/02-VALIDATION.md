---
phase: 2
slug: shared-logic-extraction
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 (already configured in packages/meditation-core) |
| **Config file** | `packages/meditation-core/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @repo/meditation-core test` |
| **Full suite command** | `pnpm --filter @repo/meditation-core test && pnpm --filter web test` |
| **Estimated runtime** | ~5 seconds (meditation-core) + ~8 seconds (web app) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @repo/meditation-core test`
- **After every plan wave:** Run `pnpm --filter @repo/meditation-core test && pnpm --filter web test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | MONO-05 | unit | `pnpm --filter @repo/meditation-core test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | MONO-06 | unit | `pnpm --filter @repo/meditation-core test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | MONO-07 | unit | `pnpm --filter @repo/meditation-core test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | MONO-08 | unit | `pnpm --filter @repo/meditation-core test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | MONO-09 | integration | `pnpm --filter web test` | ✅ | ⬜ pending |
| TBD | TBD | TBD | MONO-10 | integration | `pnpm --filter web test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/meditation-core/src/__tests__/store.test.ts` — stubs for MONO-05 (Zustand store)
- [ ] `packages/meditation-core/src/__tests__/types.test.ts` — stubs for MONO-06 (TypeScript types)
- [ ] `packages/meditation-core/src/__tests__/utilities.test.ts` — stubs for MONO-07 (utilities: streak, mood calculations)
- [ ] `packages/meditation-core/src/__tests__/storage-adapter.test.ts` — stubs for MONO-08 (storage adapter interface)

*Web app tests already exist in `apps/web/src/test/` and cover MONO-09, MONO-10 (integration after web app migration).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full meditation flow unchanged | MONO-10 | End-to-end UX validation | 1. Start dev server `pnpm dev` 2. Select pre-mood 3. Start meditation with sound 4. Complete session 5. Select post-mood 6. Verify analytics updated 7. Verify mood entry in tracker |
| localStorage data preserved after migration | MONO-09 | Data migration safety | 1. Before migration: create test entries 2. After migration: verify entries still load 3. Verify 'zen-mood-entries-v2' key unchanged |

*Two manual verifications required for Phase 2: full UX validation and data preservation check.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (4 test files needed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
