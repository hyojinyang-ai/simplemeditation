# Coding Conventions

**Analysis Date:** 2026-03-12

## Naming Patterns

**Files:**
- Component files: PascalCase with `.tsx` extension
  - Example: `MeditationPlayer.tsx`, `MoodCheck.tsx`, `SoundPicker.tsx`
- Hook files: kebab-case with `use-` prefix and `.ts` extension
  - Example: `use-mobile.tsx`, `use-pull-to-refresh.ts`, `use-toast.ts`
- Library/utility files: kebab-case with `.ts` extension
  - Example: `meditation-store.ts`, `ambient-engine.ts`, `analytics.ts`
- Page files: PascalCase with `.tsx` extension in `src/pages/`
  - Example: `Index.tsx`, `TrackerPage.tsx`, `AnalyticsPage.tsx`, `SettingsPage.tsx`
- shadcn/ui component files: kebab-case with `.tsx` extension in `src/components/ui/`
  - Example: `alert-dialog.tsx`, `checkbox.tsx`, `input-otp.tsx`

**Functions:**
- React components: PascalCase
  - Example: `MeditationPlayer`, `MoodCheck`, `SessionPicker`
- Custom hooks: camelCase with `use` prefix
  - Example: `usePullToRefresh`, `useMeditationStore`
- Utility functions: camelCase
  - Example: `trackPageView`, `resolveSound`, `getRandomQuote`, `cn`
- Event handlers: camelCase with verb prefix matching action
  - Example: `handleMoodSelect`, `handleSessionSelect`, `handleSoundSelect`, `handleMeditationComplete`

**Variables:**
- State variables: camelCase
  - Example: `step`, `preMood`, `postMood`, `minutes`, `sound`, `isHome`
- Refs: camelCase with `Ref` suffix
  - Example: `containerRef`, `intervalRef`, `videoRef`, `sessionStartTracked`
- Configuration objects: camelCase with descriptive suffix
  - Example: `preMoodConfig`, `postMoodConfig`, `soundConfig`, `stoicQuotes`
- Constants: UPPER_SNAKE_CASE (when global/module-level)
  - Example: `SOUND_FILES`, `DRONE_NOTES`, `BREATH_PHASES`, `TOTAL_CYCLE`

**Types:**
- Type definitions: PascalCase
  - Example: `PreMood`, `PostMood`, `SoundType`, `MoodEntry`, `Step`
- Generic types: PascalCase
  - Example: `MeditationPlayerProps`, `SessionPickerProps`, `MoodCheckProps`
- Union types: PascalCase with descriptive names
  - Example: `PreMood = 'stressed' | 'tired' | 'neutral' | 'anxious'`
- Record types: `Record<KeyType, ValueType>`
  - Example: `Record<PreMood, { icon: typeof Frown; label: string; color: string }>`

## Code Style

**Formatting:**
- ESLint configuration: `eslint.config.js` with TypeScript support
- Key settings:
  - ECMAScript 2020 target
  - Browser globals enabled
  - React hooks rules enforced
  - React refresh warnings for non-component exports

**Linting Rules:**
- Tool: ESLint with TypeScript ESLint
- Plugins active:
  - `react-hooks` - enforces rules of hooks
  - `react-refresh` - warns when exporting non-components in files with hooks
- Key rules:
  - `@typescript-eslint/no-unused-vars` - disabled (allows unused params)
  - `react-refresh/only-export-components` - warns with allowConstantExport enabled

**Code Patterns:**
- Prefer named exports in library files
  - Example: `export const useMeditationStore = create<MeditationState>(...)`
- Use default exports for page components
  - Example: `export default Index;`
- Arrow functions for functional components and callbacks
  - Example: `const MoodCheck = ({ onSelect, selected }: MoodCheckProps) => {...}`
- Function expressions for hooks
  - Example: `export function usePullToRefresh(onRefresh?: () => void) {...}`

## Import Organization

**Order:**
1. External React/framework imports
   - Example: `import { useState, useEffect } from 'react'`
2. External third-party libraries
   - Example: `import { motion, AnimatePresence } from 'framer-motion'`
3. Internal absolute imports using `@/` alias
   - Example: `import { useMeditationStore } from '@/lib/meditation-store'`
4. Internal relative imports (rarely used)
   - Avoid relative imports; use `@/` path alias instead

**Path Aliases:**
- `@/` maps to `src/` directory
- Used in all imports to avoid relative paths
- Configured in `vite.config.ts` and `vitest.config.ts`

**Example Import Groups:**
```typescript
// React and React libraries
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Animation and UI libraries
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle } from 'lucide-react';

// Internal state and utilities
import { useMeditationStore, PreMood, SoundType } from '@/lib/meditation-store';
import { trackPageView } from '@/lib/analytics';

// Internal components
import MoodCheck from '@/components/MoodCheck';
```

## Error Handling

**Patterns:**
- Try-catch blocks for browser APIs and audio operations
  - Example: Used in `MeditationPlayer` for vibration API and Web Audio API
  - Silent failures with empty catch blocks when graceful degradation acceptable
