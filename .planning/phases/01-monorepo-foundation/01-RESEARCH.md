# Phase 1: Monorepo Foundation - Research

**Researched:** 2026-03-12
**Domain:** JavaScript monorepo tooling (Turborepo + pnpm)
**Confidence:** HIGH

## Summary

Phase 1 establishes a Turborepo monorepo with pnpm workspaces, moving the existing Vite/React web app to `apps/web/` and creating a foundational `meditation-core` TypeScript package in `packages/`. This is a structural foundation phase with no feature changes.

The standard 2026 approach uses **Turborepo 2.8+ with pnpm 10.28+**, organized with `apps/` (applications) and `packages/` (shared libraries) directories. Turborepo provides intelligent caching and task orchestration, while pnpm's strict isolation and efficient storage make it ideal for monorepos. The combination is well-documented and widely adopted for React-based monorepos.

**Primary recommendation:** Initialize Turborepo in the existing repository with `turbo` added as a dev dependency, create `pnpm-workspace.yaml` and `turbo.json` configurations, move the web app to `apps/web/` preserving all functionality, and scaffold `packages/meditation-core/` with TypeScript exports. Verify the web app runs unchanged on localhost:8080 before proceeding to Phase 2 extraction work.

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|-----------------|
| MONO-01 | Turborepo workspace structure created with apps/ and packages/ directories | Standard Turborepo structure uses apps/ for applications and packages/ for shared libraries. pnpm-workspace.yaml defines these with glob patterns `["apps/*", "packages/*"]` |
| MONO-02 | pnpm workspaces configured with proper dependency management | pnpm-workspace.yaml + `workspace:*` protocol for internal packages ensures proper linking and prevents accidental registry installations |
| MONO-03 | Existing web app moved to apps/web/ and builds successfully | Vite apps work in Turborepo with minimal config changes. Path aliases and port configuration preserved in vite.config.ts |
| MONO-04 | meditation-core package created in packages/ with TypeScript exports | Internal packages use `exports` field in package.json to define entry points. TypeScript configuration extends shared base config from @repo/typescript-config pattern |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Turborepo | 2.8+ | Monorepo build system with caching | Industry standard in 2026, excellent pnpm integration, fastest caching, official Vercel tooling |
| pnpm | 10.28+ | Fast package manager with workspaces | Strict isolation prevents phantom dependencies, symlink-based storage saves disk space, fastest install times for monorepos |
| TypeScript | 5.0+ | Type-safe shared packages | Required for shared library type checking, modern exports field support |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @repo/typescript-config | Internal | Shared TypeScript configurations | Create as internal package for base.json, react.json configs that all packages extend |
| Vite | 5.4+ (existing) | Build tool for web app | Already in use, works seamlessly in monorepo with per-package vite.config.ts |
| Vitest | 3.2+ (existing) | Testing framework | Already configured, can be extended with shared config package later |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Turborepo | Nx | Nx has more features (generators, affected detection) but adds complexity. Turborepo is simpler for this use case |
| Turborepo | pnpm workspaces only | No caching or task orchestration. Loses 60-80% CI time savings |
| pnpm | npm/yarn | pnpm's strict isolation catches dependency issues early, saves disk space. Migration cost is low |

**Installation:**
```bash
# Install pnpm globally (if not present)
npm install -g pnpm@10.28.0

# Add Turborepo to existing repository
pnpm add turbo --save-dev --ignore-workspace-root-check

# Remove old npm artifacts (if migrating from npm)
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules packages/*/node_modules  # After restructuring

# Install with pnpm
pnpm install
```

## Architecture Patterns

### Recommended Project Structure

```
SimpleMeditation/
├── apps/
│   └── web/                    # Existing React app moved here
│       ├── src/
│       ├── public/
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json       # Extends @repo/typescript-config/react.json
│       ├── vitest.config.ts
│       └── package.json        # Has dependency on @repo/meditation-core
├── packages/
│   ├── meditation-core/        # NEW: Shared TypeScript package
│   │   ├── src/
│   │   │   └── index.ts        # Placeholder export for Phase 1
│   │   ├── tsconfig.json       # Extends @repo/typescript-config/base.json
│   │   └── package.json        # exports field defines entry points
│   └── typescript-config/      # NEW: Shared TS configs
│       ├── base.json
│       ├── react.json
│       └── package.json
├── .planning/                  # Existing planning docs (unchanged)
├── pnpm-workspace.yaml         # NEW: Defines workspace packages
├── turbo.json                  # NEW: Defines tasks and caching
├── package.json                # Root: has "packageManager" field
├── .gitignore                  # Updated: add .turbo
└── README.md
```

