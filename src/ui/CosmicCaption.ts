import type { CosmicStageSpec } from '../godview/cosmicStages';

// Chapter card for the cosmic zoom-out: bilingual title + the owner's
// description. Sits top-center so the quote overlay (bottom) stays clear.
export class CosmicCaption {
  private readonly container: HTMLDivElement;
  private readonly titleEl: HTMLParagraphElement;
  private readonly descEl: HTMLParagraphElement;
  private hideTimer: number | undefined;

  constructor(root: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'cosmic-caption';
    this.titleEl = document.createElement('p');
    this.titleEl.className = 'cosmic-caption-title';
    this.descEl = document.createElement('p');
    this.descEl.className = 'cosmic-caption-desc';
    this.container.append(this.titleEl, this.descEl);
    root.appendChild(this.container);
  }

  /** Shows the card; stays until replaced or hidden unless autoHideMs set. */
  show(stage: CosmicStageSpec, autoHideMs?: number): void {
    this.titleEl.textContent = `${stage.nameZh} · ${stage.nameEn}`;
    this.descEl.textContent = stage.description;
    this.container.classList.add('cosmic-caption-visible');
    window.clearTimeout(this.hideTimer);
    if (autoHideMs) {
      this.hideTimer = window.setTimeout(() => this.hide(), autoHideMs);
    }
  }

  hide(): void {
    window.clearTimeout(this.hideTimer);
    this.container.classList.remove('cosmic-caption-visible');
  }
}
