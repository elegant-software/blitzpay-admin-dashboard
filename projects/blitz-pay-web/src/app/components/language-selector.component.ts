import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { StorefrontLanguageService, flagUrl, nativeLanguageName } from '../services/storefront-language.service';

/** Header flag menu for the merchant's menu languages; mirrors the admin dashboard's language selector. */
@Component({
  selector: 'web-language-selector',
  standalone: true,
  host: { dir: 'ltr' },
  imports: [CommonModule],
  template: `
    <button #trigger class="language-trigger" type="button" data-testid="catalog-language"
      [attr.aria-label]="'Menu language: ' + name(active)" [attr.title]="name(active)"
      aria-haspopup="menu" [attr.aria-expanded]="open" (click)="open = !open" (keydown.arrowdown)="show($event)">
      <img [src]="flag(active)" alt="" width="20" height="15" (error)="hide($event)" />
      <span class="language-code">{{ active | uppercase }}</span>
      <svg class="language-chevron" [class.is-open]="open" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
    </button>
    <div *ngIf="open" class="language-menu" role="menu" aria-label="Menu language" (keydown)="onKeydown($event)">
      <button *ngFor="let code of languages" type="button" role="menuitemradio" [attr.data-language]="code"
        [attr.aria-checked]="code === active" (click)="choose(code)">
        <img [src]="flag(code)" alt="" width="22" height="16" (error)="hide($event)" />
        <span [attr.lang]="code" dir="auto">{{ name(code) }}</span>
        <span *ngIf="code === active" class="language-check" aria-hidden="true">✓</span>
      </button>
    </div>
  `,
  styles: `
    :host { position: relative; display: inline-flex; flex-shrink: 0; direction: ltr; }
    button { font: inherit; color: inherit; cursor: pointer; }
    .language-trigger {
      display: inline-flex; align-items: center; gap: .375rem; height: 44px; padding: 0 .7rem;
      border: 1px solid var(--storefront-stroke); border-radius: 999px; background: var(--storefront-bg); color: var(--storefront-ink);
    }
    .language-trigger:hover, .language-trigger[aria-expanded=true] { border-color: var(--storefront-muted); }
    .language-code { font-size: .75rem; font-weight: 700; letter-spacing: .025em; }
    .language-chevron { width: 12px; height: 12px; fill: none; stroke: var(--storefront-muted); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; transition: transform .15s ease; }
    .language-chevron.is-open { transform: rotate(180deg); }
    @media (prefers-reduced-motion: reduce) { .language-chevron { transition: none; } }
    button:focus-visible { outline: 3px solid var(--storefront-primary); outline-offset: 2px; }
    img { object-fit: cover; border-radius: 2px; border: 1px solid #0002; flex: none; }
    .language-menu {
      position: absolute; inset-inline-end: 0; top: calc(100% + .4rem); min-width: 13rem; max-width: min(20rem, 85vw);
      max-height: min(20rem, 60vh); overflow-y: auto; padding: .35rem; z-index: 1100;
      border: 1px solid var(--storefront-stroke); border-radius: .85rem; background: var(--storefront-surface); color: var(--storefront-ink);
      box-shadow: 0 14px 36px rgb(18 35 42 / 16%);
    }
    .language-menu button { display: flex; align-items: center; gap: .6rem; width: 100%; min-height: 44px; text-align: start; border: 0; border-radius: .55rem; padding: .55rem .65rem; background: transparent; }
    .language-menu button:hover, [aria-checked=true] { background: var(--storefront-bg); }
    [aria-checked=true] { font-weight: 700; }
    .language-check { margin-inline-start: auto; color: var(--storefront-primary); }
  `
})
export class LanguageSelectorComponent {
  @Input({ required: true }) languages: string[] = [];
  private readonly language = inject(StorefrontLanguageService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;
  open = false;

  /** The chosen language, else the merchant's original (always first). */
  get active(): string {
    const current = this.language.language;
    return current && this.languages.includes(current) ? current : this.languages[0];
  }

  name(code: string): string { return nativeLanguageName(code); }
  flag(code: string): string { return flagUrl(code); }
  // ponytail: only de/gb/sa flags ship; a missing SVG hides itself and the code/name still shows.
  hide(event: Event): void { (event.target as HTMLElement).style.visibility = 'hidden'; }

  show(event: Event): void {
    event.preventDefault();
    this.open = true;
    setTimeout(() => this.buttons()[Math.max(this.languages.indexOf(this.active), 0)]?.focus());
  }

  choose(code: string): void {
    this.close();
    if (code !== this.active) this.language.choose(code);
  }

  onKeydown(event: KeyboardEvent): void {
    const buttons = this.buttons();
    const index = buttons.indexOf(this.element.nativeElement.ownerDocument.activeElement as HTMLButtonElement);
    let next: number;
    if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else if (event.key === 'Tab') { this.open = false; return; }
    else return;
    event.preventDefault();
    buttons[next]?.focus();
  }

  @HostListener('document:keydown.escape') close(): void {
    if (!this.open) return;
    this.open = false;
    this.trigger?.nativeElement.focus();
  }

  @HostListener('document:click', ['$event']) outside(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.open = false;
  }

  private buttons(): HTMLButtonElement[] {
    return Array.from(this.element.nativeElement.querySelectorAll<HTMLButtonElement>('.language-menu button'));
  }
}
