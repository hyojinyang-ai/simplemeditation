// Ambient sound engine with meditation music layer
export type AmbientSound = 'singing-bowl' | 'gong' | 'ambient-pad' | 'nature' | 'rain' | 'ocean' | 'wind' | 'birds' | 'fireplace';

const SOUND_FILES: Record<AmbientSound, string> = {
  'singing-bowl': '/sounds/singing-bowl.mp3',
  'gong': '/sounds/gong.mp3',
  'ambient-pad': '/sounds/ambient-pad.mp3',
  'nature': '/sounds/nature.mp3',
  'rain': '/sounds/rain.mp3',
  'ocean': '/sounds/ocean.mp3',
  'wind': '/sounds/wind.mp3',
  'birds': '/sounds/birds.mp3',
  'fireplace': '/sounds/fireplace.mp3',
};

// Generative meditation drone frequencies (Hz) — peaceful harmonic intervals
const DRONE_NOTES = [
  { freq: 136.1, label: 'Om' },       // C#3 – Om frequency
  { freq: 174.0, label: 'Solfeggio' }, // Solfeggio healing
  { freq: 256.0, label: 'C4' },
  { freq: 341.3, label: 'F4' },
  { freq: 384.0, label: 'G4' },
];

class MeditationDrone {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private masterGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private stopTimeout: ReturnType<typeof setTimeout> | null = null;

  start(volume = 0.12) {
    this.stop(true);
    try {
      if (this.stopTimeout) {
        clearTimeout(this.stopTimeout);
        this.stopTimeout = null;
      }
      const ctx = new AudioContext();
      // Resume AudioContext if it's suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(err => console.warn('AudioContext resume failed:', err));
      }
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3);
      master.connect(ctx.destination);
      this.masterGain = master;

      // Subtle LFO for gentle volume modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // Very slow wobble
      lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();
      this.lfo = lfo;

      // Pick 3 harmonically related notes
      const baseIdx = Math.floor(Math.random() * 2); // 0 or 1
      const notes = [DRONE_NOTES[baseIdx], DRONE_NOTES[baseIdx + 2], DRONE_NOTES[baseIdx + 3]];

      notes.forEach((note, i) => {
        // Main oscillator — soft sine
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
        // Slight detuning for warmth
        osc.detune.setValueAtTime((i - 1) * 4, ctx.currentTime);
        gain.gain.setValueAtTime(i === 0 ? 0.5 : 0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        this.oscillators.push(osc);

        // Sub-harmonic layer
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(note.freq / 2, ctx.currentTime);
        subGain.gain.setValueAtTime(0.15, ctx.currentTime);
        sub.connect(subGain);
        subGain.connect(master);
        sub.start();
        this.oscillators.push(sub);
      });
    } catch {}
  }

  setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.5);
    }
  }

  stop(immediate = false) {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    if (immediate) {
      // Immediate stop for when starting a new session
      this.oscillators.forEach((o) => { try { o.stop(); } catch {} });
      this.oscillators = [];
      if (this.lfo) { try { this.lfo.stop(); } catch {} this.lfo = null; }
      if (this.ctx) { try { this.ctx.close(); } catch {} this.ctx = null; }
      this.masterGain = null;
      return;
    }

    // Graceful fade out for normal stop
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    }
    const ctx = this.ctx;
    const lfo = this.lfo;
    const masterGain = this.masterGain;
    const oscillators = [...this.oscillators];

    this.stopTimeout = setTimeout(() => {
      oscillators.forEach((o) => { try { o.stop(); } catch {} });
      if (lfo) { try { lfo.stop(); } catch {} }
      if (ctx) { try { ctx.close(); } catch {} }

      if (this.ctx === ctx) {
        this.ctx = null;
      }
      if (this.lfo === lfo) {
        this.lfo = null;
      }
      if (this.masterGain === masterGain) {
        this.masterGain = null;
      }
      if (this.oscillators === oscillators) {
        this.oscillators = [];
      } else {
        this.oscillators = this.oscillators.filter((oscillator) => !oscillators.includes(oscillator));
      }

      this.stopTimeout = null;
    }, 2200);
  }
}

class AmbientEngine {
  private audio: HTMLAudioElement | null = null;
  private activeAudios = new Set<HTMLAudioElement>();
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private fadeOutInterval: ReturnType<typeof setInterval> | null = null;
  private drone = new MeditationDrone();
  private _soundVolume = 0.7; // ambient sound at 70%, drone fills the rest
  private currentSound: AmbientSound | null = null;

