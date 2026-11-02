import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

type StorefrontTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class StorefrontThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'blitzpay.storefront-theme';
  private readonly device = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  private preference = this.read();
  private readonly current = signal<StorefrontTheme>(this.preference ?? (this.device?.matches ? 'dark' : 'light'));
  readonly theme = this.current.asReadonly();

  constructor() {
    const previous = this.document.documentElement.getAttribute('data-theme');
    this.apply();
    const onDeviceChange = (event: MediaQueryListEvent) => {
      if (this.preference) return;
      this.current.set(event.matches ? 'dark' : 'light');
      this.apply();
    };
    this.device?.addEventListener('change', onDeviceChange);
    inject(DestroyRef).onDestroy(() => {
      this.device?.removeEventListener('change', onDeviceChange);
      if (previous === null) this.document.documentElement.removeAttribute('data-theme');
      else this.document.documentElement.setAttribute('data-theme', previous);
    });
  }

  toggle(): void {
    this.preference = this.current() === 'dark' ? 'light' : 'dark';
    this.current.set(this.preference);
    this.apply();
    try { localStorage.setItem(this.storageKey, this.preference); } catch { /* Theme works without storage. */ }
  }

  private apply(): void {
    this.document.documentElement.setAttribute('data-theme', this.current());
  }

  private read(): StorefrontTheme | null {
    try {
      const value = localStorage.getItem(this.storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch { return null; }
  }
}
