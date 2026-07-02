import type { Quote } from '../godview/quotes';

const HOLD_MS = 8000;

export class QuoteOverlay {
  private readonly container: HTMLDivElement;
  private readonly textEl: HTMLParagraphElement;
  private readonly authorEl: HTMLParagraphElement;
  private hideTimer: number | undefined;

  constructor(root: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'quote';
    this.textEl = document.createElement('p');
    this.textEl.className = 'quote-text';
    this.authorEl = document.createElement('p');
    this.authorEl.className = 'quote-author';
    this.container.append(this.textEl, this.authorEl);
    root.appendChild(this.container);
  }

  /** Fades the quote in, holds, fades out. */
  show(quote: Quote): void {
    this.textEl.textContent = `“${quote.text}”`;
    this.authorEl.textContent = `— ${quote.author}`;
    this.container.classList.add('quote-visible');
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.hide(), HOLD_MS);
  }

  hide(): void {
    window.clearTimeout(this.hideTimer);
    this.container.classList.remove('quote-visible');
  }
}
