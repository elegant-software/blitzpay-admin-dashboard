import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { AdminLanguageService } from './admin-language.service';
import { AdminTranslatePipe } from './admin-translate.pipe';

@Component({
  selector: 'app-language-selector', standalone: true,
  host: { dir: 'ltr' },
  imports: [CommonModule, AdminTranslatePipe],
  template: `
    <button #trigger class="language-trigger" type="button"
      [attr.aria-label]="('Language' | adminTranslate) + ': ' + language.selected().nativeName"
      [attr.title]="language.selected().nativeName"
      aria-haspopup="menu" [attr.aria-expanded]="open" (click)="toggle()" (keydown.arrowdown)="show($event)">
      <img [src]="flagUrl(language.selected().flagCode)" alt="" width="20" height="15" />
      <span class="language-code" dir="ltr">{{ language.selected().code | uppercase }}</span>
      <svg class="language-chevron" [class.is-open]="open" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
        <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div *ngIf="open" class="language-menu" role="menu" [attr.aria-label]="'Language' | adminTranslate" (keydown)="onKeydown($event)">
      <button *ngFor="let item of language.languages()" type="button" role="menuitemradio"
        [attr.aria-checked]="item.code === language.selected().code" (click)="choose(item.code)">
        <img [src]="flagUrl(item.flagCode)" alt="" width="22" height="16" />
        <span [attr.lang]="item.code" dir="auto">{{ item.nativeName }}</span>
        <span *ngIf="item.code === language.selected().code" aria-hidden="true">✓</span>
      </button>
    </div>
  `,
  styles: `
    :host { position: relative; display: inline-flex; flex-shrink: 0; direction: ltr; }
    button { font: inherit; color: inherit; cursor: pointer; }
    .language-trigger {
      display: inline-flex; align-items: center; justify-content: center; gap: .375rem;
      height: 2.25rem; padding: 0 .5rem;
      border: 1px solid var(--cui-border-color, #d8dbe0); border-radius: .65rem;
      background: transparent; color: var(--cui-body-color, #17243b);
      transition: background-color .15s ease, border-color .15s ease;
    }
    .language-trigger:hover, .language-trigger[aria-expanded=true] {
      background: var(--cui-tertiary-bg, #f3f4f6);
      border-color: var(--cui-secondary-color, #6b7280);
    }
    .language-code { font-size: .75rem; font-weight: 600; line-height: 1; letter-spacing: .025em; }
    .language-chevron { flex: none; color: var(--cui-secondary-color, #6b7280); transition: transform .15s ease; }
    .language-chevron.is-open { transform: rotate(180deg); }
    @media (prefers-reduced-motion: reduce) { .language-trigger, .language-chevron { transition: none; } }
    button:focus-visible { outline: 3px solid #8875ff; outline-offset: 2px; }
    img { object-fit: cover; border-radius: 2px; border: 1px solid #0002; flex: none; }
    .language-menu { position: absolute; inset-inline-end: 0; top: calc(100% + .4rem); min-width: 13rem; max-width: min(20rem, 85vw); border: 1px solid var(--cui-border-color, #d8dbe0); border-radius: .75rem; background: var(--cui-body-bg, white); color: var(--cui-body-color, #17243b); box-shadow: 0 .5rem 1.5rem #0002; padding: .35rem; z-index: 1100; }
    .language-menu button { display: flex; align-items: center; gap: .6rem; width: 100%; text-align: start; border: 0; border-radius: .4rem; padding: .65rem; background: transparent; }
    .language-menu button:hover, [aria-checked=true] { background: var(--cui-tertiary-bg, #f3f4f6); }
  `
})
export class LanguageSelectorComponent implements OnInit {
  readonly language = inject(AdminLanguageService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;
  open = false;
  ngOnInit(): void { this.language.load(); }
  flagUrl(country: string): string { return `/flags/${country.toLowerCase()}.svg`; }
  toggle(): void { this.open = !this.open; }
  show(event: Event): void {
    event.preventDefault(); this.open = true;
    setTimeout(() => this.buttons()[0]?.focus());
  }
  choose(code: string): void { this.language.select(code); this.close(); }
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
    event.preventDefault(); buttons[next]?.focus();
  }
  @HostListener('document:keydown.escape') close(): void {
    if (!this.open) return;
    this.open = false; this.trigger?.nativeElement.focus();
  }
  @HostListener('document:click', ['$event']) outside(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.open = false;
  }
  private buttons(): HTMLButtonElement[] {
    return Array.from(this.element.nativeElement.querySelectorAll<HTMLButtonElement>('.language-menu button'));
  }
}
