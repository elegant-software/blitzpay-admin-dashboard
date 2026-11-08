import { Injectable, effect, inject, signal } from '@angular/core';
import { StorefrontUiService } from './storefront-ui.service';
import { StorefrontMerchant } from '../models/storefront.models';

const INTERNATIONAL_MENU = 'INTERNATIONAL_MENU';

/** The shopper's explicitly chosen catalog language, kept for the browsing session. */
@Injectable({ providedIn: 'root' })
export class StorefrontLanguageService {
  private readonly ui = inject(StorefrontUiService);
  readonly changes = signal(0);
  private merchant: StorefrontMerchant | null = null;
  private readonly storageKey = 'blitzpay.storefront-language';
  private chosen: string | null = this.read();
  private resolved: string | null = null;
  private readonly followUiPreference = effect(() => {
    const code = this.ui.code();
    if (this.ui.ready() && code !== this.chosen) this.choose(code);
  });

  get language(): string | null {
    return this.resolved ?? this.chosen;
  }

  /** Resolve the merchant default before requesting menu text; only explicit choices are persisted. */
  resolve(merchant: StorefrontMerchant): string | null {
    this.merchant = merchant;
    const original = merchant.originalMenuLanguage ?? merchant.originalLanguage ?? null;
    const offered = catalogLanguages(merchant);
    this.resolved = this.chosen && offered.includes(this.chosen) ? this.chosen : original;
    return this.language;
  }

  get direction(): 'rtl' | 'ltr' {
    return this.ui.direction;
  }

  choose(language: string): void {
    this.chosen = language;
    this.resolved = language;
    if (this.merchant) this.resolve(this.merchant);
    this.ui.select(language);
    this.changes.update(value => value + 1);
    try {
      sessionStorage.setItem(this.storageKey, language);
    } catch {
      // Storage may be unavailable (private mode); the choice still applies to this page.
    }
  }

  private read(): string | null {
    try {
      return sessionStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }
}

/** Menu languages are defined by the merchant, not by client-side translations. */
export function catalogLanguages(merchant: StorefrontMerchant | null | undefined): string[] {
  const original = merchant?.originalMenuLanguage ?? merchant?.originalLanguage;
  if (!original || !merchant?.offerings?.includes(INTERNATIONAL_MENU)) return [];
  return [...new Set([original, ...(merchant.supportedMenuLanguages ?? [])])];
}

/** A language's name in that language, e.g. "Deutsch" for `de`. */
export function nativeLanguageName(code: string): string {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code;
    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    return code.toUpperCase();
  }
}
