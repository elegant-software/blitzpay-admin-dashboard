import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StorefrontApiService } from '../services/storefront-api.service';
import { WebCatalogComponent } from './web-catalog.component';
import { StorefrontSessionService } from '../services/storefront-session.service';

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

  it('shows selection and adjusts quantities from the card, staying in sync with the cart', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();
    const card = harness.routeNativeElement!.querySelector<HTMLElement>('.product-card')!;
    const cart = TestBed.inject(StorefrontSessionService);
    expect(card.classList.contains('is-selected')).toBeFalse();
    card.querySelector<HTMLButtonElement>('[data-testid="add-p1"]')!.click();
    harness.detectChanges();
    expect(card.classList.contains('is-selected')).toBeTrue();
    expect(card.textContent).toContain('In cart');
    expect(card.querySelector('[data-testid="add-p1"]')).toBeNull();
    card.querySelector<HTMLButtonElement>('[data-testid="increase-p1"]')!.click();
    harness.detectChanges();
    expect(cart.itemCount).toBe(2);
    expect(card.querySelector('.quantity-count')?.textContent?.trim()).toBe('2');
    cart.decrease('p1');
    harness.detectChanges();
    expect(card.querySelector('.quantity-count')?.textContent?.trim()).toBe('1');
    card.querySelector<HTMLButtonElement>('[data-testid="decrease-p1"]')!.click();
    harness.detectChanges();
    expect(cart.itemCount).toBe(0);
    expect(card.classList.contains('is-selected')).toBeFalse();
    expect(card.querySelector('[data-testid="add-p1"]')).not.toBeNull();
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

  it('shows My Restaurant native language labels and preserves backend fallback text and language', async () => {
    api.getMerchant.and.returnValue(of({
      applicationId: 'merchant-44', merchantName: 'My Restaurant',
      offerings: ['INTERNATIONAL_MENU', 'PRE_ORDER', 'WALK_IN_ORDERING'],
      originalMenuLanguage: 'de', supportedMenuLanguages: ['ar', 'en', 'tr']
    }));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    harness.detectChanges();
    expect(api.getActiveProducts.calls.first().args).toEqual(['merchant-44', 'branch-12', null]);
    let select = harness.routeNativeElement!.querySelector<HTMLSelectElement>('[data-testid="catalog-language"]')!;
    expect(Array.from(select.options).map(o => o.textContent?.trim())).toEqual(['Deutsch', 'العربية', 'English', 'Türkçe']);
    const fallback = { productId: 'p1', branchId: 'branch-12', name: 'Kaffee', description: 'Frisch geröstet', categoryName: 'Getränke', unitPrice: 3.5, active: true, language: 'de' };
    api.getActiveProducts.and.returnValue(of([fallback]));
    select.value = 'ar';
    select.dispatchEvent(new Event('change'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', 'ar');
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBe('ar');
    expect(document.documentElement.dir).not.toBe('rtl');
    expect(component.products).toEqual([fallback]);
    expect(harness.routeNativeElement!.textContent).toContain('Frisch geröstet');
    expect(harness.routeNativeElement!.textContent).toContain('Getränke');
    expect(harness.routeNativeElement!.querySelector('.product-copy')?.getAttribute('lang')).toBe('de');
    expect(harness.routeNativeElement!.querySelector('.product-copy bdi')?.getAttribute('dir')).toBe('ltr');
    select = harness.routeNativeElement!.querySelector<HTMLSelectElement>('[data-testid="catalog-language"]')!;
    expect(select.value).toBe('ar');
  });

  it('applies RTL only to Arabic product names and descriptions, keeping card layout and categories LTR', async () => {
    sessionStorage.setItem('blitzpay.storefront-language', 'ar');
    api.getActiveProducts.and.returnValue(of([{
      productId: 'p1', branchId: 'branch-12', name: 'قهوة', description: 'قهوة طازجة',
      categoryName: 'مشروبات', language: 'ar', unitPrice: 3.5, active: true
    }]));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    const direction = (selector: string) => getComputedStyle(root.querySelector(selector)!).direction;
    expect(direction('.product-card')).toBe('ltr');
    expect(direction('.product-copy')).toBe('ltr');
    expect(direction('.product-copy h3')).toBe('rtl');
    expect(direction('.product-copy p')).toBe('rtl');
    expect(direction('.category-chips button:last-child')).toBe('ltr');
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
