import {
  AMBIENT_GAIN,
  BINAURAL_LEFT_HZ,
  BINAURAL_RIGHT_HZ,
  CROSSFADE_SECONDS,
  gainTargets,
  type AudioMood,
} from './audioParams';

const MUTE_RAMP_SECONDS = 0.25;
const AMBIENT_URL = '/audio/ambient.mp3';

// All gain *decisions* live in audioParams (tested); this class is the
// Web Audio plumbing that applies them. Must be constructed after a user
// gesture (the welcome screen's Start click) so the context can run.
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private binauralGain: GainNode | null = null;
  private mood: AudioMood = 'exploring';
  private muted = false;

  get isMuted(): boolean {
    return this.muted;
  }

  async start(): Promise<void> {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    await ctx.resume();

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = AMBIENT_GAIN;
    this.ambientGain.connect(ctx.destination);

    this.binauralGain = ctx.createGain();
    this.binauralGain.gain.value = 0;
    this.binauralGain.connect(ctx.destination);

    this.startBinaural(ctx, this.binauralGain);

    // Prefer a recorded loop if one is shipped; otherwise synthesize.
    const fileLoaded = await this.tryStartAmbientFile(ctx, this.ambientGain);
    if (!fileLoaded) this.startProceduralAmbient(ctx, this.ambientGain);
  }

  setMood(mood: AudioMood): void {
    this.mood = mood;
    this.applyTargets(CROSSFADE_SECONDS);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    this.applyTargets(MUTE_RAMP_SECONDS);
    return this.muted;
  }

  private applyTargets(rampSeconds: number): void {
    if (!this.ctx || !this.ambientGain || !this.binauralGain) return;
    const targets = gainTargets(this.mood, this.muted);
    const now = this.ctx.currentTime;
    for (const [node, value] of [
      [this.ambientGain, targets.ambient],
      [this.binauralGain, targets.binaural],
    ] as const) {
      node.gain.cancelScheduledValues(now);
      node.gain.setValueAtTime(node.gain.value, now);
      node.gain.linearRampToValueAtTime(value, now + rampSeconds);
    }
  }

  // Two pure tones, hard-panned: 200 Hz left, 210 Hz right → the brain
  // perceives a 10 Hz (alpha-wave) beat. Inaudible until godview mood.
  private startBinaural(ctx: AudioContext, out: GainNode): void {
    const channels: Array<[number, number]> = [
      [BINAURAL_LEFT_HZ, -1],
      [BINAURAL_RIGHT_HZ, 1],
    ];
    for (const [frequency, pan] of channels) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      osc.connect(panner).connect(out);
      osc.start();
    }
  }

  private async tryStartAmbientFile(ctx: AudioContext, out: GainNode): Promise<boolean> {
    try {
      const response = await fetch(AMBIENT_URL);
      if (!response.ok) return false;
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(out);
      source.start();
      return true;
    } catch {
      return false;
    }
  }

  // Ethereal drone: detuned low sines + a soft fifth + filtered noise
  // "air", breathing on a very slow LFO.
  private startProceduralAmbient(ctx: AudioContext, out: GainNode): void {
    const droneBus = ctx.createGain();
    droneBus.gain.value = 0.5;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 320;
    droneBus.connect(lowpass).connect(out);

    const voices: Array<[number, number]> = [
      [65.41, 0.5], // C2
      [65.74, 0.5], // detuned pair — slow beating
      [98.0, 0.22], // fifth
      [130.81, 0.1], // octave shimmer
    ];
    for (const [frequency, level] of voices) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const gain = ctx.createGain();
      gain.gain.value = level;
      osc.connect(gain).connect(droneBus);
      osc.start();
    }

    // Air: looped noise through a gentle band of its own.
    const noiseSeconds = 4;
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * noiseSeconds, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 480;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.045;
    noise.connect(noiseFilter).connect(noiseGain).connect(out);
    noise.start();

    // Breathing: ±20% swell over ~20s.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.1;
    lfo.connect(lfoDepth).connect(droneBus.gain);
    lfo.start();
  }
}
