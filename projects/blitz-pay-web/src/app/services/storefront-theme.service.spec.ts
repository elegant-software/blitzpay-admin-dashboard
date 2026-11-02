import { TestBed } from '@angular/core/testing';
import { StorefrontThemeService } from './storefront-theme.service';

describe('StorefrontThemeService', () => {
  let deviceChange: (event: MediaQueryListEvent) => void;
  beforeEach(() => {
    localStorage.clear();
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      addEventListener: (_name: string, callback: (event: MediaQueryListEvent) => void) => deviceChange = callback,
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as unknown as MediaQueryList);
  });

  it('follows device dark mode and changes with the device until manually overridden', () => {
    const service = TestBed.inject(StorefrontThemeService);
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    deviceChange({ matches: false } as MediaQueryListEvent);
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
    deviceChange({ matches: false } as MediaQueryListEvent);
    expect(service.theme()).toBe('dark');
  });

  it('remembers a manual theme and survives unavailable storage', () => {
    localStorage.setItem('blitzpay.storefront-theme', 'light');
    const service = TestBed.inject(StorefrontThemeService);
    expect(service.theme()).toBe('light');
    spyOn(Storage.prototype, 'setItem').and.throwError('Unavailable');
    expect(() => service.toggle()).not.toThrow();
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
