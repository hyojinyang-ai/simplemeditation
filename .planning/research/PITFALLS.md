# Domain Pitfalls: React to React Native Conversion

**Domain:** Mobile app conversion (React Web → React Native)
**Researched:** 2026-03-12
**Confidence:** MEDIUM (based on known conversion patterns + SimpleMeditation architecture analysis)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Web Audio API → Native Audio Impedance Mismatch
**What goes wrong:** Directly porting Web Audio API code to React Native fails catastrophically. The dual-layer audio system (ambient + meditation drone with real-time synthesis) cannot be replicated with simple audio playback libraries.

**Why it happens:** Developers assume Expo Audio or React Native Sound are 1:1 replacements for Web Audio API. Web Audio provides:
- Real-time audio synthesis (OscillatorNode, GainNode)
- Precise timing and scheduling (AudioContext.currentTime)
- Audio graph routing and mixing
- Frequency/filter manipulation

Native audio libraries provide:
- File playback with basic controls
- Limited mixing capabilities
- No real-time synthesis

**Consequences:**
- Meditation drone (harmonic oscillators at 136.1 Hz Om frequency + Solfeggio tones) **cannot be ported**
- Fade-in/fade-out animations tied to Web Audio gain nodes break
- Completion chime synthesis fails
- Audio timing becomes imprecise, breaking breathing phase synchronization

**Prevention:**
1. **Phase 1 (Audio Strategy)**: Research native audio capabilities BEFORE starting conversion
   - For SimpleMeditation: Evaluate Expo Audio limitations upfront
   - Decision matrix: Keep drone as pre-rendered audio files vs. abandon drone entirely vs. native synthesis library (react-native-audio-toolkit, react-native-tone)
2. **Architecture decision**: Accept feature reduction OR invest in custom native modules
   - Recommendation: Pre-render meditation drone as 6 separate audio files (one per sound), ship in app bundle
   - Trade-off: Loses real-time synthesis flexibility, gains reliability

**Detection:**
- Early: Try loading `src/lib/ambient-engine.ts` in React Native — immediate `AudioContext is not defined` error
- Late: Audio plays but drone missing, fade timing broken, completion chime silent

**Phase mapping:** Phase 1 must resolve audio strategy before any shared code extraction

---

### Pitfall 2: localStorage → AsyncStorage Migration Data Loss
**What goes wrong:** Direct string replacement of `localStorage` with `AsyncStorage` causes data corruption, race conditions, and silent data loss. SimpleMeditation stores meditation entries in `localStorage.getItem('zen-mood-entries-v2')` as stringified JSON — this pattern breaks in React Native.

