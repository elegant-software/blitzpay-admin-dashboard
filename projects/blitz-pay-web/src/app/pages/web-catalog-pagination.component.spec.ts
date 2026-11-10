import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { WebCatalogComponent } from './web-catalog.component';
import { ProductOverviewComponent } from './product-overview.component';

describe('Web Catalog category pagination', () => {
  let api: jasmine.SpyObj<StorefrontApiService>;
  const coffee = { productId: 'coffee', branchId: 'branch', categoryId: 'drinks', name: 'Coffee',
    unitPrice: 3.5, active: true, imageUrl: 'detail.jpg', thumbnailUrl: 'thumb.jpg' };
  const page = (nextCursor: string | null = null) => ({ items: [coffee], nextCursor, hasMore: nextCursor !== null, limit: 24 });

  beforeEach(async () => {
    sessionStorage.clear();
    api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
      'getMerchant', 'getBranch', 'getCatalogPage', 'getCatalogCategories', 'invalidateCatalog', 'searchCatalogProducts', 'getActiveProducts', 'getProduct',
      'getPaymentCapabilities', 'getTableAvailability'
    ]);
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant', merchantName: 'Cafe', originalMenuLanguage: 'de' }));
    api.getBranch.and.returnValue(of({ id: 'branch', merchantId: 'merchant', name: 'Bremen', active: true }));
    api.getCatalogPage.and.returnValue(of(page()));
    api.getCatalogCategories.and.returnValue(of({
      categories: [{ id: 'drinks', name: 'Drinks', productCount: 27 }], uncategorizedCount: 1, totalCount: 28
    }));
    api.getActiveProducts.and.returnValue(of([coffee]));
    api.searchCatalogProducts.and.returnValue(of([coffee]));
    api.getProduct.and.returnValue(of(coffee));
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: ['CARD'] }));
    api.getTableAvailability.and.returnValue(of({ total: 0, free: 0 }));
    await TestBed.configureTestingModule({
      providers: [provideRouter([
        { path: 'm/:merchantId/b/:branchId', component: WebCatalogComponent },
        { path: 'm/:merchantId/b/:branchId/p/:productId', component: ProductOverviewComponent }
      ]), { provide: StorefrontApiService, useValue: api }]
    }).compileComponents();
  });

  it('uses branch counts and loads a selected category while keeping the chips and cart visible', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant/b/branch', WebCatalogComponent);
    component.addProduct(coffee);
    const pending = new Subject<any>();
    api.getCatalogPage.and.returnValue(pending);
    component.chooseCategory('drinks'); harness.detectChanges();
    expect(api.getCatalogPage.calls.mostRecent().args[3]).toEqual(jasmine.objectContaining({ categoryId: 'drinks' }));
    expect(harness.routeNativeElement!.querySelector('.category-chips')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-skeleton"]')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('web-cart')).not.toBeNull();
    expect(component.categoryOptions[0].count).toBe(27);
    expect(TestBed.inject(StorefrontSessionService).itemCount).toBe(1);
    pending.next(page()); pending.complete();
  });

  it('keeps loaded products on a next-page failure and retries the same cursor', async () => {
    api.getCatalogPage.and.returnValue(of(page('next+/=')));
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant/b/branch', WebCatalogComponent);
    api.getCatalogPage.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    component.loadMore(); harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Coffee');
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-page-error"]')).not.toBeNull();
    expect(api.getCatalogPage.calls.mostRecent().args[3]?.cursor).toBe('next+/=');
    api.getCatalogPage.and.returnValue(of({ items: [{ ...coffee, productId: 'tea', name: 'Tea' }], hasMore: false, nextCursor: null, limit: 24 }));
    component.loadMore(); harness.detectChanges();
    expect(component.products.map(product => product.productId)).toEqual(['coffee', 'tea']);
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-load-more"]')).toBeNull();
  });

  it('never lets a late response overwrite the newly selected category', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant/b/branch', WebCatalogComponent);
    const old = new Subject<any>();
    const current = new Subject<any>();
    api.getCatalogPage.and.returnValues(old, current);
    component.chooseCategory('drinks');
    component.chooseCategory('');
    current.next(page()); current.complete();
    old.next({ ...page(), items: [{ ...coffee, name: 'Obsolete' }] }); old.complete();
    harness.detectChanges();
    expect(component.products[0].name).toBe('Coffee');
    expect(harness.routeNativeElement!.textContent).not.toContain('Obsolete');
  });

  it('renders small list images but opens the full image in the Product Overview', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant/b/branch', WebCatalogComponent); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('img[loading="lazy"]')?.getAttribute('src')).toBe('thumb.jpg');
    await harness.navigateByUrl('/m/merchant/b/branch/p/coffee', ProductOverviewComponent); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('.overview-image img')?.getAttribute('src')).toBe('detail.jpg');
  });

  it('searches beyond the loaded page only after the shopper enters text', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/m/merchant/b/branch', WebCatalogComponent);
    expect(api.searchCatalogProducts).not.toHaveBeenCalled();
    api.searchCatalogProducts.and.returnValue(of([coffee, { ...coffee, productId: 'tea', name: 'Distant Tea' }]));
    component.query = 'Tea'; component.searchProducts();
    await new Promise(resolve => setTimeout(resolve, 300)); harness.detectChanges();
    expect(api.searchCatalogProducts).toHaveBeenCalledWith('merchant', 'branch', 'de');
    expect(component.visibleProducts.map(product => product.productId)).toEqual(['tea']);
  });

  it('shows an initial error without falsely claiming the branch has no products', async () => {
    api.getCatalogPage.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant/b/branch', WebCatalogComponent); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('.catalog-notice')).toBeNull();
    expect(harness.routeNativeElement!.querySelector('[data-testid="catalog-retry"]')).not.toBeNull();
  });

  it('keeps category navigation below the sticky storefront header', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant/b/branch', WebCatalogComponent); harness.detectChanges();
    const navigation = harness.routeNativeElement!.querySelector<HTMLElement>('.category-chips')!;
    expect(getComputedStyle(navigation).position).toBe('sticky');
    expect(parseFloat(getComputedStyle(navigation).top)).toBeGreaterThan(0);
  });
});
