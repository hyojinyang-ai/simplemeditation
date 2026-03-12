# Testing Patterns

**Analysis Date:** 2026-03-12

## Test Framework

**Runner:**
- Vitest 3.2.4
- Config: `vitest.config.ts`
- Environment: jsdom (browser-like environment)

**Assertion Library:**
- Vitest built-in assertions
- Testing Library helpers available for DOM testing
- Jest DOM matchers via `@testing-library/jest-dom`

**Run Commands:**
```bash
npm run test              # Run all tests once
npm run test:watch       # Watch mode for development
```

**Test Execution:**
- Tests match pattern: `src/**/*.{test,spec}.{ts,tsx}`
- Global test utilities available: `describe`, `it`, `expect`
- Setup file runs before tests: `src/test/setup.ts`

## Test File Organization

**Location:**
- Tests co-located with source files
- Test files in `src/test/` directory
- Current test file: `src/test/example.test.ts`

**Naming:**
- Pattern: `[filename].test.ts` or `[filename].spec.ts`
- Example: `meditation-store.test.ts`, `ambient-engine.test.ts`
- Not yet implemented for actual application code

**Structure:**
```
src/
├── test/
│   ├── setup.ts              # Test environment setup
│   └── example.test.ts       # Example test file
├── lib/
│   └── [modules to test]
└── components/
    └── [components to test]
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from "vitest";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
```

**Patterns:**
- Use `describe()` to group related tests
- Use `it()` for individual test cases
- Use `expect()` for assertions
- Descriptive test names explaining what is being tested

**Test Descriptions:**
- "should [expected behavior]" pattern recommended
- Example: "should load entries from localStorage", "should track session start"
- Clear intent on what the test validates

## Setup and Fixtures

**Setup File (`src/test/setup.ts`):**
```typescript
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

**Purpose:**
- Imports Jest DOM matchers (e.g., `toBeInTheDocument()`)
- Polyfills `window.matchMedia` for responsive component testing
- Runs before all test files automatically

**Test Data:**
- Currently no fixture files (using inline test data)
- Pattern recommendation: Create `src/test/fixtures/` directory for shared test data
- Example: Mock meditation entries, mock mood data

## Mocking

**Framework:**
- Vitest built-in mocking
- No external mocking library currently required

**Where Mocking is Needed:**
- localStorage operations (for store testing)
- Audio API calls (Web Audio context, HTMLAudioElement)
- navigator APIs (vibration)
- Fetch/HTTP calls (if implemented for Supabase)
- framer-motion animations (in component tests)

**Mocking Pattern Recommendations:**

**localStorage Mocking:**
```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
```

**Audio Context Mocking:**
```typescript
const mockAudioContext = {
  createGain: vi.fn(() => ({ gain: { setValueAtTime: vi.fn() }, connect: vi.fn() })),
  createOscillator: vi.fn(() => ({ start: vi.fn(), stop: vi.fn(), connect: vi.fn() })),
  destination: {},
  currentTime: 0,
  close: vi.fn(),
};
global.AudioContext = vi.fn(() => mockAudioContext);
```

**HTMLAudioElement Mocking:**
```typescript
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  loop: false,
  volume: 1,
};
global.Audio = vi.fn(() => mockAudio);
```

**What to Mock:**
- External browser APIs (Audio, localStorage, navigator, fetch)
- Time-dependent behavior (timers, animation frames)
- Heavy computations or I/O operations
- Library side effects (when testing pure logic in isolation)

**What NOT to Mock:**
- React component rendering (use actual component under test)
- State management (test with actual Zustand store)
- DOM queries (use Testing Library utilities)
- Custom hooks (test full hook behavior, not internals)

## Component Testing

**Testing Library Helpers Available:**
- `render()` - Render component with jsdom
- `screen` - Query DOM elements
- `fireEvent` - Simulate user interactions
- `waitFor` - Async operation polling
- `userEvent` - Realistic user interaction

**Component Test Pattern Recommendations:**

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MoodCheck from "@/components/MoodCheck";

describe("MoodCheck", () => {
  it("should render all mood options", () => {
    const handleSelect = vi.fn();
    render(<MoodCheck onSelect={handleSelect} />);

    expect(screen.getByText("Stressed")).toBeInTheDocument();
    expect(screen.getByText("Tired")).toBeInTheDocument();
    expect(screen.getByText("Neutral")).toBeInTheDocument();
    expect(screen.getByText("Anxious")).toBeInTheDocument();
  });

  it("should call onSelect when mood button clicked", async () => {
    const handleSelect = vi.fn();
    render(<MoodCheck onSelect={handleSelect} />);

    await userEvent.click(screen.getByText("Calm"));
    expect(handleSelect).toHaveBeenCalledWith("calm");
  });
});
```

## Hook Testing

**Testing Custom Hooks:**
- Use Vitest's `renderHook` (from Testing Library or Vitest React utils)
- Test in isolation from components
- Test side effects (event listeners, intervals)
- Test state updates

