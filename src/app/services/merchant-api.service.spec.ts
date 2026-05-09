import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  BackendEnvironment,
  CreateProductCategoryRequest,
  ProductCategory,
  RenameProductCategoryRequest
} from '../models/merchant-catalog.models';
import { MerchantApiService } from './merchant-api.service';

describe('MerchantApiService product category API', () => {
  let service: MerchantApiService;
  let httpTestingController: HttpTestingController;

  const environment: BackendEnvironment = {
    key: 'local',
    label: 'Local',
    baseUrl: 'http://localhost:8080'
  };
  const apiVersion = 'v1';
  const merchantId = 'merchant-123';
  const categoryId = 'category-456';
  const categoryResponse: ProductCategory = {
    id: categoryId,
    name: 'Beverages',
    createdAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-10T10:00:00.000Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MerchantApiService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(MerchantApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('creates a product category for a merchant', () => {
    const payload: CreateProductCategoryRequest = { name: 'Beverages' };
    let response: ProductCategory | undefined;

    service.createProductCategory(environment, apiVersion, merchantId, payload).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8080/v1/merchants/merchant-123/product-categories'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(categoryResponse);

    expect(response).toEqual(categoryResponse);
  });

  it('renames a product category for a merchant', () => {
    const payload: RenameProductCategoryRequest = { name: 'Hot Drinks' };
    let response: ProductCategory | undefined;

    service.renameProductCategory(environment, apiVersion, merchantId, categoryId, payload).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8080/v1/merchants/merchant-123/product-categories/category-456'
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);

    request.flush({ ...categoryResponse, name: 'Hot Drinks', updatedAt: '2026-05-10T10:05:00.000Z' });

    expect(response).toEqual({
      ...categoryResponse,
      name: 'Hot Drinks',
      updatedAt: '2026-05-10T10:05:00.000Z'
    });
  });

  it('deletes a product category for a merchant', () => {
    let completed = false;

    service.deleteProductCategory(environment, apiVersion, merchantId, categoryId).subscribe(() => {
      completed = true;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8080/v1/merchants/merchant-123/product-categories/category-456'
    );
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeNull();

    request.flush(null);

    expect(completed).toBeTrue();
  });
});
