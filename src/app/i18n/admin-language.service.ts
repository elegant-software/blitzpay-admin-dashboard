import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { AdminUiLanguage } from './admin-language.models';
import { AdminLocaleService } from './admin-locale.service';
import { ADMIN_PRIME_LOCALES } from './admin-prime-locales';
import { ADMIN_TRANSLATIONS } from './admin-translations';
import LANGUAGES from './languages.json';

const PREFERENCE = 'blitzpay.admin-language';
/** Interface languages ship with the dashboard (./languages.json + ./messages); the backend is not asked. */
const SHIPPED = (LANGUAGES as AdminUiLanguage[]).filter(l => Object.hasOwn(ADMIN_TRANSLATIONS, l.code));
const ENGLISH = SHIPPED.find(l => l.code === 'en')!;

@Injectable({ providedIn: 'root' })
export class AdminLanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly locale = inject(AdminLocaleService);
  private readonly prime = inject(PrimeNG);
  private readonly defaultPrimeTranslation = this.prime.translation;
  private readonly active = signal(ENGLISH);
  private inDashboard = false;
  readonly languages = signal(SHIPPED).asReadonly();
  readonly selected = this.active.asReadonly();

  /** Entering the dashboard: apply the saved interface language. */
  load(): void {
    this.inDashboard = true;
    let saved: string | null = null;
    try { saved = this.document.defaultView?.localStorage.getItem(PREFERENCE) ?? null; } catch { /* Storage may be disabled. */ }
    this.apply(SHIPPED.find(l => l.code === saved) ?? SHIPPED.find(l => l.code === this.locale.code()) ?? ENGLISH);
  }

  select(code: string): void {
    const language = SHIPPED.find(l => l.code === code);
    if (!language) return;
    this.apply(language);
    try { this.document.defaultView?.localStorage.setItem(PREFERENCE, code); } catch { /* Selection still works in memory. */ }
  }

  text(source: string): string {
    return this.locale.text(source);
  }

  leaveDashboard(): void {
    this.inDashboard = false;
    this.locale.use('en');
    this.prime.setTranslation(this.defaultPrimeTranslation);
    this.document.documentElement.lang = 'en';
    this.document.documentElement.dir = 'ltr';
  }

  private apply(language: AdminUiLanguage): void {
    this.active.set(language);
    if (!this.inDashboard) return;
    this.locale.use(language.code);
    const translation = ADMIN_PRIME_LOCALES[language.code];
    this.prime.setTranslation({ ...this.defaultPrimeTranslation, ...translation,
      aria: { ...this.defaultPrimeTranslation.aria, ...translation?.aria } });
    this.document.documentElement.lang = language.code;
    this.document.documentElement.dir = language.direction;
  }
}
