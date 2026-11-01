import { DestroyRef, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { fromEvent, interval } from 'rxjs';

export const RELOAD_STOREFRONT = new InjectionToken<() => void>('Reload storefront', {
  providedIn: 'root', factory: () => () => window.location.reload()
});

@Injectable({ providedIn: 'root' })
export class StorefrontPwaService {
  readonly offline = signal(!navigator.onLine);
  readonly updateReady = signal(false);
  readonly reconnected = signal(false);
  private readonly router = inject(Router);
  private readonly updates = inject(SwUpdate, { optional: true });
  private readonly reload = inject(RELOAD_STOREFRONT);
  private reloading = false;
  private navigating = false;

  constructor() {
    const destroy = inject(DestroyRef);
    fromEvent(window, 'offline').pipe(takeUntilDestroyed(destroy)).subscribe(() => this.offline.set(true));
    fromEvent(window, 'online').pipe(takeUntilDestroyed(destroy)).subscribe(() => {
      this.offline.set(false);
      this.reconnected.set(true);
      this.reloadWhenSafe();
    });
    if (!this.updates?.isEnabled) return;
    this.updates.versionUpdates.pipe(takeUntilDestroyed(destroy)).subscribe(event => {
      if (event.type === 'VERSION_READY') {
        this.updateReady.set(true);
        this.reloadWhenSafe();
      }
    });
    this.router.events.pipe(takeUntilDestroyed(destroy)).subscribe(event => {
      if (event instanceof NavigationStart) this.navigating = true;
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.navigating = false;
        this.reloadWhenSafe();
      }
    });
    fromEvent(document, 'visibilitychange').pipe(takeUntilDestroyed(destroy)).subscribe(() => {
      if (document.visibilityState === 'visible') this.check();
    });
    interval(15 * 60 * 1000).pipe(takeUntilDestroyed(destroy)).subscribe(() => this.check());
  }

  private check(): void {
    if (!this.offline()) void this.updates?.checkForUpdate().catch(() => undefined);
  }

  private reloadWhenSafe(): void {
    const path = this.router.url.split(/[?#]/)[0].replace(/;[^/]*/g, '').replace(/\/+$/, '');
    const checkout = path.endsWith('/checkout') || path.startsWith('/order/');
    if (this.updateReady() && !checkout && !this.offline() && !this.reloading && !this.navigating) {
      this.reloading = true;
      this.reload();
    }
  }
}
