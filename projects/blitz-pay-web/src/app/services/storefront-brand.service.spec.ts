import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { StorefrontMerchant } from '../models/storefront.models';
import { StorefrontApiService } from './storefront-api.service';
import { StorefrontBrandService } from './storefront-brand.service';

@Component({ standalone: true, template: '' })
class BrandRouteStub {}

const merchants: Record<string, StorefrontMerchant> = {
  cafe: { applicationId: 'cafe', merchantName: 'Cafe', storefrontTheme: 'HERITAGE' },
  plain: { applicationId: 'plain', merchantName: 'Plain', storefrontTheme: 'DEFAULT' }
};

describe('Storefront merchant theme', () => {
  let api: jasmine.SpyObj<StorefrontApiService>;
  const attr = () => document.documentElement.getAttribute('data-storefront-theme');

  beforeEach(() => {
    api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', ['getMerchant']);
    api.getMerchant.and.callFake(id => merchants[id] ? of(merchants[id]) : throwError(() => new Error('404')));
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
    expect(brand.theme()).toBe('heritage');
    expect(attr()).toBe('heritage');
    brand.useMerchant('plain');
    TestBed.flushEffects();
    expect(brand.theme()).toBeNull();
    expect(attr()).toBeNull();
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
    expect(brand.theme()).toBe('heritage');
    await harness.navigateByUrl('/');
    expect(brand.theme()).toBeNull();
    await harness.navigateByUrl('/m/cafe/b/bremen');
    await harness.navigateByUrl('/order/unresolved');
    expect(brand.theme()).toBeNull();
  });
});
