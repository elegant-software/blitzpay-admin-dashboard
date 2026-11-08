import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { EMPTY, of, switchMap } from 'rxjs';
import { StorefrontMerchant, StorefrontThemeLook } from '../models/storefront.models';
import { StorefrontApiService } from './storefront-api.service';

const THEME_CODE = /^[A-Z][A-Z0-9_]{1,31}$/;
const TOKEN_KEY = /^[a-z][a-z-]{0,31}$/;
const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Applies the merchant's storefront theme (picked in the admin dashboard): its colours as `--storefront-*`
 * variables and its layout as `data-storefront-style` on <html>. `?previewTheme=CODE` on the first page
 * overrides the merchant's theme for this tab, so admins can review a draft before merchants get it.
 */
@Injectable({ providedIn: 'root' })
export class StorefrontBrandService {
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(StorefrontApiService);
  private readonly previewCode = this.readPreviewCode();
  private requested: string | null = null;
  /** The merchant whose pages are open; null on the entry page or until it loads. */
  readonly merchant = signal<StorefrontMerchant | null>(null);
  /** The applied theme; null means the neutral storefront look. */
  readonly look = signal<StorefrontThemeLook | null>(null);
  /** Layout name such as `classic`; null means the neutral storefront look. */
  readonly theme = computed(() => this.look()?.style.toLowerCase() ?? null);

  constructor() {
    const router = inject(Router);
    const root = this.document.documentElement;
    const tokens = this.document.createElement('style');
    tokens.id = 'storefront-theme-tokens';
    this.document.head.appendChild(tokens);
    effect(() => {
      const look = this.look();
      if (look) root.setAttribute('data-storefront-style', look.style.toLowerCase());
      else root.removeAttribute('data-storefront-style');
      tokens.textContent = look ? tokenCss(look) : '';
    });
    this.forRoute(router.url);
    router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationStart) this.forRoute(event.url);
    });
    inject(DestroyRef).onDestroy(() => { root.removeAttribute('data-storefront-style'); tokens.remove(); });
  }

  // ponytail: pages that also load the merchant make a second GET; share the page's merchant if it ever matters.
  useMerchant(merchantId: string | null | undefined): void {
    const id = merchantId || null;
    if (id === this.requested) return;
    this.requested = id;
    this.merchant.set(null);
    this.look.set(null);
    if (!id) return;
    this.api.getMerchant(id).pipe(switchMap(merchant => {
      if (this.requested !== id) return EMPTY;
      this.merchant.set(merchant);
      const code = this.previewCode ?? merchant.storefrontTheme;
      return code && code !== 'DEFAULT' ? this.api.getStorefrontTheme(code) : of(null);
    })).subscribe({
      next: look => { if (this.requested === id) this.look.set(look); },
      error: () => undefined // the neutral look is a safe fallback
    });
  }

  private forRoute(url: string): void {
    this.useMerchant(/^\/m\/([^/?#]+)\//.exec(url)?.[1]);
  }

  private readPreviewCode(): string | null {
    const code = new URLSearchParams(this.document.location?.search ?? '').get('previewTheme');
    return code && THEME_CODE.test(code) ? code : null;
  }
}

/**
 * CSS for the theme colours. The backend only stores `#rrggbb` values for known keys; re-checked here
 * because the text goes into a style sheet. Light colours skip dark mode, which falls back to the
 * neutral dark palette unless the theme sets its own.
 */
export function tokenCss(look: StorefrontThemeLook): string {
  const block = (selector: string, colours: Record<string, string> | undefined) => {
    const declarations = Object.entries(colours ?? {})
      .filter(([key, value]) => TOKEN_KEY.test(key) && HEX.test(value))
      .map(([key, value]) => `--storefront-${key}: ${value};`);
    return declarations.length ? `${selector} { ${declarations.join(' ')} }` : '';
  };
  return [
    block(':root:not([data-theme="dark"])', look.tokens.light),
    block(':root[data-theme="dark"]', look.tokens.dark)
  ].filter(Boolean).join('\n');
}
