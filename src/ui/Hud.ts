const IDLE_FADE_MS = 5000;

// Minimal, reverent HUD: one GodView button, one mute button. Fades out
// when idle; hides entirely while GodView is on.
export class Hud {
  private readonly container: HTMLDivElement;
  private readonly godViewButton: HTMLButtonElement;
  private readonly muteButton: HTMLButtonElement;
  private idleTimer: number | undefined;

  constructor(root: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'hud';

    this.godViewButton = document.createElement('button');
    this.godViewButton.className = 'hud-godview';
    this.godViewButton.type = 'button';
    this.godViewButton.textContent = 'Turn on GodView';
    this.godViewButton.setAttribute('aria-label', 'Toggle GodView');

    this.muteButton = document.createElement('button');
    this.muteButton.className = 'hud-mute';
    this.muteButton.type = 'button';
    this.muteButton.textContent = '🔊';
    this.muteButton.setAttribute('aria-label', 'Mute audio');

    this.container.append(this.godViewButton, this.muteButton);
    root.appendChild(this.container);

    for (const event of ['pointermove', 'pointerdown', 'keydown'] as const) {
      window.addEventListener(event, this.wake);
    }
    this.wake();
  }

  onGodView(handler: () => void): void {
    this.godViewButton.addEventListener('click', handler);
  }

  onMute(handler: () => void): void {
    this.muteButton.addEventListener('click', handler);
  }

  setMuted(muted: boolean): void {
    this.muteButton.textContent = muted ? '🔇' : '🔊';
    this.muteButton.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
  }

  /** While GodView is on the HUD disappears completely — pure view. */
  setGodViewActive(active: boolean): void {
    this.container.classList.toggle('hud-gone', active);
    this.godViewButton.textContent = active ? 'Return' : 'Turn on GodView';
  }

  private wake = (): void => {
    this.container.classList.remove('hud-idle');
    window.clearTimeout(this.idleTimer);
    this.idleTimer = window.setTimeout(
      () => this.container.classList.add('hud-idle'),
      IDLE_FADE_MS,
    );
  };
}
