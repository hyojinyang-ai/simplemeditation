---
phase: 1
slug: monorepo-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing — apps/web/) |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter web test` |
| **Full suite command** | `pnpm --filter web test:run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web test:run`
- **After every plan wave:** Run `pnpm --filter web test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Note: This will be populated by the planner when creating PLAN.md files*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- ✅ Vitest already configured in `apps/web/vitest.config.ts`
- ✅ Test files exist in `src/test/`
- ✅ All web app tests will continue to pass after monorepo migration

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Web app runs on localhost:8080 | MONO-04 | Development server requires manual inspection | Run `pnpm --filter web dev` and verify app loads at http://localhost:8080 with all features working |
| Turborepo caching works | MONO-01 | Cache behavior requires multiple builds | Run `pnpm build` twice and verify second build shows "cache hit" for web app |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
