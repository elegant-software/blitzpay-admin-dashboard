import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { StorefrontMerchant, StorefrontThemeLook } from '../models/storefront.models';
import { StorefrontApiService } from './storefront-api.service';
import { StorefrontBrandService, tokenCss } from './storefront-brand.service';

@Component({ standalone: true, template: '' })
class BrandRouteStub {}

const merchants: Record<string, StorefrontMerchant> = {
  cafe: { applicationId: 'cafe', merchantName: 'Cafe', storefrontTheme: 'HERITAGE' },
  plain: { applicationId: 'plain', merchantName: 'Plain', storefrontTheme: 'DEFAULT' }
};
const themes: Record<string, StorefrontThemeLook> = {
  HERITAGE: { code: 'HERITAGE', style: 'CLASSIC', tokens: { light: { primary: '#926b1d' }, dark: { primary: '#dbb771' } } },
  OCEAN: { code: 'OCEAN', style: 'STANDARD', tokens: { light: { primary: '#0a5c8a' } } }
};

describe('Storefront merchant theme', () => {
  let api: jasmine.SpyObj<StorefrontApiService>;
  const attr = () => document.documentElement.getAttribute('data-storefront-style');
  const tokenSheet = () => document.getElementById('storefront-theme-tokens')?.textContent ?? '';

  beforeEach(() => {
    api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', ['getMerchant', 'getStorefrontTheme']);
    api.getMerchant.and.callFake(id => merchants[id] ? of(merchants[id]) : throwError(() => new Error('404')));
    api.getStorefrontTheme.and.callFake(code => themes[code] ? of(themes[code]) : throwError(() => new Error('404')));
    TestBed.configureTestingModule({ providers: [
      { provide: StorefrontApiService, useValue: api },
      provideRouter([
        { path: '', component: BrandRouteStub },
        { path: 'm/:merchantId/b/:branchId', component: BrandRouteStub },
        { path: 'order/:orderId', component: BrandRouteStub }
      ])
    ] });
  });

  it('applies the theme the merchant chose and resets for others', () => {
    const brand = TestBed.inject(StorefrontBrandService);
    brand.useMerchant('cafe');
    TestBed.flushEffects();
    expect(brand.theme()).toBe('classic');
    expect(attr()).toBe('classic');
    expect(tokenSheet()).toContain('--storefront-primary: #926b1d;');
    brand.useMerchant('plain');
    TestBed.flushEffects();
    expect(brand.theme()).toBeNull();
    expect(attr()).toBeNull();
    expect(tokenSheet()).toBe('');
    expect(api.getStorefrontTheme).toHaveBeenCalledTimes(1);
  });

  it('writes only #rrggbb colours for known-looking keys, dark ones scoped to dark mode', () => {
    const css = tokenCss({ code: 'X', style: 'STANDARD', tokens: {
      light: { ink: '#112233', 'bad}key': '#000000', primary: 'red;}body{display:none' },
      dark: { ink: '#eeeeee' }
    } });
    expect(css).toBe(':root:not([data-theme="dark"]) { --storefront-ink: #112233; }\n:root[data-theme="dark"] { --storefront-ink: #eeeeee; }');
  });

  it('shows the ?previewTheme= theme instead of the merchant\'s own, for admin review of drafts', () => {
    const original = location.href;
    history.replaceState(null, '', '?previewTheme=OCEAN');
    try {
      const brand = TestBed.inject(StorefrontBrandService);
      brand.useMerchant('cafe');
      expect(api.getStorefrontTheme).toHaveBeenCalledWith('OCEAN');
      expect(brand.look()?.code).toBe('OCEAN');
    } finally {
      history.replaceState(null, '', original);
    }
  });

  it('stays neutral when the merchant is unknown or fails to load', () => {
    const brand = TestBed.inject(StorefrontBrandService);
    brand.useMerchant(null);
    expect(brand.theme()).toBeNull();
    brand.useMerchant('missing');
    expect(brand.theme()).toBeNull();
  });

  it('ignores a slow response for a merchant the guest already left', () => {
    const slow = new Subject<StorefrontMerchant>();
    api.getMerchant.and.returnValue(slow);
    const brand = TestBed.inject(StorefrontBrandService);
    brand.useMerchant('cafe');
    brand.useMerchant(null);
    slow.next(merchants['cafe']);
    expect(brand.theme()).toBeNull();
  });

  it('follows navigation: merchant menu themed, entry page and unresolved order neutral', async () => {
    const brand = TestBed.inject(StorefrontBrandService);
    const harness = await RouterTestingHarness.create('/m/cafe/b/bremen');
    expect(brand.theme()).toBe('classic');
    await harness.navigateByUrl('/');
    expect(brand.theme()).toBeNull();
    await harness.navigateByUrl('/m/cafe/b/bremen');
    await harness.navigateByUrl('/order/unresolved');
    expect(brand.theme()).toBeNull();
  });
});
