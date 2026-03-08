// Ambient sound engine using real audio files
export type AmbientSound = 'singing-bowl' | 'gong' | 'ambient-pad' | 'nature' | 'rain' | 'ocean';

const SOUND_FILES: Record<AmbientSound, string> = {
  'singing-bowl': '/sounds/singing-bowl.mp3',
  'gong': '/sounds/gong.mp3',
  'ambient-pad': '/sounds/ambient-pad.mp3',
  'nature': '/sounds/nature.mp3',
  'rain': '/sounds/rain.mp3',
  'ocean': '/sounds/ocean.mp3',
};

class AmbientEngine {
  private audio: HTMLAudioElement | null = null;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  start(sound: AmbientSound) {
    this.stop();

    const audio = new Audio(SOUND_FILES[sound]);
    audio.loop = true;
    audio.volume = 0;
    audio.play().catch(() => {});

    this.audio = audio;

    // Fade in over 1s
    let vol = 0;
    this.fadeInterval = setInterval(() => {
      vol = Math.min(vol + 0.05, 1);
      audio.volume = vol;
      if (vol >= 1 && this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 50);
  }

  stop() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (this.audio) {
      const audio = this.audio;
      let vol = audio.volume;

      // Fade out over 0.5s
      const fadeOut = setInterval(() => {
        vol = Math.max(vol - 0.1, 0);
        audio.volume = vol;
        if (vol <= 0) {
          clearInterval(fadeOut);
          audio.pause();
          audio.src = '';
        }
      }, 50);

      this.audio = null;
    }
  }
}

export const ambientEngine = new AmbientEngine();

export const resolveSound = (sound: string): AmbientSound => {
  if (sound === 'random') {
    const options: AmbientSound[] = ['singing-bowl', 'gong', 'ambient-pad', 'nature', 'rain', 'ocean'];
    return options[Math.floor(Math.random() * options.length)];
  }
  return sound as AmbientSound;
};
