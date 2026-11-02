import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { ProductOverviewComponent } from './product-overview.component';

describe('ProductOverviewComponent', () => {
  const api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', ['getMerchant', 'getBranch', 'getProduct']);

  beforeEach(async () => {
    sessionStorage.clear();
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Brew House' }));
    api.getBranch.and.returnValue(of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe' }));
    api.getProduct.and.returnValue(of({
      productId: 'p1', branchId: 'branch-12', name: 'Coffee Beans', description: 'Roasted locally', unitPrice: 12, active: true
    }));
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'm/:merchantId/b/:branchId/p/:productId', component: ProductOverviewComponent }]),
        { provide: StorefrontApiService, useValue: api }
      ]
    }).compileComponents();
  });

  it('renders shareable product detail and adds its selected quantity to the web cart', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/p/p1');
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Coffee Beans');
    expect(harness.routeNativeElement?.textContent).toContain('Roasted locally');
    harness.routeNativeElement?.querySelector<HTMLButtonElement>('[data-testid="increase-quantity"]')?.click();
    harness.routeNativeElement?.querySelector<HTMLButtonElement>('[data-testid="add-product"]')?.click();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('2 items');
  });

  it('does not allow a direct product link to order from an inactive branch', async () => {
    api.getBranch.and.returnValue(of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe', active: false }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/p/p1');
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('This product is not currently available.');
    expect(harness.routeNativeElement?.querySelector('[data-testid="add-product"]')).toBeNull();
  });

  it('requests details in the saved language and renders the backend fallback unchanged', async () => {
    sessionStorage.setItem('blitzpay.storefront-language', 'ar');
    api.getProduct.and.returnValue(of({
      productId: 'p1', branchId: 'branch-12', name: 'Kaffeebohnen',
      description: 'Frisch geröstet', categoryName: 'Getränke', language: 'de', unitPrice: 12, active: true
    }));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12/p/p1', ProductOverviewComponent);
    harness.detectChanges();
    expect(api.getProduct).toHaveBeenCalledWith('merchant-44', 'branch-12', 'p1', 'ar');
    expect(component.product?.language).toBe('de');
    expect(harness.routeNativeElement?.textContent).toContain('Kaffeebohnen');
    expect(harness.routeNativeElement?.textContent).toContain('Frisch geröstet');
    expect(harness.routeNativeElement?.querySelector('.overview-copy h2')?.getAttribute('lang')).toBe('de');
    expect(document.documentElement.dir).not.toBe('rtl');
    expect(harness.routeNativeElement?.querySelector('.overview-grid')?.getAttribute('dir')).toBe('rtl');
    expect(getComputedStyle(harness.routeNativeElement!.querySelector('.overview-copy')!).textAlign).toBe('right');
  });

  it('requests a cold product detail in the merchant original language', async () => {
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Restaurant', originalMenuLanguage: 'de' }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/p/p1');
    expect(api.getProduct).toHaveBeenCalledWith('merchant-44', 'branch-12', 'p1', 'de');
  });
});