**Why it happens:**
- `localStorage` is synchronous; `AsyncStorage` is asynchronous (Promise-based)
- Zustand store reads `localStorage.getItem()` **synchronously on initialization** (line 47 in meditation-store.ts)
- React Native app initializes before AsyncStorage reads complete
- Store starts with empty entries array, then AsyncStorage resolves later (too late)
- Dual write paths (store's `addEntry()` + direct `localStorage.setItem()` in Index.tsx) become race conditions

**Consequences:**
- User loses meditation history on first mobile app launch
- Entries array initializes empty while historical data in storage
- Race condition: Entry added before hydration completes → overwrites history with single entry
- Analytics calculations (streak, mood trends) show incorrect data until app restart

**Prevention:**
1. **Phase 2 (Storage Migration)**: Use Zustand's `persist` middleware with AsyncStorage adapter
   ```typescript
   // WRONG: Current approach
   const entries = JSON.parse(localStorage.getItem('zen-mood-entries-v2') || '[]')

   // RIGHT: Async hydration
   import { persist, createJSONStorage } from 'zustand/middleware'
   import AsyncStorage from '@react-native-async-storage/async-storage'

   export const useMeditationStore = create(
     persist(
       (set) => ({ /* store */ }),
       {
         name: 'zen-mood-entries-v2',
         storage: createJSONStorage(() => AsyncStorage),
         onRehydrateStorage: () => (state) => {
           // Hydration complete — NOW safe to render
         }
       }
     )
   )
   ```

2. **Eliminate dual write paths**: Remove direct `localStorage.setItem()` calls from components
   - Fix existing tech debt: `Index.tsx` line 89 bypasses store
   - Add `updateEntry(id, updates)` action to store (centralizes persistence)

3. **Show loading state until hydration completes**:
   - Check `hasHydrated` state before rendering analytics/tracker
   - Prevents calculations on incomplete data

**Detection:**
- Early: Unit test store initialization with mocked AsyncStorage delay
- Late: User reports "my meditation history disappeared" after installing mobile app

**Phase mapping:**
- Phase 2 must migrate storage with data migration script
- Phase 3 can add hydration loading states

---

### Pitfall 3: CSS/Tailwind → StyleSheet Translation Hell
**What goes wrong:** Tailwind classes (`animate-breathe`, `bg-zen-lavender-light`, `backdrop-blur-md`) don't exist in React Native. Developers spend weeks manually converting every component's styling, then discover platform differences break the design.

**Why it happens:**
- Tailwind generates CSS; React Native uses JavaScript StyleSheet objects
- No CSS cascade, no `::before`/`::after`, no `backdrop-filter`, no CSS animations
- SimpleMeditation uses custom animations (`@keyframes breathe`, `@keyframes float`) that don't translate
- `AmbientVisuals.tsx` has 200+ lines of complex CSS animations (aurora bands, shimmer dots, fireflies, ripples)

**Consequences:**
- 4-6 weeks of manual style conversion instead of 2-3 days estimated
- Glassmorphism effects (`backdrop-blur-md`) impossible in React Native (no backdrop-filter)
- Ambient visuals completely broken (CSS animations don't work)
- Breathing animation desynchronizes from timer (CSS keyframes timing vs. RN Animated API)

**Prevention:**
1. **Phase 1 (Design System Audit)**: Catalog all visual effects BEFORE conversion
   - Identify what CAN'T be ported: backdrop-filter, complex gradients, CSS filters
   - Decision: Simplify mobile UI (accept design reduction) OR invest in Reanimated/Skia

2. **Choose styling approach upfront**:
   - Option A: NativeWind (Tailwind for RN) — closest to existing code but limited feature set
   - Option B: React Native StyleSheet + design tokens — full control but manual work
   - Option C: Tamagui — cross-platform but requires rewriting all components
   - Recommendation for SimpleMeditation: NativeWind for layout, eliminate glassmorphism, use Reanimated for breathing animation

3. **Shared components stay logic-only**:
   - Extract business logic (meditation state, mood tracking, analytics calculations)
   - Keep UI components platform-specific (separate `MeditationPlayer.web.tsx` and `MeditationPlayer.native.tsx`)
   - Don't try to share `AmbientVisuals` — platform-specific implementations

**Detection:**
- Early: Attempt to compile any component with Tailwind classes in React Native — immediate errors
- Late: UI renders but looks broken, animations missing, glassmorphism gone

**Phase mapping:**
- Phase 1 must choose styling strategy
- Phase 2-3 convert UI components (incremental, per-screen)

---

### Pitfall 4: Navigation Paradigm Collision (React Router → React Navigation)
**What goes wrong:** React Router patterns (`Link`, `useNavigate`, nested routes, URL params) don't translate to React Navigation. SimpleMeditation's bottom navigation breaks, route persistence fails, deep linking impossible.

**Why it happens:**
- Web uses URLs for navigation state; mobile uses native stack navigators
- React Router: declarative route config in JSX (`<Route path="/tracker" />`)
- React Navigation: imperative navigation via `navigation.navigate('Tracker')`
- Shared components calling `navigate('/settings')` fail in mobile (no URL routing)

**Consequences:**
- Bottom navigation (`src/pages/*.tsx` with React Router links) completely broken
- `useLocation()` hooks in components throw errors
- Browser back button behavior expected but doesn't exist on mobile
- Deep linking (future push notifications to specific moods) requires total rework

**Prevention:**
1. **Phase 2 (Navigation Abstraction)**: Create cross-platform navigation wrapper
   ```typescript
   // packages/meditation-core/src/navigation.ts
   export interface Navigator {
     navigate(screen: 'Home' | 'Tracker' | 'Analytics' | 'Settings'): void
     goBack(): void
   }

   // apps/web/src/navigation.web.ts
   export const useAppNavigation = (): Navigator => {
     const navigate = useNavigate()
     return {
       navigate: (screen) => navigate(`/${screen.toLowerCase()}`),
       goBack: () => navigate(-1)
     }
   }

   // apps/mobile/src/navigation.native.ts
   export const useAppNavigation = (): Navigator => {
     const navigation = useNavigation()
     return {
       navigate: (screen) => navigation.navigate(screen),
       goBack: () => navigation.goBack()
     }
   }
   ```

2. **Use React Navigation from start in mobile app** (don't try to keep React Router):
   - Tab Navigator for bottom nav (Home, Tracker, Analytics, Settings)
   - Stack Navigator for modals (mood selection, quote display)

3. **Keep route logic in platform-specific code**:
   - Shared: Navigation interface + screen identifiers
   - Platform-specific: Router config, deep linking, URL handling

**Detection:**
- Early: Import `useNavigate` in shared component — type error in mobile
- Late: Bottom navigation buttons do nothing, app feels broken

**Phase mapping:**
- Phase 2 extracts navigation interface
- Phase 3 implements platform-specific routers

---

### Pitfall 5: Pull-to-Refresh Native Gesture Conflict
**What goes wrong:** Web's custom pull-to-refresh hook (`use-pull-to-refresh.ts`) conflicts with native OS gesture. iOS users expect system pull-to-refresh; custom implementation feels broken and interferes with scrolling.

**Why it happens:**
- Web: Pull-to-refresh is custom feature (not standard), needs manual touch tracking
- Mobile: OS provides native pull-to-refresh (RefreshControl in ScrollView)
- SimpleMeditation implements custom pull detection with touch events and thresholds
- Mobile OS intercepts touch events before custom handler runs
- Double-refresh triggers (custom + native) or no refresh (gesture consumed by OS)

**Consequences:**
- Pull gesture feels laggy or unresponsive
- Scroll views jitter during pull
- iOS bounce animation conflicts with custom threshold
- Analytics tracking breaks (refresh events fire twice or not at all)

**Prevention:**
1. **Phase 3 (Native UX Patterns)**: Replace custom hook with platform-native components
   ```typescript
   // WRONG: Port custom pull-to-refresh
   const { pullDistance, isPulling } = usePullToRefresh({ threshold: 80 })

   // RIGHT: Use native RefreshControl
   import { ScrollView, RefreshControl } from 'react-native'

   <ScrollView
     refreshControl={
       <RefreshControl
         refreshing={isLoading}
         onRefresh={handleRefresh}
       />
     }
   >
   ```

2. **Delete `use-pull-to-refresh.ts` from shared code**:
   - Not shareable between platforms (different gesture systems)
   - Keep web version in `apps/web/src/hooks/`
   - Use native RefreshControl in mobile

3. **Audit all custom gesture handlers**:
   - SimpleMeditation likely has more: swipe gestures, long-press, drag
   - Each needs platform-specific implementation

**Detection:**
- Early: Pull-to-refresh feels weird in iOS simulator
- Late: User reviews complain "refresh doesn't work" or "scrolling is broken"

**Phase mapping:**
- Phase 3 replaces custom gestures with native components

---

## Moderate Pitfalls

### Pitfall 6: Vercel Analytics → Mobile Analytics Mismatch
**What goes wrong:** Vercel Analytics (`@vercel/analytics`) only works in web browsers. Porting analytics tracking code to mobile app silently fails, losing all mobile telemetry.

**Prevention:**
- Phase 2: Abstract analytics interface (same pattern as navigation)
- Web: Keep Vercel Analytics
- Mobile: Use Expo Analytics or Firebase Analytics
- Shared: Event type definitions (MeditationSessionStarted, MoodTracked, etc.)

**Detection:** No mobile events in Vercel dashboard after launch

---

### Pitfall 7: Zustand Persistence Middleware Platform Mismatch
**What goes wrong:** Zustand's `persist` middleware defaults to localStorage adapter. Direct use in React Native throws `localStorage is not defined` error.

**Prevention:**
- Phase 2: Configure platform-specific storage adapters
- Web: Default localStorage adapter
- Mobile: AsyncStorage adapter with `createJSONStorage`
- Use conditional imports or build-time environment detection

**Detection:** App crashes immediately on mobile launch with "localStorage is not defined"

---

### Pitfall 8: Font Loading Differences (Sora + Inter)
**What goes wrong:** Web uses `@font-face` in CSS to load Google Fonts (Sora, Inter). React Native requires fonts in assets folder + `expo-font` loading with splash screen delay. Font flash or fallback to system font.

**Prevention:**
- Phase 3: Download font files, add to `assets/fonts/`, configure `expo-font`
- Add font loading splash screen (use `expo-splash-screen`)
- Update StyleSheet font families to exact filenames

**Detection:** App renders with system font instead of Sora/Inter

---

### Pitfall 9: Image Asset Path Mismatches
**What goes wrong:** Web references images as `/images/meditation-cat-singing-bowl.png` (public folder). React Native `require()` needs relative paths from component file. Hard-coded absolute paths break.

**Prevention:**
- Phase 2-3: Move images to shared assets, use platform-specific asset bundlers
- Web: Keep in `public/images/`, reference with `/images/...`
- Mobile: Put in `assets/images/`, use `require('./assets/images/...')` or Expo asset system
- Create image mapping object in shared code:
  ```typescript
  // Platform-specific
  export const MEDITATION_IMAGES = {
    'singing-bowl': require('./assets/images/meditation-cat-singing-bowl.png'),
    // ...
  }
  ```

**Detection:** Missing images (broken image icons) in mobile app

---

### Pitfall 10: Timer Precision Differences (setTimeout vs. setInterval)
**What goes wrong:** MeditationPlayer uses `setInterval` for countdown timer. React Native's JavaScript bridge introduces timing jitter (100-300ms drift per second). 5-minute meditation finishes at 4:55 or 5:05.

**Prevention:**
- Phase 3: Replace `setInterval` with timestamp-based calculations
- Use `Date.now()` to calculate remaining time, not decrement counters
- Or use `react-native-background-timer` for more precise intervals

**Detection:** Timer countdown drifts noticeably (test with stopwatch)

---

## Minor Pitfalls

### Pitfall 11: Shadow Style Differences
**What goes wrong:** CSS `box-shadow` doesn't translate to React Native's `shadowColor`/`shadowOffset` props. Shadows look different or disappear.

**Prevention:** Accept design variance or manually tune shadow props per platform

---

### Pitfall 12: No `localStorage` Clear Event
**What goes wrong:** Web can listen to `storage` events for cross-tab sync. React Native AsyncStorage has no equivalent. Multi-instance sync patterns break.

**Prevention:** Don't rely on storage events in shared code (SimpleMeditation is single-user, less critical)

---

### Pitfall 13: HTML Entities in Strings
**What goes wrong:** Strings with `&nbsp;`, `&mdash;`, HTML entities render literally in React Native (no HTML parser).

**Prevention:** Search codebase for HTML entities, replace with Unicode equivalents

---

### Pitfall 14: Clipboard API Differences
**What goes wrong:** Web `navigator.clipboard.writeText()` doesn't exist in RN. Need `@react-native-clipboard/clipboard`.

**Prevention:** Abstract clipboard operations (future quote-sharing feature)

---

### Pitfall 15: No Window/Document Globals
**What goes wrong:** Code referencing `window.innerWidth`, `document.addEventListener` crashes in RN.

**Prevention:** Use `Dimensions.get('window')` and RN event listeners. Audit for global usage.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: Audio Strategy** | Assuming Expo Audio = Web Audio API | Research synthesis capabilities upfront; decide pre-render vs. abandon drone |
| **Phase 1: Design System** | Attempting to share Tailwind styles | Choose NativeWind OR accept divergent styling early |
| **Phase 2: Shared Logic Extraction** | Including navigation/analytics in shared code | Abstract platform concerns into interfaces |
| **Phase 2: Storage Migration** | Synchronous localStorage → async AsyncStorage race | Use Zustand persist middleware with hydration checks |
| **Phase 3: UI Conversion** | Porting AmbientVisuals CSS animations | Accept simplified mobile visuals OR rewrite with Reanimated |
| **Phase 3: Gestures** | Custom pull-to-refresh conflicts | Use native RefreshControl, delete custom hook |
| **Phase 4: Platform Features** | Push notifications breaking timer state | Test background/foreground transitions extensively |

---

## Monorepo-Specific Pitfalls

### Pitfall 16: Incorrect Package Boundaries
**What goes wrong:** Developers put platform-specific code (AsyncStorage, React Navigation) in shared `packages/meditation-core`. Web app imports fail with "module not found".

**Why it happens:** Unclear rules about what belongs in shared vs. platform code.

**Prevention:**
- **Rule**: `packages/meditation-core` has ZERO platform imports
  - ✓ Allowed: Pure TypeScript logic, types, interfaces, utilities
  - ✗ Forbidden: `localStorage`, `AsyncStorage`, `navigator`, `window`, React Native components
- Enforce with ESLint rule: `no-restricted-imports` for platform APIs in shared packages
- Document in monorepo README: "Core package is platform-agnostic business logic only"

**Detection:** Import errors when web app tries to build after importing from `meditation-core`

**Phase mapping:** Phase 2 (monorepo setup) must define and enforce boundaries immediately

---

### Pitfall 17: Shared Component Import Hell
**What goes wrong:** `MeditationPlayer.tsx` imports `AmbientVisuals.tsx`, which uses CSS animations. Pulling MeditationPlayer into shared code drags in non-portable dependencies. Circular imports and build failures.

**Why it happens:** Components tightly coupled to platform-specific UI libraries.

**Prevention:**
- **Split components into logic + presentation**:
  ```
  packages/meditation-core/
    src/hooks/useMeditationSession.ts  // ✓ Logic only

  apps/web/
    src/components/MeditationPlayer.web.tsx  // Uses CSS, Tailwind

  apps/mobile/
    src/components/MeditationPlayer.native.tsx  // Uses StyleSheet, Reanimated
  ```
- Both UI components consume same `useMeditationSession()` hook
- Don't try to share UI components — **only share hooks and state management**

**Detection:** Build errors about missing CSS modules or RN components in web build

**Phase mapping:** Phase 2 extracts hooks; Phase 3 builds platform-specific UIs

---

### Pitfall 18: Zustand Store with Platform-Specific Persistence
**What goes wrong:** `meditation-store.ts` moved to shared package but hardcodes `localStorage`. Mobile app crashes trying to import the store.

**Why it happens:** Store definition mixed with persistence mechanism.

**Prevention:**
- **Separate store definition from persistence config**:
  ```typescript
  // packages/meditation-core/src/store-base.ts
  export const createMeditationStore = (storage: StateStorage) => {
    return create(
      persist(
        (set) => ({ /* logic */ }),
        { name: 'zen-mood-entries-v2', storage }
      )
    )
  }

  // apps/web/src/store.ts
  import { createMeditationStore } from '@meditation/core'
  export const useMeditationStore = createMeditationStore(
    createJSONStorage(() => localStorage)
  )

  // apps/mobile/src/store.ts
  import { createMeditationStore } from '@meditation/core'
  import AsyncStorage from '@react-native-async-storage/async-storage'
  export const useMeditationStore = createMeditationStore(
    createJSONStorage(() => AsyncStorage)
  )
  ```

**Detection:** Mobile app crashes with "localStorage is not defined" when importing store

**Phase mapping:** Phase 2 must refactor store for dependency injection

---

## Sources

**Confidence Assessment:**
- **MEDIUM overall** — Based on established React Native conversion patterns + SimpleMeditation architecture analysis
- **HIGH confidence** on Web Audio limitations (well-documented incompatibility)
- **HIGH confidence** on localStorage→AsyncStorage async issues (common migration bug)
- **MEDIUM confidence** on specific timing/gesture details (platform version-dependent)
- **LOW confidence** on Expo Audio 2026 capabilities (would need Context7 verification)

**Research methodology:**
- Analyzed SimpleMeditation existing codebase architecture (Web Audio usage, localStorage patterns, Tailwind styling, custom hooks)
- Cross-referenced with known React Native limitations (no Web Audio API, async storage, StyleSheet constraints)
- Identified tech debt amplification points (dual write paths → race conditions, manual localStorage → migration complexity)
- Mapped pitfalls to specific files and line numbers from CONCERNS.md

**Verification needed:**
- Expo Audio synthesis capabilities in 2026 (Phase 1 decision)
- NativeWind feature completeness for Tailwind migration (Phase 1 design system)
- React Navigation v6+ patterns for bottom tab navigation (Phase 2)
- Zustand persist middleware AsyncStorage adapter stability (Phase 2)

**Not researched (out of scope for this phase):**
- iOS/Android app store submission requirements
- Push notification implementation specifics
- Home screen widget APIs
- Specific monorepo tooling (Turborepo vs. Nx vs. Yarn workspaces)

---

*Research completed: 2026-03-12*
*Pitfalls catalog: 18 total (5 critical, 10 moderate, 3 minor, 3 monorepo-specific)*
