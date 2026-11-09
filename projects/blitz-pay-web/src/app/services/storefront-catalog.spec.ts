import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StorefrontApiService } from './storefront-api.service';
import { StorefrontProduct } from '../models/storefront.models';

describe('Storefront paginated catalog contract', () => {
  let api: StorefrontApiService;
  let http: HttpTestingController;
  const product = { productId: 'coffee', branchId: 'branch', name: 'Coffee', unitPrice: 3.5, active: true,
    imageUrl: 'detail.jpg', thumbnailUrl: 'thumbnail.jpg' };
  const page = (items: StorefrontProduct[] = [product], nextCursor: string | null = null) => ({ items, nextCursor, hasMore: nextCursor !== null, limit: 24 });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(StorefrontApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads 24 anonymous branch products and retains separate detail/thumbnail URLs', () => {
    api.getCatalogPage('merchant', 'branch', 'de').subscribe(result => {
      expect(result.items[0].imageUrl).toBe('detail.jpg');
      expect(result.items[0].thumbnailUrl).toBe('thumbnail.jpg');
      expect(result.nextCursor).toBe('opaque+/=');
    });
    const request = http.expectOne(req => req.url.endsWith('/merchants/merchant/catalog/products'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('branchId')).toBe('branch');
    expect(request.request.params.get('limit')).toBe('24');
    expect(request.request.params.has('includeInactive')).toBeFalse();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    expect(request.request.headers.get('Accept-Language')).toBe('de');
    request.flush(page([product], 'opaque+/='));
  });

  it('passes category, language, and opaque next cursor without sorting backend pages', () => {
    api.getCatalogPage('merchant', 'branch', 'ar', { categoryId: 'drinks', cursor: 'opaque+/=' }).subscribe(result => {
      expect(result.items.map(item => item.name)).toEqual(['Z coffee', 'A coffee']);
    });
    const request = http.expectOne(req => req.url.endsWith('/catalog/products'));
    expect(request.request.params.get('categoryId')).toBe('drinks');
    expect(request.request.params.get('cursor')).toBe('opaque+/=');
    expect(request.request.headers.get('Accept-Language')).toBe('ar');
    request.flush(page([{ ...product, name: 'Z coffee', categoryId: 'drinks' }, { ...product, productId: 'tea', name: 'A coffee', categoryId: 'drinks' }]));
  });

  it('loads uncategorized products and excludes inactive or foreign-branch records', () => {
    api.getCatalogPage('merchant', 'branch', 'en', { uncategorized: true }).subscribe(result => {
      expect(result.items.map(item => item.productId)).toEqual(['coffee']);
    });
    const request = http.expectOne(req => req.url.endsWith('/catalog/products'));
    expect(request.request.params.get('uncategorized')).toBe('true');
    expect(request.request.params.has('categoryId')).toBeFalse();
    request.flush(page([product, { ...product, active: false }, { ...product, branchId: 'other' }]));
  });

  it('caches pages by merchant, branch, language, category and cursor', () => {
    api.getCatalogPage('merchant', 'branch', 'de').subscribe();
    http.expectOne(req => req.url.endsWith('/catalog/products')).flush(page());
    api.getCatalogPage('merchant', 'branch', 'de').subscribe();
    http.expectNone(req => req.url.endsWith('/catalog/products'));
    api.getCatalogPage('merchant', 'branch', 'en').subscribe();
    http.expectOne(req => req.headers.get('Accept-Language') === 'en').flush(page());
    api.getCatalogPage('merchant', 'another', 'de').subscribe();
    http.expectOne(req => req.params.get('branchId') === 'another').flush(page([]));
  });

  it('loads only branch category metadata and preserves product counts', () => {
    const categories = { categories: [{ id: 'drinks', name: 'Drinks', productCount: 32 }], uncategorizedCount: 2, totalCount: 34 };
    api.getCatalogCategories('merchant', 'branch', 'en').subscribe(result => expect(result).toEqual(categories));
    const request = http.expectOne(req => req.url.endsWith('/catalog/categories'));
    expect(request.request.params.get('branchId')).toBe('branch');
    expect(request.request.headers.get('Accept-Language')).toBe('en');
    request.flush(categories);
  });

  it('rejects invalid cursor metadata instead of entering an endless pagination loop', () => {
    let failed = false;
    api.getCatalogPage('merchant', 'branch', 'de', { cursor: 'same' }).subscribe({ error: () => failed = true });
    http.expectOne(req => req.url.endsWith('/catalog/products')).flush(page([], 'same'));
    expect(failed).toBeTrue();
  });

  it('retries failed requests rather than caching their error', () => {
    api.getCatalogPage('merchant', 'branch', 'de').subscribe({ error: () => {} });
    http.expectOne(req => req.url.endsWith('/catalog/products')).flush({ detail: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    api.getCatalogPage('merchant', 'branch', 'de').subscribe();
    http.expectOne(req => req.url.endsWith('/catalog/products')).flush(page());
  });
});
