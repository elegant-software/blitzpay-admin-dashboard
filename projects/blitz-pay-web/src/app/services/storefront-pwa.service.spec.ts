import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { StorefrontPwaService, RELOAD_STOREFRONT } from './storefront-pwa.service';

describe('StorefrontPwaService', () => {
  let versions: Subject<any>;
  let navigation: Subject<NavigationEnd | NavigationStart>;
  let reload: jasmine.Spy;
  let router: { url: string; events: Subject<NavigationEnd | NavigationStart> };
  const dispatchInstallPrompt = (prompt: () => Promise<void>, userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>): Event => {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt, userChoice });
    window.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    versions = new Subject();
    navigation = new Subject();
    reload = jasmine.createSpy('reload');
    router = { url: '/m/m/b/b', events: navigation };
    TestBed.configureTestingModule({ providers: [
      { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates: versions, checkForUpdate: () => Promise.resolve(false) } },
      { provide: Router, useValue: router },
      { provide: RELOAD_STOREFRONT, useValue: reload }
    ] });
  });
  it('reloads a ready version while browsing', () => {
    TestBed.inject(StorefrontPwaService);
    versions.next({ type: 'VERSION_DETECTED' });
    expect(reload).not.toHaveBeenCalled();
    versions.next({ type: 'VERSION_READY' });
    expect(reload).toHaveBeenCalledTimes(1);
  });
  for (const url of ['/m/m/b/b/checkout', '/m/m/b/b/checkout/', '/m/m/b/b/checkout;return=payment', '/order/123', '/order/123/confirmation?payment=success']) {
    it(`defers updates on ${url} until browsing resumes`, () => {
      router.url = url;
      TestBed.inject(StorefrontPwaService);
      versions.next({ type: 'VERSION_READY' });
      expect(reload).not.toHaveBeenCalled();
      router.url = '/m/m/b/b';
      navigation.next(new NavigationEnd(1, router.url, router.url));
      expect(reload).toHaveBeenCalledTimes(1);
    });
  }
  it('reports offline and online changes', () => {
    const service = TestBed.inject(StorefrontPwaService);
    window.dispatchEvent(new Event('offline'));
    expect(service.offline()).toBeTrue();
    window.dispatchEvent(new Event('online'));
    expect(service.offline()).toBeFalse();
  });

  it('offers the browser install prompt only after the browser signals installability', async () => {
    const service = TestBed.inject(StorefrontPwaService);
    const prompt = jasmine.createSpy('prompt').and.resolveTo();
    let resolveChoice!: (choice: { outcome: 'accepted' | 'dismissed'; platform: string }) => void;
    const userChoice = new Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>(resolve => {
      resolveChoice = resolve;
    });

    expect(service.installPromptAvailable()).toBeFalse();
    const event = dispatchInstallPrompt(prompt, userChoice);

    expect(event.defaultPrevented).toBeTrue();
    expect(service.installPromptAvailable()).toBeTrue();
    const installation = service.installStorefront();
    expect(prompt).toHaveBeenCalledTimes(1);

    resolveChoice({ outcome: 'accepted', platform: 'web' });
    await installation;
    expect(service.installPromptAvailable()).toBeFalse();
    dispatchInstallPrompt(prompt, Promise.resolve({ outcome: 'dismissed', platform: 'web' }));
    expect(service.installPromptAvailable()).toBeFalse();
  });

  it('does not offer installation while running in standalone display mode', () => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    Object.defineProperty(standaloneQuery, 'matches', { value: true });
    spyOn(window, 'matchMedia').and.returnValue(standaloneQuery);
    const service = TestBed.inject(StorefrontPwaService);

    dispatchInstallPrompt(jasmine.createSpy('prompt').and.resolveTo(), Promise.resolve({ outcome: 'accepted', platform: 'web' }));

    expect(service.installPromptAvailable()).toBeFalse();
  });

  it('keeps a dismissed install notice hidden and hides it after installation', () => {
    const service = TestBed.inject(StorefrontPwaService);
    const prompt = jasmine.createSpy('prompt').and.resolveTo();

    dispatchInstallPrompt(prompt, Promise.resolve({ outcome: 'dismissed', platform: 'web' }));
    service.dismissInstallPrompt();
    expect(service.installPromptAvailable()).toBeFalse();

    window.dispatchEvent(new Event('appinstalled'));
    expect(service.installPromptAvailable()).toBeFalse();
  });

  it('reports when the browser install prompt cannot be opened', async () => {
    const service = TestBed.inject(StorefrontPwaService);
    const prompt = jasmine.createSpy('prompt').and.rejectWith(new Error('Install prompt failed'));

    dispatchInstallPrompt(prompt, Promise.resolve({ outcome: 'dismissed', platform: 'web' }));
    await service.installStorefront();

    expect(service.installPromptError()).toBeTrue();
    expect(service.installPromptAvailable()).toBeTrue();
  });

  it('does not reload while navigation into checkout is in progress', () => {
    TestBed.inject(StorefrontPwaService);
    navigation.next(new NavigationStart(1, '/m/m/b/b/checkout'));
    versions.next({ type: 'VERSION_READY' });
    expect(reload).not.toHaveBeenCalled();
    router.url = '/m/m/b/b/checkout';
    navigation.next(new NavigationEnd(1, router.url, router.url));
    expect(reload).not.toHaveBeenCalled();
  });
});
