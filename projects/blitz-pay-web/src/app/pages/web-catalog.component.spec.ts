import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StorefrontApiService } from '../services/storefront-api.service';
import { WebCatalogComponent } from './web-catalog.component';

describe('WebCatalogComponent', () => {
  const api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
    'getMerchant',
    'getBranch',
    'getActiveProducts',
    'getPaymentCapabilities'
  ]);

  beforeEach(async () => {
    api.getMerchant.calls.reset();
    api.getBranch.calls.reset();
    api.getActiveProducts.calls.reset();
    api.getPaymentCapabilities.calls.reset();
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Brew House' }));
    api.getBranch.and.returnValue(
      of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe' })
    );
    api.getActiveProducts.and.returnValue(
      of([{ productId: 'p1', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true }])
    );
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: ['PAY_BY_BANK'] }));
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'm/:merchantId/b/:branchId', component: WebCatalogComponent }]),
        { provide: StorefrontApiService, useValue: api }
      ]
    }).compileComponents();
  });

  it('renders API products in the Web Catalog and adds a product to the Web Cart', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();

    const content = harness.routeNativeElement?.textContent ?? '';
    expect(content).toContain('Station Cafe');
    expect(content).toContain('Coffee');

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('[data-testid="add-p1"]')?.click();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('1 item');
    expect(harness.routeNativeElement?.textContent).toContain('3.50');
  });

  it('shows product browsing controls and routes checkout without creating an order', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('[data-testid="add-p1"]')?.click();
    harness.detectChanges();
    const checkoutLink = harness.routeNativeElement?.querySelector<HTMLAnchorElement>('[data-testid="checkout"]');

    expect(harness.routeNativeElement?.textContent).toContain('Search products');
    expect(harness.routeNativeElement?.textContent).not.toContain('Payment method');
    expect(checkoutLink?.getAttribute('href')).toContain('/m/merchant-44/b/branch-12/checkout');
  });

  it('hides the language switcher when the merchant has no International Menu', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();

    expect(harness.routeNativeElement?.querySelector('[data-testid="catalog-language"]')).toBeNull();
  });

  it('lets the shopper switch the catalog language and reloads products in it', async () => {
    api.getMerchant.and.returnValue(of({
      applicationId: 'merchant-44', merchantName: 'Brew House',
      offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: ['en']
    }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();

    const select = harness.routeNativeElement?.querySelector<HTMLSelectElement>('[data-testid="catalog-language"]');
    expect(Array.from(select?.options ?? []).map((o) => o.textContent?.trim())).toEqual(['Deutsch', 'English']);

    api.getActiveProducts.and.returnValue(of([{ productId: 'p1', branchId: 'branch-12', name: 'Coffee EN', unitPrice: 3.5, active: true }]));
    select!.value = select!.options[1].value;
    select!.dispatchEvent(new Event('change'));
    harness.detectChanges();

    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', 'en');
    expect(harness.routeNativeElement?.textContent).toContain('Coffee EN');
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBe('en');
  });
});
