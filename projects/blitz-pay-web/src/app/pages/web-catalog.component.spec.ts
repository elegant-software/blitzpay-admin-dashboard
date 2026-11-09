import { StorefrontLanguageService } from '../services/storefront-language.service';
import { StorefrontUiService } from '../services/storefront-ui.service';
import { Subject, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StorefrontApiService } from '../services/storefront-api.service';
import { WebCatalogComponent } from './web-catalog.component';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { NotificationService } from '../notifications/notification.service';

describe('WebCatalogComponent', () => {
  const api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
    'getMerchant',
    'getBranch',
    'getActiveProducts',
    'getPaymentCapabilities',
    'getTableAvailability'
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
    api.getTableAvailability.and.returnValue(of({ total: 0, free: 0, freeSeats: 0 }));
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

  it('shows merchant logos without a background, border, or rounded crop', async () => {
    api.getMerchant.and.returnValue(of({
      applicationId: 'merchant-44', merchantName: 'Brew House', logoUrl: 'https://example.test/logo.png'
    }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();

    const logo = harness.routeNativeElement!.querySelector<HTMLElement>('.merchant-logo')!;
    const image = logo.querySelector<HTMLImageElement>('img')!;
    expect(logo.classList.contains('has-logo')).toBeTrue();
    expect(image.getAttribute('src')).toBe('https://example.test/logo.png');
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

  it('uses the header language preference and preserves original backend fallback content', async () => {
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Restaurant',
      offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: ['ar', 'en'] }));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    api.getActiveProducts.and.returnValue(of([{ productId: 'p1', branchId: 'branch-12', name: 'Kaffee',
      description: 'Original text', language: 'de', unitPrice: 3.5, active: true }]));
    TestBed.inject(StorefrontLanguageService).choose('ar');
    harness.detectChanges();
    expect(api.getActiveProducts.calls.mostRecent().args[2]).toBe('ar');
    expect(component.products[0].language).toBe('de');
    expect(harness.routeNativeElement!.textContent).toContain('Original text');
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-language"]')).toBeNull();
  });
  it('exposes category counts and preserves category IDs across translated names', async () => {
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Restaurant',
      offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: ['ar'] }));
    api.getActiveProducts.and.returnValue(of([{ productId: 'p1', branchId: 'branch-12', name: 'Coffee',
      categoryId: 'drinks', categoryName: 'Drinks', unitPrice: 3.5, active: true }]));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    component.chooseCategory('drinks');
    api.getActiveProducts.and.returnValue(of([{ productId: 'p1', branchId: 'branch-12', name: 'Translated coffee',
      categoryId: 'drinks', categoryName: 'Translated drinks', unitPrice: 3.5, active: true }]));
    TestBed.inject(StorefrontLanguageService).choose('ar'); harness.detectChanges();
    expect(component.category).toBe('drinks');
    expect(component.categoryOptions[0].count).toBe(1);
    expect(harness.routeNativeElement!.querySelector('[aria-pressed="true"]')?.textContent).toContain('Translated drinks');
    expect(component.visibleProducts.length).toBe(1);
  });
  it('keeps Arabic backend content automatically directed when the UI is English', async () => {
    sessionStorage.setItem('blitzpay.storefront-language', 'ar');
    api.getActiveProducts.and.returnValue(of([{
      productId: 'p1', branchId: 'branch-12', name: 'قهوة', description: 'قهوة طازجة',
      categoryName: 'مشروبات', language: 'ar', unitPrice: 3.5, active: true
    }]));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    const direction = (selector: string) => getComputedStyle(root.querySelector(selector)!).direction;
    expect(direction('.product-card')).toBe('ltr');
    expect(direction('.product-copy')).toBe('ltr');
    expect(direction('.product-copy h3')).toBe('rtl');
    expect(direction('.product-copy p')).toBe('rtl');
    expect(getComputedStyle(root.querySelector('.product-copy h3')!).textAlign).toBe('start');
    expect(direction('.category-chips button:last-child')).toBe('ltr');
    expect(direction('.catalog-toolbar')).toBe('ltr');
    component.addProduct(component.products[0]);
    harness.detectChanges();
    expect(direction('.product-cart-actions')).toBe('ltr');
  });

  it('keeps German, English, and Turkish product cards left-to-right', async () => {
    api.getMerchant.and.returnValue(of({
      applicationId: 'merchant-44', merchantName: 'My Restaurant',
      originalMenuLanguage: 'de', supportedMenuLanguages: ['ar', 'en', 'tr'], offerings: ['INTERNATIONAL_MENU']
    }));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    for (const language of ['de', 'en', 'tr']) {
      component.chooseLanguage(language);
      harness.detectChanges();
      expect(harness.routeNativeElement!.querySelector('.product-card')!.getAttribute('dir')).toBe('ltr');
      expect(getComputedStyle(harness.routeNativeElement!.querySelector('.product-copy')!).direction).toBe('ltr');
    }
  });

  it('selects the backend original language before loading the first catalog', async () => {
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'My Restaurant', originalMenuLanguage: 'de', supportedMenuLanguages: ['ar', 'en', 'tr'], offerings: ['INTERNATIONAL_MENU'] }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    harness.detectChanges();
    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', 'de');
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-language"]')).toBeNull();
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBeNull();
  });

  it('keeps a saved guest preference ahead of the backend default', async () => {
    sessionStorage.setItem('blitzpay.storefront-language', 'tr');
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'My Restaurant', originalMenuLanguage: 'de', supportedMenuLanguages: ['ar', 'en', 'tr'], offerings: ['INTERNATIONAL_MENU'] }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12');
    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', 'tr');
  });

  it('keeps cart and selector visible during skeleton loading and ignores an obsolete response', async () => {
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'My Restaurant', originalMenuLanguage: 'de', supportedMenuLanguages: ['ar', 'en'], offerings: ['INTERNATIONAL_MENU'] }));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    harness.detectChanges();
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="add-p1"]')!.click();
    const arabic = new Subject<any[]>();
    const english = new Subject<any[]>();
    api.getActiveProducts.and.returnValues(arabic, english);
    component.chooseLanguage('ar');
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-skeleton"]')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-language"]')).toBeNull();
    expect(harness.routeNativeElement!.querySelector('web-cart')).not.toBeNull();
    component.chooseLanguage('en');
    english.next([{ productId: 'p1', branchId: 'branch-12', name: 'Fresh coffee', unitPrice: 3.5, active: true, language: 'en' }]);
    english.complete();
    arabic.next([{ productId: 'p1', branchId: 'branch-12', name: 'Obsolete', unitPrice: 3.5, active: true }]);
    arabic.complete();
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-skeleton"]')).toBeNull();
    expect(component.products[0].name).toBe('Fresh coffee');
    expect(TestBed.inject(StorefrontSessionService).itemCount).toBe(1);
  });

  it('shows one safe server-error toast and keeps the previous products available', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    const toasts: string[] = [];
    TestBed.inject(NotificationService).messageObserver.subscribe(message => {
      for (const item of Array.isArray(message) ? message : [message]) toasts.push(item.detail ?? '');
    });
    const request = new Subject<any[]>();
    api.getActiveProducts.and.returnValue(request);
    component.chooseLanguage('ar');
    request.error(new HttpErrorResponse({ status: 503, error: { detail: 'Translations temporarily unavailable' } }));
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain(TestBed.inject(StorefrontUiService).text('Unable to load this branch catalog.'));
    expect(toasts).toEqual([TestBed.inject(StorefrontUiService).text('Unable to load this branch catalog.')]);
    expect(harness.routeNativeElement!.textContent).toContain('Coffee');
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-skeleton"]')).toBeNull();
  });

  it('reloads products from the shared header selection and preserves the cart', async () => {
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Restaurant',
      offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: ['en'] }));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant-44/b/branch-12', WebCatalogComponent);
    component.addProduct(component.products[0]);
    api.getActiveProducts.and.returnValue(of([{ productId: 'p1', branchId: 'branch-12', name: 'Coffee EN', unitPrice: 3.5, active: true }]));
    TestBed.inject(StorefrontLanguageService).choose('en'); harness.detectChanges();
    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', 'en');
    expect(component.cart.itemCount).toBe(1);
    expect(component.cart.lines[0].product.name).toBe('Coffee EN');
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBe('en');
  });
});
