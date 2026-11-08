import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BackendEnvironment, CatalogTranslation, MenuLanguage, TranslationCoverage } from '../models/merchant-catalog.models';
import { MerchantApiService } from './merchant-api.service';

describe('MerchantApiService International Menu API', () => {
  let service: MerchantApiService;
  let http: HttpTestingController;

  const env: BackendEnvironment = { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201' };
  const base = 'http://localhost:8080/v1/merchants/m-1';
  const translation: CatalogTranslation = {
    language: 'en', name: 'Pretzel', description: 'Freshly baked', origin: 'MERCHANT', stale: false, updatedAt: '2026-10-31T12:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MerchantApiService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MerchantApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the menu language catalogue', () => {
    const catalogue: MenuLanguage[] = [{ code: 'de', displayName: 'German', nativeName: 'Deutsch' }];
    let result: MenuLanguage[] | undefined;

    service.getMenuLanguages(env, 'v1').subscribe((r) => result = r);

    const req = http.expectOne('http://localhost:8080/v1/merchants/menu-languages');
    expect(req.request.method).toBe('GET');
    req.flush(catalogue);
    expect(result).toEqual(catalogue);
  });

  it('pins product list reads to an explicit catalog language', () => {
    service.getProducts(env, 'v1', 'm-1', 'b-1', true, 'en').subscribe();

    const req = http.expectOne((r) => r.url === `${base}/products`);
    expect(req.request.params.get('branchId')).toBe('b-1');
    expect(req.request.params.get('language')).toBe('en');
    req.flush([]);
  });

  it('omits the language parameter when none is given', () => {
    service.getProducts(env, 'v1', 'm-1', 'b-1').subscribe();

    const req = http.expectOne((r) => r.url === `${base}/products`);
    expect(req.request.params.has('language')).toBeFalse();
    req.flush([]);
  });

  it('pins single product and category reads to a language', () => {
    service.getProduct(env, 'v1', 'm-1', 'p-1', undefined, 'de').subscribe();
    service.getProductCategories(env, 'v1', 'm-1', 'de').subscribe();

    const product = http.expectOne((r) => r.url === `${base}/products/p-1`);
    expect(product.request.params.get('language')).toBe('de');
    product.flush({});
    const categories = http.expectOne((r) => r.url === `${base}/product-categories`);
    expect(categories.request.params.get('language')).toBe('de');
    categories.flush([]);
  });

  it('lists, saves and deletes product translations', () => {
    let listed: CatalogTranslation[] | undefined;
    service.getProductTranslations(env, 'v1', 'm-1', 'p-1').subscribe((r) => listed = r);
    http.expectOne(`${base}/products/p-1/translations`).flush([translation]);
    expect(listed).toEqual([translation]);

    service.saveProductTranslation(env, 'v1', 'm-1', 'p-1', 'en', { name: 'Pretzel', description: 'Freshly baked' }).subscribe();
    const put = http.expectOne(`${base}/products/p-1/translations/en`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ name: 'Pretzel', description: 'Freshly baked' });
    put.flush(translation);

    service.deleteProductTranslation(env, 'v1', 'm-1', 'p-1', 'en').subscribe();
    const del = http.expectOne(`${base}/products/p-1/translations/en`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });

  it('lists, saves and deletes category translations', () => {
    service.getCategoryTranslations(env, 'v1', 'm-1', 'c-1').subscribe();
    http.expectOne(`${base}/product-categories/c-1/translations`).flush([]);

    service.saveCategoryTranslation(env, 'v1', 'm-1', 'c-1', 'en', { name: 'Bakery' }).subscribe();
    const put = http.expectOne(`${base}/product-categories/c-1/translations/en`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ name: 'Bakery' });
    put.flush(translation);

    service.deleteCategoryTranslation(env, 'v1', 'm-1', 'c-1', 'en').subscribe();
    expect(http.expectOne(`${base}/product-categories/c-1/translations/en`).request.method).toBe('DELETE');
  });

  it('loads translation coverage', () => {
    const coverage: TranslationCoverage[] = [{ language: 'en', productsTotal: 10, productsTranslated: 7, categoriesTotal: 2, categoriesTranslated: 2 }];
    let result: TranslationCoverage[] | undefined;

    service.getTranslationCoverage(env, 'v1', 'm-1').subscribe((r) => result = r);

    http.expectOne(`${base}/translation-coverage`).flush(coverage);
    expect(result).toEqual(coverage);
  });
});
