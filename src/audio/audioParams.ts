export const AMBIENT_GAIN = 0.3;
export const AMBIENT_AWE_GAIN = 0.42;
export const BINAURAL_GAIN = 0.05;
export const BINAURAL_LEFT_HZ = 200;
export const BINAURAL_RIGHT_HZ = 210;
export const CROSSFADE_SECONDS = 4;

export type AudioMood = 'exploring' | 'godview';

export interface GainTargets {
  ambient: number;
  binaural: number;
}

export function gainTargets(mood: AudioMood, muted: boolean): GainTargets {
  if (muted) return { ambient: 0, binaural: 0 };
  return mood === 'godview'
    ? { ambient: AMBIENT_AWE_GAIN, binaural: BINAURAL_GAIN }
    : { ambient: AMBIENT_GAIN, binaural: 0 };
}
