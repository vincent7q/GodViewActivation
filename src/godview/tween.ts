export type EasingFn = (t: number) => number;

export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export interface TweenOptions {
  easing?: EasingFn;
  onComplete?: () => void;
}

// Frame-driven tween: call update(dt) each frame; onUpdate receives the
// eased 0→1 value. Deliberately tiny — no animation library needed.
export class Tween {
  private elapsed = 0;
  private completed = false;
  private readonly easing: EasingFn;
  private readonly onComplete?: () => void;

  constructor(
    private readonly duration: number,
    private readonly onUpdate: (value: number) => void,
    options: TweenOptions = {},
  ) {
    this.easing = options.easing ?? easeInOutCubic;
    this.onComplete = options.onComplete;
  }

  update(dt: number): boolean {
    if (this.completed) return true;

    this.elapsed = Math.min(this.elapsed + dt, this.duration);
    const progress = this.duration === 0 ? 1 : this.elapsed / this.duration;
    this.onUpdate(this.easing(progress));

    if (progress >= 1) {
      this.completed = true;
      this.onComplete?.();
    }
    return this.completed;
  }
}
