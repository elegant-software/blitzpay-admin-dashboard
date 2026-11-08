import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { STOREFRONT_TRANSLATIONS } from '../i18n/storefront-translations';

export interface StorefrontLanguage {
  code: string; displayName: string; nativeName: string; flagCode: string | null;
  direction: 'rtl' | 'ltr';
}
const ENGLISH: StorefrontLanguage = { code: 'en', displayName: 'English', nativeName: 'English', flagCode: 'GB', direction: 'ltr' };

/** UI preference is independent of a merchant's source/translation language settings. */
@Injectable({ providedIn: 'root' })
export class StorefrontUiService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly document = inject(DOCUMENT);
  readonly code = signal(this.savedLanguage());
  readonly languages = signal<StorefrontLanguage[]>([ENGLISH]);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly ready = signal(false);
  private loaded = false;

  load(): void {
    if (this.loaded || this.loading() || !this.http) return;
    this.loading.set(true);
    this.failed.set(false);
    this.http.get<StorefrontLanguage[]>(`${environment.apiBaseUrl.replace(/\/$/, '')}/${environment.apiVersion}/storefront/languages`).subscribe({
      next: languages => {
        const available = languages.filter(language => (language.code === 'en' || !!STOREFRONT_TRANSLATIONS[language.code]) &&
          ['ltr', 'rtl'].includes(language.direction) && /^[a-z]{2}$/.test(language.code) && /^[A-Z]{2}$/.test(language.flagCode ?? ''));
        this.languages.set(available.length ? available : [ENGLISH]);
        this.loaded = available.length > 0;
        this.failed.set(!available.length);
        this.loading.set(false);
        if (!available.some(language => language.code === this.code())) this.code.set('en');
        this.ready.set(true);
      },
      error: () => { this.loading.set(false); this.failed.set(true); this.code.set('en'); this.ready.set(true); }
    });
  }

  select(code: string): void {
    if (code !== 'en' && !STOREFRONT_TRANSLATIONS[code]) return;
    this.code.set(code);
    try { this.document.defaultView?.sessionStorage.setItem('blitzpay.storefront-ui-language', code); } catch { /* Memory still works. */ }
  }

  get direction(): 'rtl' | 'ltr' {
    return this.languages().find(language => language.code === this.code())?.direction ?? 'ltr';
  }

  text(source: string | null | undefined, values: readonly unknown[] = []): string {
    if (source == null) return '';
    const key = source.replace(/\s+/g, ' ').trim();
    const translation = STOREFRONT_TRANSLATIONS[this.code()]?.[key] ?? source;
    return translation.replace(/\{(\d+)\}/g, (placeholder, index) => {
      if (Number(index) >= values.length) return placeholder;
      const value = String(values[Number(index)] ?? '');
      return this.code() === 'ar' ? `\u2068${value}\u2069` : value;
    });
  }

  private savedLanguage(): string {
    try {
      const saved = this.document.defaultView?.sessionStorage.getItem('blitzpay.storefront-ui-language');
      return saved && (saved === 'en' || STOREFRONT_TRANSLATIONS[saved]) ? saved : 'en';
    } catch { return 'en'; }
  }
}
