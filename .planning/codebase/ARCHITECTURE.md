# Architecture

**Analysis Date:** 2026-03-12

## Pattern Overview

**Overall:** Component-driven SPA with modal/step-based navigation

**Key Characteristics:**
- Single-page React application with multi-step meditation workflow
- State managed by Zustand with localStorage persistence
- Web Audio API for real-time audio synthesis and mixing
- Declarative routing via React Router with bottom navigation
- Mobile-first progressive enhancement with graceful audio fallbacks

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI with motion animations and user interactions
- Location: `src/components/` and `src/pages/`
- Contains: React components using shadcn/ui primitives, Framer Motion, Lucide icons
- Depends on: State management (Zustand), hooks, analytics, ambient engine
- Used by: React Router pages, other components via composition

**State Management Layer:**
- Purpose: Persist and manage meditation entries, mood tracking, session state
- Location: `src/lib/meditation-store.ts`
- Contains: Zustand store with localStorage integration, mood configuration objects, quote data
- Depends on: localStorage, crypto API for ID generation
- Used by: All pages and components that access meditation history or mood data

**Audio Layer:**
- Purpose: Manage real-time audio synthesis and ambient sound playback
- Location: `src/lib/ambient-engine.ts`
- Contains: MeditationDrone class (Web Audio API synthesis), AmbientEngine class (dual-layer audio control)
- Depends on: Web Audio API, HTML5 Audio API, files in `public/sounds/`
- Used by: MeditationPlayer component during active meditation sessions

**Analytics Layer:**
- Purpose: Track user behavior and engagement metrics
- Location: `src/lib/analytics.ts`
- Contains: Event tracking functions for page views, sessions, moods, sounds, audio errors
- Depends on: Vercel Analytics SDK
- Used by: All pages and components that emit tracking events

**Utilities Layer:**
- Purpose: Shared helpers, hooks, and UI primitives
- Location: `src/hooks/`, `src/components/ui/`, `src/lib/utils.ts`
- Contains: Custom React hooks (pull-to-refresh, mobile detection, toast), shadcn/ui components
- Depends on: React, Radix UI, date utilities
- Used by: Page and custom components

**Integration Layer:**
- Purpose: Third-party service configuration
- Location: `src/integrations/supabase/`
- Contains: Supabase client initialization and type definitions
- Depends on: Supabase SDK
- Used by: Currently unused; available for future features

## Data Flow

**Session Lifecycle (Home Page Step Flow):**

1. User selects pre-meditation mood on "mood" step
   - Component: `MoodCheck` calls `handleMoodSelect()` in Index.tsx
   - State: `setPreMood()`, local state update
   - Analytics: `trackPreMoodSelection(mood)` sent to Vercel

2. User selects session duration on "session" step
   - Component: `SessionPicker` calls `handleSessionSelect()`
   - State: `setMinutes()`, local state update
   - No analytics event (duration selected, not completed)

3. User selects ambient sound on "sound" step
   - Component: `SoundPicker` calls `handleSoundSelect()`
   - State: `setSound()`, local state update
   - Analytics: `trackSoundChange()` sent if changing sounds mid-flow
   - Transitions to "meditate" step automatically

4. Meditation session runs with timer
   - Component: `MeditationPlayer` manages countdown timer (1 second intervals)
   - Audio: `ambientEngine.start(resolvedSound)` plays looped ambient sound + generative drone
   - State: `setMeditating(true)` in Zustand store, breathing phase updates
   - Analytics: Session start, completion, or abandonment tracked
   - Visual: Breathing cycle UI (4s inhale, 2s hold, 4s exhale, 2s hold = 12s cycle)

5. User reaches reflection screen after session
   - Component: `Reflection` captures post-meditation mood
   - State: `handleReflection()` adds entry to Zustand store, persists to localStorage
   - Analytics: `trackPostMoodSelection(mood, preMood)` tracks mood transformation

6. User views inspirational quote and optionally saves it
   - Component: `StoicQuote` displays random quote from store
   - State: `handleSaveQuote()` updates latest entry with savedQuote field
   - Analytics: `trackQuoteSaved()` sent when saving quote
   - Action: `handleReset()` returns to "mood" step when continuing

**State Persistence:**

- Zustand store loads entries from localStorage key `zen-mood-entries-v2` on mount
- Every entry addition updates localStorage immediately via `addEntry()`
- Quote saving updates localStorage by mapping over entries array
- No remote sync (Supabase available but not integrated)

**Audio Flow:**

1. Sound string (user selection) passed to `MeditationPlayer`
2. `resolveSound()` converts 'random' to specific sound or passes through
3. `ambientEngine.start(resolvedSound)` called when `playing` state = true
4. AmbientEngine creates new Audio element, loads from `/sounds/{name}.mp3`
5. Fade-in loop gradually increases volume from 0 to 0.7 over ~2 seconds
6. Simultaneous MeditationDrone starts generative Web Audio oscillators
7. Completion chime (two harmonious sine tones) plays when timer ends
8. Fade-out loop on pause/stop, all audio nodes closed

## Key Abstractions

**MeditationEntry:**
- Purpose: Represents a single meditation session with pre/post mood, session duration, selected sound, optional note and quote
- Examples: `src/lib/meditation-store.ts` (type definition and config objects)
- Pattern: Immutable value object with optional fields for flexibility; stored as JSON in localStorage

