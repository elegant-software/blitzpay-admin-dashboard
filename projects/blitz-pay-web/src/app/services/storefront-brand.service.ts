import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { StorefrontMerchant } from '../models/storefront.models';
import { StorefrontApiService } from './storefront-api.service';

/** Applies the merchant's own storefront theme (set in the admin dashboard) as `data-storefront-theme` on <html>. */
@Injectable({ providedIn: 'root' })
export class StorefrontBrandService {
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(StorefrontApiService);
  private requested: string | null = null;
  /** The merchant whose pages are open; null on the entry page or until it loads. */
  readonly merchant = signal<StorefrontMerchant | null>(null);
  /** CSS preset name such as `heritage`; null means the neutral storefront look. */
  readonly theme = computed(() => {
    const theme = this.merchant()?.storefrontTheme;
    return theme && theme !== 'DEFAULT' ? theme.toLowerCase() : null;
  });

  constructor() {
    const router = inject(Router);
    const root = this.document.documentElement;
    effect(() => {
      const theme = this.theme();
      if (theme) root.setAttribute('data-storefront-theme', theme);
      else root.removeAttribute('data-storefront-theme');
    });
    this.forRoute(router.url);
    router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationStart) this.forRoute(event.url);
    });
    inject(DestroyRef).onDestroy(() => root.removeAttribute('data-storefront-theme'));
  }

  // ponytail: pages that also load the merchant make a second GET; share the page's merchant if it ever matters.
  useMerchant(merchantId: string | null | undefined): void {
    const id = merchantId || null;
    if (id === this.requested) return;
    this.requested = id;
    this.merchant.set(null);
    if (!id) return;
    this.api.getMerchant(id).subscribe({
      next: merchant => { if (this.requested === id) this.merchant.set(merchant); },
      error: () => undefined // the neutral look is a safe fallback
    });
  }

  private forRoute(url: string): void {
    this.useMerchant(/^\/m\/([^/?#]+)\//.exec(url)?.[1]);
  }
}
