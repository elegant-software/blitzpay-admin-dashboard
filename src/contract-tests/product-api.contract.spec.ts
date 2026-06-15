import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { Product, ProductCategory, ProductListResponse } from '../app/models/merchant-catalog.models';

const contractBaseUrl =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_BASE_URL'] : undefined) ??
  'http://localhost:8089';

const merchantId =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_MERCHANT_ID'] : undefined) ??
  '11111111-1111-4111-8111-111111111111';

const branchId =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_BRANCH_ID'] : undefined) ??
  '22222222-2222-4222-8222-222222222222';

const productId =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_PRODUCT_ID'] : undefined) ??
  'test-product-id';

const categoryId =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_CATEGORY_ID'] : undefined) ??
  'test-category-id';

const productsUrl = `${contractBaseUrl}/v1/merchants/${merchantId}/products`;
const categoriesUrl = `${contractBaseUrl}/v1/merchants/${merchantId}/product-categories`;

function assertProductShape(product: Product): void {
  expect(product.productId).toBeTruthy();
  expect(product.merchantId).toBeTruthy();
  expect(product.name).toBeTruthy();
  expect(typeof product.unitPrice).toBe('number');
  expect(typeof product.active).toBe('boolean');
  expect(product.status).toBeTruthy();
  expect(product.createdAt).toBeTruthy();
  expect(product.updatedAt).toBeTruthy();
}

function assertCategoryShape(category: ProductCategory): void {
  expect(category.id).toBeTruthy();
  expect(category.name).toBeTruthy();
  expect(category.createdAt).toBeTruthy();
  expect(category.updatedAt).toBeTruthy();
}

describe('Product API — contract tests', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    http = TestBed.inject(HttpClient);
  });

  it('GET /v1/merchants/{merchantId}/products returns Product array (or ProductListResponse)', (done) => {
    const params = new HttpParams().set('branchId', branchId).set('includeInactive', 'true');
    http.get<ProductListResponse | Product[]>(productsUrl, { params }).subscribe({
      next: (body) => {
        const products = Array.isArray(body) ? body : ((body as ProductListResponse).products ?? []);
        expect(Array.isArray(products)).toBe(true);
        if (products.length > 0) {
          assertProductShape(products[0]);
        }
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('POST /v1/merchants/{merchantId}/products creates a product via FormData and returns Product', (done) => {
    const formData = new FormData();
    formData.append('name', 'Contract Test Product');
    formData.append('unitPrice', '9.99');
    formData.append('active', 'true');
    formData.append('branchId', branchId);

    http.post<Product>(productsUrl, formData).subscribe({
      next: (body) => {
        assertProductShape(body);
        expect(body.name).toBe('Contract Test Product');
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('GET /v1/merchants/{merchantId}/products/{productId} returns a single Product', (done) => {
    const params = new HttpParams().set('branchId', branchId);
    http.get<Product>(`${productsUrl}/${productId}`, { params }).subscribe({
      next: (body) => {
        assertProductShape(body);
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('PUT /v1/merchants/{merchantId}/products/{productId} updates a product via FormData and returns Product', (done) => {
    const formData = new FormData();
    formData.append('name', 'Updated Contract Product');
    formData.append('unitPrice', '10.99');
    formData.append('active', 'true');
    formData.append('branchId', branchId);

    http.put<Product>(`${productsUrl}/${productId}`, formData).subscribe({
      next: (body) => {
        assertProductShape(body);
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('DELETE /v1/merchants/{merchantId}/products/{productId} soft-deletes and returns 204', (done) => {
    const params = new HttpParams().set('branchId', branchId);
    http.delete<void>(`${productsUrl}/${productId}`, { params }).subscribe({
      next: () => done(),
      error: (err) => done.fail(err),
    });
  });
});

describe('Product Category API — contract tests', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    http = TestBed.inject(HttpClient);
  });

  it('GET /v1/merchants/{merchantId}/product-categories returns ProductCategory array', (done) => {
    http.get<ProductCategory[]>(categoriesUrl).subscribe({
      next: (body) => {
        expect(Array.isArray(body)).toBe(true);
        if (body.length > 0) {
          assertCategoryShape(body[0]);
        }
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('POST /v1/merchants/{merchantId}/product-categories creates and returns a ProductCategory', (done) => {
    http.post<ProductCategory>(categoriesUrl, { name: 'Contract Test Category' }).subscribe({
      next: (body) => {
        assertCategoryShape(body);
        expect(body.name).toBe('Contract Test Category');
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('PUT /v1/merchants/{merchantId}/product-categories/{categoryId} renames and returns ProductCategory', (done) => {
    http
      .put<ProductCategory>(`${categoriesUrl}/${categoryId}`, { name: 'Renamed Contract Category' })
      .subscribe({
        next: (body) => {
          assertCategoryShape(body);
          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it('DELETE /v1/merchants/{merchantId}/product-categories/{categoryId} returns 204', (done) => {
    http.delete<void>(`${categoriesUrl}/${categoryId}`).subscribe({
      next: () => done(),
      error: (err) => done.fail(err),
    });
  });
});
