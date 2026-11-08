import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { apiErrorMessage } from '../notifications/notification.service';
import { AdminUiLanguage } from './admin-language.models';
import { ADMIN_TRANSLATIONS } from './admin-translations';
import { AdminLocaleService } from './admin-locale.service';
import { PrimeNG } from 'primeng/config';
import { ADMIN_PRIME_LOCALES } from './admin-prime-locales';

const ENGLISH: AdminUiLanguage = { code: 'en', displayName: 'English', nativeName: 'English', flagCode: 'GB', direction: 'ltr' };
const PREFERENCE = 'blitzpay.admin-language';

@Injectable({ providedIn: 'root' })
export class AdminLanguageService {
  private readonly api = inject(MerchantApiService);
  private readonly document = inject(DOCUMENT);
  private readonly locale = inject(AdminLocaleService);
  private readonly prime = inject(PrimeNG);
  private readonly defaultPrimeTranslation = this.prime.translation;
  private readonly available = signal<AdminUiLanguage[]>([]);
  private readonly active = signal(ENGLISH);
  private readonly busy = signal(false);
  private readonly failure = signal('');
  private inDashboard = false;
  readonly languages = this.available.asReadonly();
  readonly selected = this.active.asReadonly();
  readonly loading = this.busy.asReadonly();
  readonly error = this.failure.asReadonly();

  load(): void {
    this.inDashboard = true;
    if (this.available().length) { this.apply(this.active()); return; }
    if (this.busy()) return;
    this.busy.set(true);
    this.failure.set('');
    this.api.getLanguages(getEnvironmentByKey(environment.defaultEnvironmentKey), 'v1').subscribe({
      next: languages => {
        // Only offer languages whose interface bundles are shipped in this client.
        const supported = languages.filter(l => l.adminUiEnabled && (l.code === 'en' || Object.hasOwn(ADMIN_TRANSLATIONS, l.code))
          && /^(ltr|rtl)$/.test(l.direction) && /^[A-Z]{2}$/.test(l.flagCode ?? ''))
          .map(l => ({ ...l, flagCode: l.flagCode! }));
        this.available.set(supported);
        this.busy.set(false);
        if (!supported.length) {
          this.failure.set('No interface languages are available. English is being used.');
          this.apply(ENGLISH);
          return;
        }
        let saved: string | null = null;
        try { saved = this.document.defaultView?.localStorage.getItem(PREFERENCE) ?? null; } catch { /* Storage may be disabled. */ }
        this.apply(supported.find(l => l.code === saved) ?? supported.find(l => l.code === 'en') ?? supported[0]);
      },
      error: error => {
        this.busy.set(false);
        this.failure.set(apiErrorMessage(error, 'Could not load languages. English is being used.'));
        this.apply(ENGLISH);
      }
    });
  }

  select(code: string): void {
    const language = this.available().find(l => l.code === code);
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