### Pattern 1: pnpm Workspace Configuration

**What:** Define workspace packages using glob patterns in `pnpm-workspace.yaml`
**When to use:** Required for all pnpm monorepos

**Example:**
```yaml
# Source: https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
packages:
  - "apps/*"
  - "packages/*"
```

**IMPORTANT:** Turborepo does NOT support nested patterns like `apps/**` or `packages/**`. Each workspace package must be a direct child of apps/ or packages/.

### Pattern 2: Internal Package References

**What:** Use `workspace:*` protocol to reference local packages
**When to use:** All internal dependencies between workspace packages

**Example:**
```json
// apps/web/package.json
{
  "name": "@repo/web",
  "dependencies": {
    "@repo/meditation-core": "workspace:*"
  }
}
```

**Why:** pnpm will refuse to resolve to anything other than a local workspace package, preventing accidental registry installations. Before publishing (not applicable here), workspace references auto-convert to actual versions.

### Pattern 3: Package Exports Field

**What:** Define entry points using `exports` field instead of `main`
**When to use:** All internal packages in packages/ directory

**Example:**
```json
// Source: https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
// packages/meditation-core/package.json
{
  "name": "@repo/meditation-core",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.8.3"
  }
}
```

**Why:** Better IDE autocomplete, avoids barrel file performance issues, eliminates `../` relative imports. Apps import directly: `import { something } from "@repo/meditation-core"`

### Pattern 4: Turborepo Task Configuration

**What:** Define tasks in `turbo.json` with dependencies and caching
**When to use:** All npm scripts that should be cached or orchestrated

**Example:**
```json
// Source: https://turborepo.dev/docs/crafting-your-repository/configuring-tasks
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

**Key syntax:**
- `^taskName`: Run this task in ALL dependency packages first (dependency graph)
- `taskName`: Run this task in the same package first
- `outputs`: Files to cache (required for caching to work)
- `cache: false`: Don't cache (use for dev servers)
- `persistent: true`: Long-running process (dev servers, watchers)

### Pattern 5: Shared TypeScript Configuration

**What:** Centralized tsconfig files that packages extend
**When to use:** All TypeScript packages to ensure consistency

**Example:**
```json
// Source: https://turborepo.dev/docs/guides/tools/typescript
// packages/typescript-config/base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "incremental": true
  }
}

// packages/typescript-config/react.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}