  private clearIntervals() {
    if (this.fadeInterval) {
      console.log(`[AmbientEngine] Clearing fadeInterval`);
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.fadeOutInterval) {
      console.log(`[AmbientEngine] Clearing fadeOutInterval`);
      clearInterval(this.fadeOutInterval);
      this.fadeOutInterval = null;
    }
  }

  private cleanupAudio(audio: HTMLAudioElement) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
      console.log(`[AmbientEngine] Audio element cleaned up`);
    } catch (e) {
      console.warn('[AmbientEngine] Error stopping audio:', e);
    } finally {
      this.activeAudios.delete(audio);
      if (this.audio === audio) {
        this.audio = null;
      }
    }
  }

  start(sound: AmbientSound) {
    console.log(`[AmbientEngine] start() called with sound: ${sound}`);
    console.log(`[AmbientEngine] Current state - currentSound: ${this.currentSound}, audio exists: ${!!this.audio}`);

    // Don't restart if same sound is already playing
    if (this.currentSound === sound && this.audio) {
      console.log(`[AmbientEngine] Already playing ${sound}, skipping restart`);
      return;
    }

    // Immediately stop any existing audio
    console.log(`[AmbientEngine] Calling stopImmediate()`);
    this.stopImmediate();

    console.log(`[AmbientEngine] Creating new Audio element for: ${sound}`);
    this.currentSound = sound;

    const audio = new Audio(SOUND_FILES[sound]);
    audio.loop = true;
    audio.volume = 0;

    // Add event listeners for debugging
    audio.addEventListener('ended', () => {
      console.log(`[AmbientEngine] ❌ Audio ENDED event fired (should not happen with loop=true)`);
    });

    audio.addEventListener('pause', () => {
      console.log(`[AmbientEngine] Audio PAUSED`);
    });

    audio.addEventListener('play', () => {
      console.log(`[AmbientEngine] Audio PLAY event`);
    });

    audio.addEventListener('error', (e) => {
      console.error(`[AmbientEngine] Audio ERROR:`, e);
    });

    // Play audio with better error handling
    audio.play()
      .then(() => {
        console.log(`[AmbientEngine] ✓ Audio play() promise resolved - sound: ${sound}, loop: ${audio.loop}, duration: ${audio.duration}`);
      })
      .catch((error) => {
        console.error('[AmbientEngine] ❌ Audio playback failed:', error);
        console.log('Tip: User interaction may be required to start audio playback.');
      });

    this.audio = audio;
    this.activeAudios.add(audio);
    console.log(`[AmbientEngine] Audio element stored, starting fade in`);

    // Fade in ambient sound
    let vol = 0;
    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        return;
      }
      vol = Math.min(vol + 0.035, this._soundVolume);
      this.audio.volume = vol;
      if (vol >= this._soundVolume && this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 50);

    // Start meditation drone layer
    this.drone.start(0.1);
  }

  // Immediate stop without fade (used when starting new sound)
  private stopImmediate() {
    console.log(`[AmbientEngine] stopImmediate() called`);

    this.clearIntervals();

    // Immediately stop every known audio element
    if (this.activeAudios.size > 0) {
      console.log(`[AmbientEngine] Stopping ${this.activeAudios.size} active audio element(s)`);
      [...this.activeAudios].forEach((audio) => this.cleanupAudio(audio));
    }

    this.currentSound = null;
    console.log(`[AmbientEngine] Stopping drone immediately`);
    this.drone.stop(true); // Pass immediate=true to prevent overlap
  }

  stop() {
    console.log('[AmbientEngine] stop() called');

    this.clearIntervals();

    if (this.audio) {
      const audio = this.audio;
      let vol = audio.volume;

      this.fadeOutInterval = setInterval(() => {
        vol = Math.max(vol - 0.07, 0);
        try {
          audio.volume = vol;
        } catch {}

        if (vol <= 0) {
          if (this.fadeOutInterval) {
            clearInterval(this.fadeOutInterval);
            this.fadeOutInterval = null;
          }
          this.cleanupAudio(audio);
        }
      }, 50);
    }

    this.audio = null;
    this.currentSound = null;
    this.drone.stop();
  }
}

export const ambientEngine = new AmbientEngine();

export const resolveSound = (sound: string): AmbientSound => {
  if (sound === 'random') {
    const options: AmbientSound[] = ['singing-bowl', 'gong', 'ambient-pad', 'nature', 'rain', 'ocean', 'wind', 'birds', 'fireplace'];
    return options[Math.floor(Math.random() * options.length)];
  }
  return sound as AmbientSound;
};
