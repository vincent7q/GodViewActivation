const VISIBLE_MS = 4500;

// Journey-only caption naming the country below the camera. Never shown
// during free exploration.
export class CountryCaption {
  private readonly el: HTMLDivElement;
  private hideTimer: number | undefined;

  constructor(root: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'country-caption';
    root.appendChild(this.el);
  }

  show(name: string): void {
    this.el.textContent = name;
    this.el.classList.add('country-caption-visible');
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.hide(), VISIBLE_MS);
  }

  hide(): void {
    window.clearTimeout(this.hideTimer);
    this.el.classList.remove('country-caption-visible');
  }
}
