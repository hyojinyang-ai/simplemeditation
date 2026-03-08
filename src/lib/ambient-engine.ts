// Ambient sound engine using Web Audio API
export type AmbientSound = 'singing-bowl' | 'gong' | 'ambient-pad' | 'nature' | 'rain' | 'ocean';

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private bowlInterval: ReturnType<typeof setInterval> | null = null;
  private active = false;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private createNoise(ctx: AudioContext, type: 'white' | 'brown'): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else {
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  private startSingingBowl(ctx: AudioContext, dest: AudioNode) {
    const playBowl = () => {
      if (!this.active || !this.ctx || this.ctx.state === 'closed') return;
      const t = this.ctx.currentTime;
      const fundamentals = [256, 384, 512, 639, 741];
      const freq = fundamentals[Math.floor(Math.random() * fundamentals.length)];
      [1, 2.76, 4.72].forEach((harmonic, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * harmonic, t);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 10, t);
        const g = this.ctx!.createGain();
        const vol = 0.12 / (i + 1);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 5 + Math.random() * 2);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 7);
      });
    };
    playBowl();
    this.bowlInterval = setInterval(playBowl, 8000 + Math.random() * 6000);
  }

  private startGong(ctx: AudioContext, dest: AudioNode) {
    const playGong = () => {
      if (!this.active || !this.ctx || this.ctx.state === 'closed') return;
      const t = this.ctx.currentTime;
      const freq = 60 + Math.random() * 40;
      [1, 1.5, 2.33, 3.5].forEach((h, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * h, t);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 20, t);
        const g = this.ctx!.createGain();
        const vol = 0.1 / (i + 1);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 8 + Math.random() * 3);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 12);
      });
    };
    playGong();
    this.bowlInterval = setInterval(playGong, 15000 + Math.random() * 10000);
  }

  private startAmbientPad(ctx: AudioContext, dest: AudioNode) {
    const chordFreqs = [220, 277.18, 329.63, 440];
    chordFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(3, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(g);
      g.connect(dest);
      osc.start();
      this.nodes.push(osc, lfo, lfoGain, g);
    });
    // Subtle noise layer
    const noise = this.createNoise(ctx, 'brown');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(200, ctx.currentTime);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.05, ctx.currentTime);
    noise.connect(lp);
    lp.connect(ng);
    ng.connect(dest);
    noise.start();
    this.nodes.push(noise, lp, ng);
  }

  private startNature(ctx: AudioContext, dest: AudioNode) {
    // Wind
    const noise = this.createNoise(ctx, 'brown');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(600, ctx.currentTime);
    bp.Q.setValueAtTime(1, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bp.frequency);
    lfo.start();
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(dest);
    noise.start();
    this.nodes.push(noise, bp, gain, lfo, lfoGain);
    // Birds
    const scheduleBird = () => {
      if (!this.active) return;
      setTimeout(() => {
        if (!this.active || !this.ctx || this.ctx.state === 'closed') return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const baseFreq = 2000 + Math.random() * 2000;
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, t + 0.05);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.1);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.02);
        g.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 0.25);
        scheduleBird();
      }, 2000 + Math.random() * 5000);
    };
    scheduleBird();
  }

  private startRain(ctx: AudioContext, dest: AudioNode) {
    const noise = this.createNoise(ctx, 'white');
    const hipass = ctx.createBiquadFilter();
    hipass.type = 'highpass';
    hipass.frequency.setValueAtTime(4000, ctx.currentTime);
    const lopass = ctx.createBiquadFilter();
    lopass.type = 'lowpass';
    lopass.frequency.setValueAtTime(8000, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    noise.connect(hipass);
    hipass.connect(lopass);
    lopass.connect(gain);
    gain.connect(dest);
    noise.start();
    this.nodes.push(noise, hipass, lopass, gain);
    const brown = this.createNoise(ctx, 'brown');
    const lp2 = ctx.createBiquadFilter();
    lp2.type = 'lowpass';
    lp2.frequency.setValueAtTime(400, ctx.currentTime);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.15, ctx.currentTime);
    brown.connect(lp2);
    lp2.connect(g2);
    g2.connect(dest);
    brown.start();
    this.nodes.push(brown, lp2, g2);
  }

  private startOcean(ctx: AudioContext, dest: AudioNode) {
    const noise = this.createNoise(ctx, 'brown');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(500, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(200, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    lfo.start();
    noise.connect(lp);
    lp.connect(gain);
    gain.connect(dest);
    noise.start();
    this.nodes.push(noise, lp, gain, lfo, lfoGain);
    // Wash layer
    const white = this.createNoise(ctx, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1200, ctx.currentTime);
    bp.Q.setValueAtTime(0.5, ctx.currentTime);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.06, ctx.currentTime);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoG2 = ctx.createGain();
    lfoG2.gain.setValueAtTime(0.04, ctx.currentTime);
    lfo2.connect(lfoG2);
    lfoG2.connect(g2.gain);
    lfo2.start();
    white.connect(bp);
    bp.connect(g2);
    g2.connect(dest);
    white.start();
    this.nodes.push(white, bp, g2, lfo2, lfoG2);
  }

  start(sound: AmbientSound) {
    this.stop();
    this.active = true;
    const ctx = this.getCtx();
    const dest = this.masterGain!;
    this.masterGain!.gain.linearRampToValueAtTime(1, ctx.currentTime + 1);

    switch (sound) {
      case 'singing-bowl': this.startSingingBowl(ctx, dest); break;
      case 'gong': this.startGong(ctx, dest); break;
      case 'ambient-pad': this.startAmbientPad(ctx, dest); break;
      case 'nature': this.startNature(ctx, dest); break;
      case 'rain': this.startRain(ctx, dest); break;
      case 'ocean': this.startOcean(ctx, dest); break;
    }
  }

  stop() {
    this.active = false;
    if (this.bowlInterval) {
      clearInterval(this.bowlInterval);
      this.bowlInterval = null;
    }
    if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    }
    setTimeout(() => {
      this.nodes.forEach((n) => {
        try { (n as any).stop?.(); } catch {}
        try { n.disconnect(); } catch {}
      });
      this.nodes = [];
      if (this.ctx && this.ctx.state !== 'closed') {
        try { this.ctx.close(); } catch {}
      }
      this.ctx = null;
      this.masterGain = null;
    }, 600);
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
