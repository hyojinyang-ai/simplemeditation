import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ambientEngine } from '../ambient-engine';

class FakeAudio {
  static instances: FakeAudio[] = [];

  loop = false;
  volume = 1;
  currentTime = 0;
  src: string | null;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  addEventListener = vi.fn();
  removeAttribute = vi.fn((name: string) => {
    if (name === 'src') {
      this.src = null;
    }
  });

  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }
}

class FakeGainNode {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };

  connect = vi.fn();
}

class FakeOscillatorNode {
  type = 'sine';
  frequency = { setValueAtTime: vi.fn() };
  detune = { setValueAtTime: vi.fn() };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeAudioContext {
  currentTime = 0;
  state = 'running';
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createGain = vi.fn(() => new FakeGainNode());
  createOscillator = vi.fn(() => new FakeOscillatorNode());
}

describe('ambientEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeAudio.instances = [];
    vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
    vi.stubGlobal('AudioContext', FakeAudioContext as unknown as typeof AudioContext);
    ambientEngine.stop();
  });

  afterEach(() => {
    ambientEngine.stop();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not create duplicate audio elements when restarting with the same sound', () => {
    ambientEngine.start('rain');
    ambientEngine.start('rain');

    expect(FakeAudio.instances).toHaveLength(1);
  });

  it('cleans up the previous audio before starting a new sound', () => {
    ambientEngine.start('rain');
    const firstAudio = FakeAudio.instances[0];

    ambientEngine.stop();
    ambientEngine.start('ocean');

    expect(firstAudio.pause).toHaveBeenCalled();
    expect(firstAudio.currentTime).toBe(0);
    expect(firstAudio.removeAttribute).toHaveBeenCalledWith('src');
    expect(firstAudio.load).toHaveBeenCalled();
    expect(FakeAudio.instances).toHaveLength(2);
    expect(FakeAudio.instances[1].play).toHaveBeenCalled();
  });

  it('forces cleanup if stop is called again during fade-out', () => {
    ambientEngine.start('wind');
    const audio = FakeAudio.instances[0];

    ambientEngine.stop();
    ambientEngine.stop();

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(audio.removeAttribute).toHaveBeenCalledWith('src');
    expect(audio.load).toHaveBeenCalled();
  });
});
