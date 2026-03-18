import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MeditationPlayer from '../MeditationPlayer';
import { useMeditationStore } from '@/lib/meditation-store';

const { startMock, stopMock } = vi.hoisted(() => ({
  startMock: vi.fn(),
  stopMock: vi.fn(),
}));

vi.mock('@/lib/ambient-engine', () => ({
  ambientEngine: {
    start: startMock,
    stop: stopMock,
  },
  resolveSound: (sound: string) => sound,
}));

vi.mock('@/lib/analytics', () => ({
  trackSessionStart: vi.fn(),
  trackSessionComplete: vi.fn(),
  trackSessionAbandoned: vi.fn(),
}));

vi.mock('../AmbientVisuals', () => ({
  default: () => null,
}));

describe('MeditationPlayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    startMock.mockClear();
    stopMock.mockClear();
    useMeditationStore.setState({ isMeditating: false });
    Object.defineProperty(window.navigator, 'vibrate', {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal(
      'AudioContext',
      class {
        currentTime = 0;
        createGain() {
          return {
            gain: {
              setValueAtTime: vi.fn(),
              exponentialRampToValueAtTime: vi.fn(),
              linearRampToValueAtTime: vi.fn(),
            },
            connect: vi.fn(),
          };
        }
        createOscillator() {
          return {
            type: 'sine',
            frequency: { setValueAtTime: vi.fn() },
            connect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
          };
        }
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('stops ambient audio when the session completes', async () => {
    render(
      <MeditationPlayer
        minutes={1 / 60}
        sound="rain"
        onComplete={vi.fn()}
        autoPlay
      />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(stopMock).toHaveBeenCalled();
    expect(useMeditationStore.getState().isMeditating).toBe(false);
  });
});
