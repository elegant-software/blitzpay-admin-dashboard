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