**Hook Test Pattern Recommendations:**

```typescript
import { renderHook, act } from "vitest";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

describe("usePullToRefresh", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePullToRefresh());

    expect(result.current.pullDistance).toBe(0);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.threshold).toBe(80);
  });

  it("should update pullDistance on touch move", () => {
    const { result } = renderHook(() => usePullToRefresh());
    const container = result.current.containerRef.current;

    act(() => {
      // Simulate touch events
      const touchStart = new TouchEvent("touchstart", {
        touches: [{ clientY: 0 }] as any,
      });
      container?.dispatchEvent(touchStart);
    });
  });
});
```

## Unit Testing Utilities

**Store Testing (Zustand):**
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useMeditationStore } from "@/lib/meditation-store";

describe("useMeditationStore", () => {
  beforeEach(() => {
    useMeditationStore.setState({ entries: [], isMeditating: false });
  });

  it("should add entry to store", () => {
    const store = useMeditationStore.getState();
    store.addEntry({
      preMood: "stressed",
      sessionMinutes: 10,
      sound: "singing-bowl",
    });

    const updated = useMeditationStore.getState();
    expect(updated.entries).toHaveLength(1);
    expect(updated.entries[0].preMood).toBe("stressed");
  });

  it("should persist entry to localStorage", () => {
    const store = useMeditationStore.getState();
    store.addEntry({ preMood: "neutral" });

    const stored = localStorage.getItem("zen-mood-entries-v2");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toHaveLength(1);
  });
});
```

**Utility Function Testing:**
```typescript
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge classNames correctly", () => {
    const result = cn("px-2", "py-1", "px-4"); // Last px value wins
    expect(result).toBe("py-1 px-4");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", true && "active", false && "disabled");
    expect(result).toBe("base active");
  });
});
```

**Analytics Function Testing:**
```typescript
import { describe, it, expect, vi } from "vitest";
import { track } from "@vercel/analytics";
import { trackPageView } from "@/lib/analytics";

vi.mock("@vercel/analytics");

describe("analytics", () => {
  it("should call track with page_view event", () => {
    trackPageView("home");

    expect(track).toHaveBeenCalledWith("page_view", expect.objectContaining({
      page: "home",
    }));
  });
});
```

## Async Testing

**Async/Await Pattern:**
```typescript
it("should handle async operations", async () => {
  const { result } = renderHook(() => useAsyncData());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

**Timer Testing:**
```typescript
import { vi } from "vitest";

describe("timing", () => {
  it("should wait before executing callback", () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    setTimeout(callback, 1000);
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
```

## Coverage

**Requirements:**
- Not enforced (no coverage thresholds configured)
- Can add coverage reporting with `npm run test -- --coverage`

**View Coverage:**
```bash
npm run test -- --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, utilities
- Approach: Test inputs and outputs, verify behavior
- Location: `src/test/[module].test.ts`
- Example: Testing `meditation-store` methods, `analytics` functions, `ambient-engine` classes

**Component Tests:**
- Scope: Individual React components
- Approach: Render component, simulate user interaction, verify DOM updates
- Location: `src/test/[component].test.tsx`
- Example: Testing `MoodCheck` renders options and calls callbacks

**Hook Tests:**
- Scope: Custom React hooks in isolation
- Approach: Use `renderHook`, test state updates and side effects
- Location: `src/test/[hook].test.ts`
- Example: Testing `usePullToRefresh` state and event handling

**Integration Tests:**
- Scope: Multiple components or modules working together
- Approach: Render full page/feature, test user workflows
- Location: Could be in `src/test/` with integration suffix
- Example: Testing full meditation session flow (select mood → pick sound → complete)

**E2E Tests:**
- Framework: Not used currently
- Recommendation: Add Playwright or Cypress for critical user journeys
- Candidates: Meditation session completion, mood tracking workflow

## Coverage Gaps

**Currently Untested:**
- All React components (no component tests exist)
- All custom hooks (no hook tests exist)
- Zustand store (no unit tests)
- Analytics functions (no tests)
- Ambient audio engine (no tests)
- Web Audio API integration (complex, needs careful mocking)

**High Priority for Testing:**
- `src/lib/meditation-store.ts` - Critical data persistence
- `src/lib/analytics.ts` - Event tracking verification
- `src/components/MeditationPlayer.tsx` - Core meditation flow
- `src/components/MoodCheck.tsx` - Entry point for user journey
- `src/hooks/use-pull-to-refresh.ts` - Mobile gesture handling

**Medium Priority:**
- `src/components/SessionPicker.tsx`
- `src/components/SoundPicker.tsx`
- `src/components/Reflection.tsx`
- `src/pages/Index.tsx` - Main page composition
- `src/lib/ambient-engine.ts` - Audio system

---

*Testing analysis: 2026-03-12*
