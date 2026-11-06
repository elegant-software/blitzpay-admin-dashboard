import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StorefrontBrandService } from './storefront-brand.service';

@Component({ standalone: true, template: '' })
class BrandRouteStub {}

describe('Storefront merchant branding', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([
    { path: '', component: BrandRouteStub },
    { path: 'm/:merchantId/b/:branchId', component: BrandRouteStub },
    { path: 'order/:orderId', component: BrandRouteStub }
  ])] }));

  it('brands the entry page and the approved merchant without changing another merchant', () => {
    const brand = TestBed.inject(StorefrontBrandService);
    expect(brand.isBonaMe()).toBeTrue();
    brand.useMerchant('8ff7bcf5-e52c-4c25-877e-a32cfc81ea46');
    expect(document.documentElement.dataset['storefrontBrand']).toBe('bona-me');
    brand.useMerchant('another-merchant');
    expect(brand.isBonaMe()).toBeFalse();
    expect(document.documentElement.dataset['storefrontBrand']).toBeUndefined();
    brand.useHome();
    expect(brand.isBonaMe()).toBeTrue();
  });

  it('does not assume an unresolved order belongs to bona-me', () => {
    const brand = TestBed.inject(StorefrontBrandService);
    brand.useMerchant(null);
    expect(brand.isBonaMe()).toBeFalse();
  });

  it('clears merchant branding when navigating to another merchant or an unresolved order', async () => {
    const brand = TestBed.inject(StorefrontBrandService);
    const harness = await RouterTestingHarness.create('/m/8ff7bcf5-e52c-4c25-877e-a32cfc81ea46/b/bremen');
    expect(brand.isBonaMe()).toBeTrue();
    await harness.navigateByUrl('/m/another-merchant/b/another-branch');
    expect(brand.isBonaMe()).toBeFalse();
    await harness.navigateByUrl('/');
    expect(brand.isBonaMe()).toBeTrue();
    await harness.navigateByUrl('/order/unresolved');
    expect(brand.isBonaMe()).toBeFalse();
  });
});