- Defensive checks for optional values
  - Example: `if (preMood && minutes)` before using values
- Runtime checks for browser feature support
  - Example: `if (navigator.vibrate)` before calling vibration API
- Empty catch blocks with comment explaining intent
  ```typescript
  try {
    // risky operation
  } catch {}  // Graceful fallback - feature not critical
  ```

**Audio Error Handling:**
- Audio playback wrapped in `.catch(() => {})` to handle browser autoplay restrictions
  - Example: `audio.play().catch(() => {})`
- AudioContext creation wrapped in try-catch
- Oscillator and audio node operations wrapped individually to prevent cascade failures

**Store Error Handling:**
- localStorage access wrapped in try-catch with fallback to empty array
  ```typescript
  const loadEntries = (): MoodEntry[] => {
    try {
      const stored = localStorage.getItem('zen-mood-entries-v2');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };
  ```

## Logging

**Framework:**
- Console logging (no dedicated logging library)
- Development-only logging in analytics utility

**Patterns:**
- Development environment check using `import.meta.env.DEV`
  - Example: `if (import.meta.env.DEV) { console.log(...) }`
- Console output for analytics events with emoji prefix
  - Example: `console.log('📊 Analytics Event: ${eventName}', data);`
- Informational messages for user-facing events (mood selection, session start, etc.)
- No production logging to console

**Analytics Logging:**
- Centralized via `src/lib/analytics.ts`
- Both console and Vercel Analytics tracking
- Structured event data with descriptive property names
  - Example: `{ duration_minutes: 5, sound_type: 'singing-bowl', pre_mood: 'stressed' }`

## Comments

**When to Comment:**
- Function purposes documented via JSDoc-style comments (when applicable)
- Complex logic steps explained inline
- Non-obvious algorithmic choices explained
- Browser compatibility workarounds noted

**JSDoc/TypeScript Comments:**
- Used minimally - types provide documentation
- Comments for utility functions and public exports
- Example from `analytics.ts`:
  ```typescript
  /**
   * Analytics utility for tracking user engagement in SimpleMeditation app
   * Uses Vercel Analytics custom events
   */
  ```
- Inline comments for complex calculations
  - Example: `const TOTAL_CYCLE = BREATH_PHASES.reduce((s, p) => s + p.duration, 0); // 12s`
  - Example: `// Fade in ambient sound`, `// Start meditation drone layer`

**Commenting Style:**
- Comments match code intent, not literal code action
- Comments explain "why", not "what"
- Use `//` for inline comments
- Use descriptive labels in code blocks
  - Example: `{/* Decorative video element */}`
  - Example: `{/* Ambient floating visuals behind the player */}`

## Function Design

**Size:**
- Small, focused functions
- React components typically 100-500 lines including JSX
- Utility functions typically < 50 lines
- Complex components (like `MeditationPlayer`) split into multiple effects for clarity

**Parameters:**
- Use object destructuring for props
  - Example: `({ onSelect, selected }: MoodCheckProps) => {...}`
- Optional parameters marked with `?`
  - Example: `autoPlay?: boolean`, `postMood?: string`
- Default values in destructuring
  - Example: `({ autoPlay = false }: MeditationPlayerProps) => {...}`

**Return Values:**
- Components return JSX/React elements
- Hooks return state, refs, or callback functions
- Utility functions return typed values (strings, numbers, objects)
- Analytics functions return void (side effects only)
- Error handlers gracefully handle missing returns

## Module Design

**Exports:**
- Named exports for utility functions and hooks
  - Example: `export const trackPageView = (...) => {...}`
- Default exports for React components and pages
  - Example: `export default MoodCheck;`
- Type exports alongside implementations
  - Example: `export type PreMood = '...' | '...'`

**Barrel Files:**
- Not used - imports are specific to needed exports
- Each component exports itself individually
- No index.ts barrel files in codebase

**Module Structure:**
- Lib modules are singleton utilities
  - `meditation-store.ts` - Zustand store created once
  - `ambient-engine.ts` - Singleton audio engine instance
  - `analytics.ts` - Pure utility functions
- Components are stateless or consume stores
- Pages are composition endpoints that wire together components

## Class Design

**Patterns:**
- Classes used sparingly (only in audio engine)
- `MeditationDrone` class in `ambient-engine.ts`
  - Private properties with `private` keyword
  - Public methods for interface (`start`, `stop`, `setVolume`)
  - Encapsulates Web Audio API complexity
- `AmbientEngine` class
  - Wraps audio playback and meditation drone together
  - Manages lifecycle (fade in/out)
  - Exported as singleton instance: `export const ambientEngine = new AmbientEngine()`

**Private Properties:**
- Named with `_` prefix (older convention) or `private` keyword
  - Example: `private _soundVolume = 0.7`
  - Example: `private ctx: AudioContext | null = null`

---

*Convention analysis: 2026-03-12*
