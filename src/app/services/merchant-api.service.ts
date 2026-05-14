import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Branch,
  CreateProductCategoryRequest,
  CreateBranchRequest,
  Merchant,
  MerchantLogoUploadResponse,
  MerchantLocation,
  MerchantVerticalResponse,
  Product,
  ProductCategory,
  ProductListResponse,
  RenameProductCategoryRequest,
  UpdateBranchRequest,
  UpdateMerchantRequest,
  UpdateMerchantLocationRequest,
  UpdateMerchantLogoRequest
} from '../models/merchant-catalog.models';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { buildApiBaseUrl } from './merchant-environment.service';

@Injectable({ providedIn: 'root' })
export class MerchantApiService {
  constructor(private readonly http: HttpClient) {}

  getMerchant(environment: BackendEnvironment, apiVersion: string, merchantId: string): Observable<Merchant> {
    // Bearer credentials are injected centrally by the auth interceptor.
    return this.http.get<Merchant>(`${this.base(environment, apiVersion)}/merchants/${merchantId}`);
  }

  updateMerchant(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: UpdateMerchantRequest
  ): Observable<Merchant> {
    return this.http.put<Merchant>(`${this.base(environment, apiVersion)}/merchants/${merchantId}`, payload);
  }

  getLocation(environment: BackendEnvironment, apiVersion: string, merchantId: string): Observable<MerchantLocation> {
    return this.http.get<MerchantLocation>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/location`);
  }

  saveLocation(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: UpdateMerchantLocationRequest
  ): Observable<MerchantLocation> {
    return this.http.put<MerchantLocation>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/location`, payload);
  }

  removeLocation(environment: BackendEnvironment, apiVersion: string, merchantId: string): Observable<void> {
    return this.http.delete<void>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/location`);
  }

  getBranches(environment: BackendEnvironment, apiVersion: string, merchantId: string): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches`);
  }

  createBranch(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: CreateBranchRequest
  ): Observable<Branch> {
    return this.http.post<Branch>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches`, payload);
  }

  getBranch(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}`);
  }

  updateBranch(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    branchId: string,
    payload: UpdateBranchRequest
  ): Observable<Branch> {
    return this.http.put<Branch>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}`, payload);
  }

  deleteBranch(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): Observable<void> {
    return this.http.delete<void>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}`);
  }

  getProducts(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    branchId: string,
    includeInactive = true
  ): Observable<Product[]> {
    let params = new HttpParams().set('branchId', branchId);
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    return this.http
      .get<ProductListResponse | Product[]>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products`, { params })
      .pipe(map((response) => Array.isArray(response) ? response : (response.products ?? [])));
  }

  getProductCategories(environment: BackendEnvironment, apiVersion: string, merchantId: string): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories`);
  }

  createProductCategory(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: CreateProductCategoryRequest
  ): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories`, payload);
  }

  renameProductCategory(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    categoryId: string,
    payload: RenameProductCategoryRequest
  ): Observable<ProductCategory> {
    return this.http.put<ProductCategory>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories/${categoryId}`,
      payload
    );
  }

  deleteProductCategory(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    categoryId: string
  ): Observable<void> {
    return this.http.delete<void>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories/${categoryId}`);
  }

  createProduct(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: FormData
  ): Observable<Product> {
    return this.http.post<Product>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products`, payload);
  }

  getProduct(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    productId: string,
    branchId?: string
  ): Observable<Product> {
    const params = branchId ? new HttpParams().set('branchId', branchId) : undefined;
    return this.http.get<Product>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}`, { params });
  }

  updateProduct(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    productId: string,
    payload: FormData
  ): Observable<Product> {
    return this.http.put<Product>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}`, payload);
  }

  removeProduct(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    productId: string,
    branchId?: string
  ): Observable<void> {
    const params = branchId ? new HttpParams().set('branchId', branchId) : undefined;
    return this.http.delete<void>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}`, { params });
  }

  updateLogo(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: UpdateMerchantLogoRequest
  ): Observable<Merchant> {
    return this.http.put<Merchant>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/logo`, payload);
  }

  getVerticals(environment: BackendEnvironment, apiVersion: string): Observable<MerchantVerticalResponse[]> {
    return this.http.get<MerchantVerticalResponse[]>(`${this.base(environment, apiVersion)}/merchants/verticals`);
  }

  createLogoUploadUrl(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    contentType: string
  ): Observable<MerchantLogoUploadResponse> {
    return this.http.post<MerchantLogoUploadResponse>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/logo/upload-url`, {
      contentType
    });
  }

  uploadMerchantLogo(uploadUrl: string, file: File): Observable<string> {
    return this.http.put(uploadUrl, file, {
      headers: new HttpHeaders({ 'Content-Type': file.type || 'application/octet-stream' }),
      responseType: 'text'
    });
  }

  private base(environment: BackendEnvironment, apiVersion: string): string {
    return buildApiBaseUrl(environment, apiVersion);
  }
}
