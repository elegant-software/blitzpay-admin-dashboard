import { DestroyRef, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { fromEvent, interval } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const RELOAD_STOREFRONT = new InjectionToken<() => void>('Reload storefront', {
  providedIn: 'root', factory: () => () => window.location.reload()
});

@Injectable({ providedIn: 'root' })
export class StorefrontPwaService {
  readonly offline = signal(!navigator.onLine);
  readonly updateReady = signal(false);
  readonly reconnected = signal(false);
  readonly installPromptAvailable = signal(false);
  readonly installPromptError = signal(false);
  private readonly router = inject(Router);
  private readonly updates = inject(SwUpdate, { optional: true });
  private readonly reload = inject(RELOAD_STOREFRONT);
  private deferredInstallPrompt?: BeforeInstallPromptEvent;
  private installPromptDismissed = false;
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
    fromEvent<BeforeInstallPromptEvent>(window, 'beforeinstallprompt').pipe(takeUntilDestroyed(destroy)).subscribe(event => {
      event.preventDefault();
      if (this.installPromptDismissed || this.isInstalled()) return;
      this.deferredInstallPrompt = event;
      this.installPromptError.set(false);
      this.installPromptAvailable.set(true);
    });
    fromEvent(window, 'appinstalled').pipe(takeUntilDestroyed(destroy)).subscribe(() => {
      this.installPromptDismissed = true;
      this.deferredInstallPrompt = undefined;
      this.installPromptAvailable.set(false);
      this.installPromptError.set(false);
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

  async installStorefront(): Promise<void> {
    if (!this.deferredInstallPrompt || this.installPromptError()) return;
    this.installPromptError.set(false);
    try {
      await this.deferredInstallPrompt.prompt();
      await this.deferredInstallPrompt.userChoice;
      this.deferredInstallPrompt = undefined;
      this.installPromptDismissed = true;
      this.installPromptAvailable.set(false);
    } catch {
      this.installPromptError.set(true);
    }
  }

  dismissInstallPrompt(): void {
    this.installPromptDismissed = true;
    this.deferredInstallPrompt = undefined;
    this.installPromptAvailable.set(false);
    this.installPromptError.set(false);
  }

  private check(): void {
    if (!this.offline()) void this.updates?.checkForUpdate().catch(() => undefined);
  }

  private isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
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