**MoodEntry Object Structure:**
```typescript
{
  id: string;                           // uuid
  preMood: PreMood;                     // 'stressed' | 'tired' | 'neutral' | 'anxious'
  postMood?: PostMood;                  // 'calm' | 'relieved' | 'peaceful' | 'grateful' | 'refreshed'
  timestamp: number;                    // milliseconds since epoch
  note?: string;                        // optional user reflection
  sessionMinutes?: number;              // duration selected
  sound?: SoundType;                    // ambient sound choice
  savedQuote?: { text: string; author: string };  // optional inspirational quote
}
```

**AmbientEngine:**
- Purpose: Singleton audio controller managing dual-layer playback (pre-recorded + synthesized)
- Examples: `src/lib/ambient-engine.ts` class instantiation at module level
- Pattern: Stateful singleton with lifecycle methods (start/stop); encapsulates Web Audio API complexity

**MeditationDrone:**
- Purpose: Generate harmonic meditation background using Web Audio API oscillators
- Examples: Private class within ambient-engine.ts
- Pattern: Encapsulated audio synthesis with frequency-based harmony using Om (136.1 Hz) and Solfeggio tones
- Details: Creates 3 harmonically related notes + sub-harmonic layer, applies LFO modulation for warmth

**Step Component Pattern:**
- Purpose: Represent workflow steps in Index.tsx home page
- Examples: MoodCheck, SessionPicker, SoundPicker, MeditationPlayer, Reflection, StoicQuote
- Pattern: Props-driven rendering with `step` state machine; each component calls handler callback to trigger next step

**Pull-to-Refresh Hook:**
- Purpose: Detect and handle native pull-to-refresh gesture on mobile
- Examples: `src/hooks/use-pull-to-refresh.ts` used in TrackerPage
- Pattern: Hook returns container ref, pull distance for visual feedback, and refresh state

## Entry Points

**Application Root:**
- Location: `src/main.tsx`
- Triggers: Browser load of `/index.html`
- Responsibilities: Mounts React app via createRoot into DOM

**App Component:**
- Location: `src/App.tsx`
- Triggers: React initialization
- Responsibilities: Sets up global providers (QueryClient, Router, UI context), defines 4 main routes, mounts BottomNav and Vercel Analytics

**Home Page (Meditation Flow):**
- Location: `src/pages/Index.tsx`
- Triggers: Route `/` matched, or BottomNav home link clicked
- Responsibilities: Multi-step meditation workflow state machine, orchestrates MoodCheck → SessionPicker → SoundPicker → MeditationPlayer → Reflection → StoicQuote

**Journal Page:**
- Location: `src/pages/TrackerPage.tsx`
- Triggers: Route `/tracker` matched
- Responsibilities: Display meditation session history and saved quotes with tab-based filtering

**Analytics Page:**
- Location: `src/pages/AnalyticsPage.tsx`
- Triggers: Route `/analytics` matched
- Responsibilities: Display Charts component with mood transformations, session statistics, engagement metrics

**Settings Page:**
- Location: `src/pages/SettingsPage.tsx`
- Triggers: Route `/settings` matched
- Responsibilities: User preferences and configuration (theme, notifications, etc.)

## Error Handling

**Strategy:** Graceful degradation with try-catch for browser API edge cases

**Patterns:**

- **Audio Failures:** All `.play()` and Web Audio API calls wrapped in `.catch(() => {})` or try-catch blocks
  - Example: `audio.play().catch(() => {})` in AmbientEngine.start() (line 118)
  - Fallback: Session continues without sound; analytics track audio errors separately

- **localStorage Failures:** Wrapped in try-catch with empty array fallback
  - Example: `loadEntries()` returns `[]` if localStorage.getItem() fails (line 35, meditation-store.ts)
  - Prevents app crash if storage quota exceeded

- **Vibration API:** Wrapped in try-catch (not all browsers support)
  - Example: `if (navigator.vibrate)` guard in MeditationPlayer.playCompletionFeedback() (line 59)

- **Navigation During Session:** Confirmation dialog prevents accidental session loss
  - Example: BottomNav.tsx checks `isMeditating` state before allowing nav away from home (lines 30-34)

- **Supabase Client:** Imported but not actively used; graceful non-integration

## Cross-Cutting Concerns

**Logging:** Development-only console logging via analytics utility
- Implementation: `logEvent()` function in `src/lib/analytics.ts` checks `import.meta.env.DEV`
- Usage: All analytics events console.log in development mode for debugging

**Validation:** None explicit; client-side assumes valid user selections
- Mood values validated via TypeScript union types (PreMood, PostMood)
- Sound selection validated via SoundType union and resolveSound()
- Session minutes validated implicitly (SessionPicker offers specific options)

**Authentication:** None; fully public app with no user accounts
- All data stored locally; no authentication endpoints
- Supabase integration not configured with auth

**Theme/Styling:** Tailwind CSS with custom zen color palette
- Theme configuration via `next-themes` (light mode by default)
- Color system: HSL-based custom properties (zen-blue, zen-lavender, zen-green, zen-sky, zen-rose)
- Glass-morphism utilities: glass-strong, glass-button, glass-selected applied throughout
- Animation presets: breathe, float, fade-in, shimmer defined in tailwind.config.js

**Performance Optimization:**
- Code splitting: React Router lazy loading (default with built-in route splitting)
- Image optimization: Use of native img tags (not optimized; candidate for next/image pattern if migrated)
- Audio: Dual-layer with manual fade-in/out to prevent abrupt transitions
- Animations: Framer Motion with optimized transitions (duration 0.35-0.6s for perceived speed)

---

*Architecture analysis: 2026-03-12*