// apps/web/tsconfig.json
{
  "extends": "@repo/typescript-config/react.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**IMPORTANT:** Turborepo recommends AGAINST TypeScript Project References. Each package should have its own tsconfig.json for better caching. No root tsconfig.json needed.

### Pattern 6: Vite Configuration in Monorepo

**What:** Preserve Vite configuration in apps/web/vite.config.ts
**When to use:** Existing Vite apps moved to monorepo

**Example:**
```typescript
// Source: https://turborepo.dev/docs/guides/frameworks/vite
// apps/web/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,  // Preserve existing port
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Relative to apps/web/
    },
  },
});
```

**Why:** Each app in monorepo has its own vite.config.ts. Path aliases are package-relative. Port configuration preserved.

### Pattern 7: packageManager Field (Required)

**What:** Specify exact package manager version in root package.json
**When to use:** Required by Turborepo 2.0+

**Example:**
```json
// Source: https://turborepo.dev/docs/crafting-your-repository/upgrading
// Root package.json
{
  "name": "simple-meditation-monorepo",
  "private": true,
  "packageManager": "pnpm@10.28.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.8.0"
  }
}
```

**Why:** Turborepo uses this to validate package manager and improve stability. Also enables Corepack for version enforcement.

### Anti-Patterns to Avoid

- **Don't use nested glob patterns** (`apps/**` or `packages/**`) in pnpm-workspace.yaml - Turborepo doesn't support packages within packages
- **Don't move the .git directory** - Keep version control at monorepo root
- **Don't forget `workspace:*` protocol** - Using version numbers like `"1.0.0"` will install from npm registry instead of linking locally
- **Don't define outputs as empty array** - Without outputs defined, Turborepo will not cache any files
- **Don't use TypeScript Project References** - Turborepo doesn't recommend them; adds complexity with little benefit
- **Don't use relative imports between packages** - Use package names with exports field instead of `../../packages/core/src/file.ts`
- **Don't migrate everything at once** - Incremental migration prevents disaster; move web app first, add packages incrementally

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Monorepo task orchestration | Custom bash scripts with find/grep to run builds | Turborepo with turbo.json | Turborepo handles dependency graphs, parallel execution, incremental caching, and task failure management. Cache hits can reduce CI time by 60-80%. Rolling your own misses edge cases like circular dependencies and cache invalidation. |
| Workspace linking | Manual symlinks or custom scripts | pnpm workspaces with workspace:* protocol | pnpm automatically creates correct symlinks, validates dependency graphs, prevents phantom dependencies with strict isolation, and handles peer dependencies correctly. Custom solutions break in subtle ways with peer dependencies. |
| Shared TypeScript configs | Copy-pasting tsconfig.json across packages | @repo/typescript-config package | Centralized config ensures consistency, enables updates in one place, supports package-specific overrides via extends. Copy-paste creates drift and maintenance burden. |
| Monorepo migration | Moving all files and dependencies at once | Incremental migration: web app first, then packages | All-at-once migration creates massive diff, makes rollback impossible, and hides issues until everything is broken. Incremental approach validates each step. |
| Package manager version enforcement | README instructions | packageManager field in package.json | Corepack uses this field to auto-install correct version. README instructions are ignored. packageManager field is now required by Turborepo 2.0+. |

**Key insight:** Monorepo tooling has mature, battle-tested solutions. The combination of Turborepo + pnpm is specifically optimized for the JavaScript ecosystem. Custom solutions miss critical edge cases: task dependency graphs with cycles, cache invalidation triggers, peer dependency resolution in workspaces, and parallel execution with proper cleanup. These tools have years of production hardening.

## Common Pitfalls

### Pitfall 1: Not Defining Outputs in turbo.json

**What goes wrong:** Tasks complete successfully but Turborepo never caches results. Re-running the same task rebuilds from scratch every time.

**Why it happens:** The `outputs` key in turbo.json defaults to empty array. Without explicitly defining output directories, Turborepo has nothing to cache.

**How to avoid:** For every task that produces files, explicitly define `outputs` array:
- Vite builds: `"outputs": ["dist/**"]`
- Next.js builds: `"outputs": [".next/**", "!.next/cache/**"]`
- TypeScript compilation: `"outputs": ["dist/**", "*.tsbuildinfo"]`
- Test coverage: `"outputs": ["coverage/**"]`

**Warning signs:** Cache hit rate below 85% in CI, build times not improving on repeat runs, `.turbo/cache` directory is empty or tiny.

### Pitfall 2: Path Alias Resolution After Moving to Monorepo

**What goes wrong:** Vite path alias `@/` stops working or points to wrong directory after moving web app to `apps/web/`. TypeScript can't resolve imports. Build fails with "Cannot find module '@/components/...'"

**Why it happens:** Path aliases in vite.config.ts and tsconfig.json are relative to the file location. After moving from root to `apps/web/`, the alias `@: path.resolve(__dirname, "./src")` now resolves to `apps/web/src` which is correct, but if you forgot to update it, it might resolve to old location.

**How to avoid:**
1. Keep path aliases relative to package directory using `__dirname`
2. In `apps/web/vite.config.ts`: `"@": path.resolve(__dirname, "./src")`
3. In `apps/web/tsconfig.json`: `"paths": { "@/*": ["./src/*"] }`
4. Test import resolution after move: `import { Button } from "@/components/ui/button"`

**Warning signs:** Build works locally but fails in CI, TypeScript errors about missing modules, Vite dev server crashes on startup.

### Pitfall 3: Forgetting workspace:* Protocol for Internal Packages

**What goes wrong:** You add `"@repo/meditation-core": "1.0.0"` to apps/web/package.json. `pnpm install` succeeds but tries to download from npm registry instead of linking local package. You get "404 Not Found" errors or it installs a completely different package.

**Why it happens:** Without `workspace:*` protocol, pnpm treats the dependency as external and tries to resolve from registry. The package doesn't exist on npm, so install fails or installs wrong package.

**How to avoid:** Always use `workspace:*` for internal packages:
```json
{
  "dependencies": {
    "@repo/meditation-core": "workspace:*"
  }
}
```

**Warning signs:** `pnpm install` tries to contact npm registry for internal packages, node_modules contains real directories instead of symlinks for internal packages, changes to internal package don't reflect in consuming app without reinstall.

### Pitfall 4: Port Conflicts in Monorepo Dev Mode

**What goes wrong:** You run `turbo dev` and multiple Vite apps try to bind to the same port (default 5173). One succeeds, others fail silently or crash. Or Vite auto-increments to next available port, breaking hardcoded URLs.

**Why it happens:** Vite's default port is 5173. In a monorepo with multiple Vite apps, they all try to use the same port when started in parallel.

**How to avoid:**
1. Explicitly set different ports in each app's vite.config.ts
2. Web app: `port: 8080` (existing port, preserve it)
3. Future mobile web preview: `port: 8081`
4. Use `strictPort: true` to fail fast instead of auto-incrementing

**Warning signs:** Dev server starts on unexpected port, "Address already in use" errors, need to check terminal to find which port was assigned.

### Pitfall 5: Migrating node_modules and Lockfile

**What goes wrong:** You create pnpm-workspace.yaml but keep package-lock.json and node_modules from npm. `pnpm install` creates new pnpm-lock.yaml but references get confused. Dependency resolution breaks in subtle ways.

**Why it happens:** Mixing package managers creates conflicting lockfiles and node_modules structures. npm uses flat hoisting, pnpm uses symlinks. They're incompatible.

**How to avoid:**
1. Remove ALL npm artifacts: `rm -rf node_modules package-lock.json`
2. Remove from all future workspace packages after restructuring
3. Run `pnpm install` clean
4. Commit `pnpm-lock.yaml`, never commit `package-lock.json` again

**Warning signs:** Both `package-lock.json` and `pnpm-lock.yaml` exist, phantom dependency errors (imports work but shouldn't), inconsistent behavior between developers.

### Pitfall 6: Import Cycles Between Packages

**What goes wrong:** Package A imports from Package B, which imports from Package A. Build fails with "Cannot access before initialization" or mysterious runtime errors. With 10+ packages, circular dependencies take 15-20 minutes to manually trace.

**Why it happens:** When extracting shared code in Phase 2, it's easy to create cycles: `apps/web` imports `@repo/meditation-core`, but core imports types from web. Or indirect cycle: `A → B → C → A`.

**How to avoid:**
1. Establish dependency direction: apps depend on packages, never reverse
2. Extract pure types to separate package (`@repo/types`) if needed
3. Use Turborepo's dependency graph validation (will catch cycles)
4. Never import from apps/ into packages/

**Warning signs:** Build order seems random, mysterious "used before initialization" errors, changing import order fixes issues, turbo build succeeds sometimes and fails others.

### Pitfall 7: Not Updating .gitignore for Turborepo

**What goes wrong:** `.turbo/` cache directory gets committed to git. Repository size balloons. Developers have cache conflicts between local and pulled changes. Cache becomes useless.

**Why it happens:** Turborepo creates `.turbo/cache/` for storing task outputs. This directory can grow to hundreds of MB. Without .gitignore update, it gets tracked by git.

**How to avoid:** Add to root .gitignore:
```
# Turborepo
.turbo
```

**Warning signs:** Massive git diffs with binary files, .turbo/ directory shows up in `git status`, pull conflicts in .turbo/ directory.

### Pitfall 8: Assuming Global TypeScript Version

**What goes wrong:** You have TypeScript 5.8 in packages but your editor uses system-wide TypeScript 4.9. Editor shows errors that don't appear in CLI builds. Or vice versa: CLI fails but editor is happy.

**Why it happens:** VSCode and other editors discover and use a single TypeScript version globally (tsserver), not the package.json version. This creates discrepancy between editor feedback and `turbo check-types` output.

**How to avoid:**
1. Use VSCode workspace settings to specify TypeScript version
2. Add `.vscode/settings.json`: `{ "typescript.tsdk": "node_modules/typescript/lib" }`
3. Install TypeScript as devDependency in root AND each package
4. Trust CLI output over editor (CI uses CLI)

**Warning signs:** Editor errors don't match CLI output, teammates see different TypeScript errors, CI fails but local editor is clean.

## Code Examples

Verified patterns from official sources:

### Minimal turbo.json for Phase 1

```json
// Source: https://turborepo.dev/docs/reference/configuration
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### pnpm-workspace.yaml

```yaml
# Source: https://github.com/vercel/turborepo/blob/main/examples/basic/pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Root package.json

```json
{
  "name": "simple-meditation-monorepo",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@10.28.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.8.0"
  }
}
```

### Internal Package package.json (meditation-core)

```json
// Source: https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package
{
  "name": "@repo/meditation-core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src/",
    "test": "vitest run"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.8.3"
  }
}
```

### TypeScript Config Package

```json
// packages/typescript-config/package.json
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./base.json": "./base.json",
    "./react.json": "./react.json"
  }
}
```

### Migrating Web App package.json

```json
// apps/web/package.json (updated from root package.json)
{
  "name": "@repo/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@repo/meditation-core": "workspace:*",
    // ... all existing dependencies copied from root
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    // ... all existing devDependencies copied from root
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lerna for monorepo management | Turborepo or Nx | 2022-2023 | Lerna entered maintenance mode. Turborepo acquired by Vercel, became industry standard for simpler monorepos. Nx dominates complex enterprise setups. |
| npm/yarn workspaces only | pnpm workspaces + Turborepo | 2023-2025 | pnpm's strict isolation catches dependency issues early. Turborepo adds caching (60-80% CI time savings). Combined approach is 2026 recommendation. |
| TypeScript Project References | Separate tsconfig per package without references | 2024-2025 | Turborepo documented "You might not need TypeScript project references" in late 2024. Project references add caching layer that conflicts with Turborepo's caching. Simpler approach: each package has own tsconfig extending shared base. |
| `main` field in package.json | `exports` field with subpath exports | 2023-2024 | exports field provides better IDE autocomplete, explicit entry points, tree-shaking support. TypeScript 5.0+ required for proper support. Now standard for internal packages. |
| Relative imports between packages | Package name imports with exports | 2023-2024 | Relative imports (`../../../packages/core/src/utils`) break refactoring, hide dependencies. Package imports (`@repo/core/utils`) make dependencies explicit, work with bundler optimizations. |
| packageManager field optional | Required by Turborepo 2.0+ | 2024-2025 | Turborepo 2.0 made this field required for stability and predictability. Corepack uses it to enforce version. |
| Vitest workspaces | Vitest projects | 2024-2025 | workspaces deprecated in favor of projects feature. Projects enable merged coverage reports, better monorepo support. |
| turbo.pipeline | turbo.tasks | Turborepo 2.0 (2024) | pipeline renamed to tasks in v2. Same functionality, clearer naming. |

**Deprecated/outdated:**
- Lerna: Still works but in maintenance mode, no new features since 2022
- yarn 1.x workspaces: Use yarn 3+ berry or switch to pnpm
- npm workspaces: Works but slower than pnpm, lacks strict isolation
- TypeScript project references in Turborepo: Official docs recommend against as of late 2024

## Open Questions

1. **Should we use Turborepo remote caching?**
   - What we know: Vercel offers free remote caching for open source, paid for commercial. Enables cache sharing across team and CI.
   - What's unclear: Whether single developer setup benefits. Phase 7 CI setup might benefit.
   - Recommendation: Skip for Phase 1. Revisit in Phase 7 when setting up EAS Build CI. Local caching sufficient for now.

2. **Should meditation-core have a build step in Phase 1?**
   - What we know: Turborepo recommends using tsc for internal packages. But can also use "Just-in-Time packages" that are transpiled by consuming app (no build step).
   - What's unclear: Whether JIT approach works well for shared packages that might be used by both web and mobile.
   - Recommendation: Start with JIT (no build step) in Phase 1. The package is just a placeholder. Add build step in Phase 2 when extracting real code.

3. **Should we create @repo/vitest-config in Phase 1?**
   - What we know: Shared test config package follows same pattern as typescript-config. Vitest deprecated workspaces in favor of projects.
   - What's unclear: Whether shared test config is needed before Phase 2 extractions.
   - Recommendation: Defer to Phase 2. Phase 1 only needs web app tests working in new location.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 (existing) |
| Config file | `apps/web/vitest.config.ts` (moved from root) |
| Quick run command | `turbo test --filter=@repo/web` |
| Full suite command | `turbo test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MONO-01 | Turborepo workspace structure exists with apps/ and packages/ directories | manual | Verify with `ls -la` | N/A |
| MONO-02 | pnpm workspaces configured and dependencies install successfully | manual | `pnpm install` succeeds without errors | N/A |
| MONO-03 | Web app moved to apps/web/ and builds without errors | integration | `turbo build --filter=@repo/web` | ✅ existing tests in src/test/ |
| MONO-04 | meditation-core package scaffold exists with TypeScript configuration | manual | `turbo build --filter=@repo/meditation-core` (or JIT, no build) | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `turbo test --filter=@repo/web` (web app tests only, < 10 seconds)
- **Per wave merge:** `turbo test` (all packages, < 30 seconds initially)
- **Phase gate:** Full suite green + manual verification of web app on localhost:8080

### Wave 0 Gaps

- [ ] `packages/meditation-core/src/index.test.ts` — placeholder test to verify package setup
- [ ] No additional framework installation needed — Vitest already configured

## Sources

### Primary (HIGH confidence)

- [Turborepo Documentation - Configuring turbo.json](https://turborepo.dev/docs/reference/configuration) - Complete turbo.json schema and options
- [Turborepo Documentation - Structuring a repository](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository) - Official structure with apps/ and packages/
- [Turborepo Documentation - Configuring tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks) - Task dependency patterns and outputs
- [Turborepo Documentation - TypeScript](https://turborepo.dev/docs/guides/tools/typescript) - TypeScript configuration best practices
- [Turborepo Documentation - Vite](https://turborepo.dev/docs/guides/frameworks/vite) - Vite integration guide
- [pnpm Workspaces Documentation](https://pnpm.io/workspaces) - Official pnpm workspace configuration
- [Turborepo GitHub - Basic Example pnpm-workspace.yaml](https://github.com/vercel/turborepo/blob/main/examples/basic/pnpm-workspace.yaml) - Reference example

### Secondary (MEDIUM confidence)

- [Turborepo Releases](https://github.com/vercel/turborepo/releases) - Latest version 2.8.16, verified current
- [Turborepo 2.7 Release Notes](https://turborepo.dev/blog/turbo-2-7) - Recent features (devtools, composable config)
- [Setting Up a Scalable Monorepo With Turborepo and PNPM](https://dev.to/hexshift/setting-up-a-scalable-monorepo-with-turborepo-and-pnpm-4doh) - Community best practices
- [How we configured pnpm and Turborepo for our monorepo | Nhost](https://nhost.io/blog/how-we-configured-pnpm-and-turborepo-for-our-monorepo) - Real-world production setup
- [The Real-World Monorepo Guide: What They Don't Tell You](https://medium.com/simform-engineering/the-real-world-monorepo-guide-what-they-dont-tell-you-b03e68ffe579) - Common pitfalls from production experience
- [Monorepo Tools 2026: Turborepo vs Nx vs Lerna vs pnpm Workspaces Compared](https://viadreams.cc/en/blog/monorepo-tools-2026/) - Current tool landscape

### Tertiary (LOW confidence)

- [Monorepo with Turborepo: Enterprise Code Management Guide 2026](https://www.askantech.com/monorepo-with-turborepo-enterprise-code-management-guide-2026/) - General guidance, not verified against official docs
- [Turborepo + Vite with React Monorepo (Part 1)](https://dev.to/ashishxcode/turborepo-vite-with-react-monorepo-part-1-3f15) - Community tutorial, useful patterns but not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Turborepo and pnpm documentation verified directly, version numbers from official releases
- Architecture: HIGH - All patterns sourced from official Turborepo docs and verified GitHub examples
- Pitfalls: MEDIUM-HIGH - Combination of official docs (outputs, path aliases) and verified community reports (cycles, cache issues)

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (30 days - stable ecosystem, Turborepo 2.x is mature)
