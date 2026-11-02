import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  BackendEnvironment,
  CreateMerchantRequest,
  CreateProductCategoryRequest,
  Merchant,
  MerchantSearchResponse,
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
    baseUrl: 'http://localhost:8080',
    storefrontUrl: 'http://localhost:4201'
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

  it('updates a merchant including business type and merchant mobility', () => {
    const payload = {
      merchantName: 'Cafe Roma',
      website: 'https://cafe.example.com',
      businessType: 'CAFE',
      merchantMobility: 'MOBILE',
      offerings: ['PRE_ORDER'],
      contactInfo: {
        email: 'jane@example.com',
        phoneNumber: '+49123456789',
      },
    };
    let response: Merchant | undefined;

    service.updateMerchant(environment, apiVersion, merchantId, payload).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8080/v1/merchants/merchant-123'
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);

    request.flush({
      merchantId,
      merchantCode: 'MRC-123',
      merchantName: 'Cafe Roma',
      merchantStatus: 'ACTIVE',
      businessType: 'CAFE',
      merchantMobility: 'MOBILE',
      operatingCountry: 'DE',
      website: 'https://cafe.example.com',
      offerings: ['PRE_ORDER'],
      lastUpdatedAt: '2026-05-23T10:00:00.000Z',
      contactInfo: {
        email: 'jane@example.com',
        phoneNumber: '+49123456789',
      },
    } satisfies Merchant);

    expect(response?.merchantMobility).toBe('MOBILE');
    expect(response?.businessType).toBe('CAFE');
  });

  it('creates a merchant with its profile payload', () => {
    const payload: CreateMerchantRequest = {
      merchantName: 'Cafe Roma',
      website: 'https://cafe.example.com',
      businessType: 'CAFE',
      merchantMobility: 'MOBILE',
      offerings: ['PRE_ORDER'],
      contactInfo: { email: 'jane@example.com' }
    };
    let response: Merchant | undefined;

    service.createMerchant(environment, apiVersion, payload).subscribe((result) => response = result);

    const request = httpTestingController.expectOne('http://localhost:8080/v1/merchants');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      merchantId,
      merchantCode: 'MRC-123',
      merchantName: 'Cafe Roma',
      merchantStatus: 'SETUP',
      offerings: ['PRE_ORDER'],
      lastUpdatedAt: '2026-05-23T10:00:00.000Z'
    } satisfies Merchant);

    expect(response?.merchantId).toBe(merchantId);
  });

  it('adds required default pagination fields to merchant search requests', () => {
    const searchResponse: MerchantSearchResponse = {
      results: [],
      page: 0,
      size: 50,
      totalElements: 0,
      totalPages: 0
    };
    let response: MerchantSearchResponse | undefined;

    service.searchMerchants(environment, apiVersion, { q: 'BLTZ-FD9458FD', page: 0 }).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8080/v1/merchants/search'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      q: 'BLTZ-FD9458FD',
      page: 0,
      size: 50
    });

    request.flush(searchResponse);

    expect(response).toEqual(searchResponse);
  });

  it('loads filtered appearance history for a mobile merchant', () => {
    service.getAppearanceHistory(environment, apiVersion, merchantId, {
      branchId: 'branch-1',
      status: 'CANCELLED',
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-06-11T23:59:59.000Z',
      page: 1,
      size: 20
    }).subscribe();

    const request = httpTestingController.expectOne(req =>
      req.url === `http://localhost:8080/v1/merchants/${merchantId}/appearances/history`
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('branchId')).toBe('branch-1');
    expect(request.request.params.get('status')).toBe('CANCELLED');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('size')).toBe('20');
    request.flush({ content: [], page: 1, size: 20, totalElements: 0, totalPages: 0 });
  });
});
