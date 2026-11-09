import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { StorefrontUiService } from '../services/storefront-ui.service';
import { StorefrontLanguageService } from '../services/storefront-language.service';
import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';

@Component({
  selector: 'web-language-switcher', standalone: true,
  imports: [CommonModule, StorefrontTranslatePipe], host: { dir: 'ltr' },
  template: `
    <button #trigger type="button" class="language-toggle" aria-haspopup="menu" [attr.aria-expanded]="open"
      [attr.aria-label]="'Change language' | storefrontTranslate" (click)="open = !open" (keydown.arrowdown)="show($event)">
      <img *ngIf="selected.flagCode" [src]="'/flags/' + selected.flagCode.toLowerCase() + '.svg'" alt="" width="20" height="15" />
      <span>{{ ui.code().toUpperCase() }}</span><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div *ngIf="open" class="language-menu" role="menu" [attr.aria-label]="'Language' | storefrontTranslate" (keydown)="move($event)">
      <button *ngFor="let language of ui.languages()" type="button" role="menuitemradio" [attr.aria-checked]="ui.code() === language.code" (click)="select(language.code)">
        <img *ngIf="language.flagCode" [src]="'/flags/' + language.flagCode.toLowerCase() + '.svg'" alt="" width="20" height="15" />
        <span [lang]="language.code" dir="auto">{{ language.nativeName }}</span><span *ngIf="ui.code() === language.code" aria-hidden="true">✓</span>
      </button>
      <button *ngIf="ui.failed()" type="button" (click)="ui.load()">{{ 'Retry languages' | storefrontTranslate }}</button>
    </div>
  `,
  styles: `:host{position:relative;display:block;direction:ltr;flex-shrink:0}button{font:inherit;cursor:pointer;color:var(--storefront-ink)}.language-toggle{display:flex;align-items:center;gap:.4rem;min-height:44px;border:1px solid var(--storefront-stroke);border-radius:999px;background:var(--storefront-surface);padding:.5rem .7rem;font-weight:650;font-size:.78rem}.language-menu{position:absolute;right:0;top:calc(100% + .5rem);min-width:12rem;padding:.35rem;background:var(--storefront-surface);border:1px solid var(--storefront-stroke);border-radius:.85rem;box-shadow:0 10px 35px #0002;z-index:20}.language-menu button{display:flex;align-items:center;gap:.65rem;width:100%;min-height:44px;border:0;border-radius:.5rem;background:transparent;padding:.65rem;text-align:start}.language-menu button:hover,.language-menu button[aria-checked=true]{background:var(--storefront-mint)}button:focus-visible{outline:3px solid var(--storefront-action);outline-offset:2px}img{object-fit:cover;border-radius:2px}`
})
export class LanguageSwitcherComponent {
  readonly ui = inject(StorefrontUiService);
  private readonly language = inject(StorefrontLanguageService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;
  open = false;
  get selected() { return this.ui.languages().find(language => language.code === this.ui.code()) ?? this.ui.languages()[0]; }
  select(code: string): void { this.language.choose(code); this.open = false; this.trigger?.nativeElement.focus(); }
  show(event: Event): void { event.preventDefault(); this.open = true; queueMicrotask(() => this.host.nativeElement.querySelector<HTMLButtonElement>('[role=menuitemradio][aria-checked=true]')?.focus()); }
  move(event: KeyboardEvent): void {
    const buttons = [...this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[role=menu] button')];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') { event.preventDefault(); this.open = false; this.trigger?.nativeElement.focus(); }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
    } else if (event.key === 'Tab') this.open = false;
  }
  @HostListener('document:click', ['$event']) outside(event: MouseEvent): void { if (!this.host.nativeElement.contains(event.target as Node)) this.open = false; }
  @HostListener('keydown.escape', ['$event']) escape(event: KeyboardEvent): void {
    if (!this.open) return;
    event.preventDefault(); this.open = false; this.trigger?.nativeElement.focus();
  }
}
