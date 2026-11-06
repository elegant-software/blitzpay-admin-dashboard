import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';

// Explicit merchant identity, not a display-name match. Other merchants retain their own branding.
export const BONA_ME_MERCHANT_ID = '8ff7bcf5-e52c-4c25-877e-a32cfc81ea46';
export const BONA_ME_LOGO = '/bona-me-logo.png';

@Injectable({ providedIn: 'root' })
export class StorefrontBrandService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal(true);
  readonly isBonaMe = this.current.asReadonly();
  readonly logoUrl = BONA_ME_LOGO;

  constructor() {
    const router = inject(Router);
    const previous = this.document.documentElement.getAttribute('data-storefront-brand');
    this.forRoute(router.url);
    router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationStart) this.forRoute(event.url);
    });
    inject(DestroyRef).onDestroy(() => {
      if (previous === null) this.document.documentElement.removeAttribute('data-storefront-brand');
      else this.document.documentElement.setAttribute('data-storefront-brand', previous);
    });
  }

  useMerchant(merchantId: string | null | undefined): void {
    this.apply(merchantId === BONA_ME_MERCHANT_ID);
  }

  useHome(): void { this.apply(true); }

  private forRoute(url: string): void {
    const path = url.split(/[?#]/)[0];
    if (path === '/') this.useHome();
    else this.useMerchant(/^\/m\/([^/]+)\//.exec(path)?.[1]);
  }

  private apply(bonaMe: boolean): void {
    this.current.set(bonaMe);
    if (bonaMe) this.document.documentElement.setAttribute('data-storefront-brand', 'bona-me');
    else this.document.documentElement.removeAttribute('data-storefront-brand');
  }
}
