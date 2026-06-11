import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AppointmentPolicy,
  AppointmentResponse,
  AppearanceHistoryPage,
  AppearanceHistoryStatus,
  OperationalAppearanceItem,
  Branch,
  CreateProductCategoryRequest,
  CreateBranchRequest,
  Merchant,
  MerchantBookAppointmentRequest,
  MerchantLogoUploadResponse,
  MerchantLocation,
  MerchantSearchRequest,
  MerchantSearchResponse,
  MerchantVerticalResponse,
  Product,
  ProductCategory,
  ProductListResponse,
  ProviderAccountResponse,
  RenameProductCategoryRequest,
  RescheduleAppointmentRequest,
  StartStripeConnectRequest,
  StripeConnectStatusResponse,
  SupportOverrideAppointmentRequest,
  UpdateAppointmentNoteRequest,
  UpdateAppointmentPolicyRequest,
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

  getAppearanceOperational(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
  ): Observable<OperationalAppearanceItem[]> {
    return this.http.get<OperationalAppearanceItem[]>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appearances/operational`
    );
  }

  getAppearanceHistory(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    filter: { branchId?: string; status?: AppearanceHistoryStatus; from: string; to: string; page: number; size?: number }
  ): Observable<AppearanceHistoryPage> {
    let params = new HttpParams()
      .set('from', filter.from)
      .set('to', filter.to)
      .set('page', filter.page)
      .set('size', filter.size ?? 20);
    if (filter.branchId) params = params.set('branchId', filter.branchId);
    if (filter.status) params = params.set('status', filter.status);
    return this.http.get<AppearanceHistoryPage>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appearances/history`,
      { params }
    );
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

  getStripeConnectStatus(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string
  ): Observable<StripeConnectStatusResponse> {
    return this.http.get<StripeConnectStatusResponse>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/stripe-connect/status`
    );
  }

  startStripeConnect(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: StartStripeConnectRequest
  ): Observable<{ onboardingUrl: string }> {
    return this.http.post<{ onboardingUrl: string }>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/stripe-connect`,
      payload
    );
  }

  refreshStripeConnect(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    returnUrl: string,
    refreshUrl: string
  ): Observable<{ onboardingUrl: string }> {
    const params = new HttpParams().set('returnUrl', returnUrl).set('refreshUrl', refreshUrl);
    return this.http.get<{ onboardingUrl: string }>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/stripe-connect/refresh`,
      { params }
    );
  }

  enableTapToPay(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string
  ): Observable<{ tapToPayEnabled: boolean }> {
    return this.http.post<{ tapToPayEnabled: boolean }>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/stripe-connect/tap-to-pay/enable`,
      {}
    );
  }

  disableTapToPay(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string
  ): Observable<{ tapToPayEnabled: boolean }> {
    return this.http.delete<{ tapToPayEnabled: boolean }>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/stripe-connect/tap-to-pay`
    );
  }

  searchMerchants(
    environment: BackendEnvironment,
    apiVersion: string,
    request: MerchantSearchRequest
  ): Observable<MerchantSearchResponse> {
    return this.http.post<MerchantSearchResponse>(
      `${this.base(environment, apiVersion)}/merchants/search`,
      this.normalizeMerchantSearchRequest(request)
    );
  }

  listProviderAccounts(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string
  ): Observable<ProviderAccountResponse[]> {
    return this.http.get<ProviderAccountResponse[]>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/provider-accounts`
    );
  }

  enableProviderAccount(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    pspCode: string
  ): Observable<ProviderAccountResponse> {
    return this.http.put<ProviderAccountResponse>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/provider-accounts/${pspCode}`,
      {}
    );
  }

  disableProviderAccount(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    pspCode: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/provider-accounts/${pspCode}`
    );
  }

  listAppointments(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    from: string,
    to: string
  ): Observable<AppointmentResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AppointmentResponse[]>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments`,
      { params }
    );
  }

  listAppointmentsByEmployee(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    employeeId: string,
    from: string,
    to: string
  ): Observable<AppointmentResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AppointmentResponse[]>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments/employee/${employeeId}`,
      { params }
    );
  }

  createAppointment(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: MerchantBookAppointmentRequest
  ): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments`,
      payload
    );
  }

  cancelAppointment(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    appointmentId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments/${appointmentId}`
    );
  }

  completeAppointment(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    appointmentId: string
  ): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments/${appointmentId}/complete`,
      {}
    );
  }

  rescheduleAppointment(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    appointmentId: string,
    payload: RescheduleAppointmentRequest
  ): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments/${appointmentId}/reschedule`,
      payload
    );
  }

  overrideAppointment(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    appointmentId: string,
    payload: SupportOverrideAppointmentRequest
  ): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments/${appointmentId}/override`,
      payload
    );
  }

  patchAppointment(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    appointmentId: string,
    payload: UpdateAppointmentNoteRequest
  ): Observable<AppointmentResponse> {
    return this.http.patch<AppointmentResponse>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointments/${appointmentId}`,
      payload
    );
  }

  getBranchCalendarAppointments(
    environment: BackendEnvironment,
    apiVersion: string,
    branchId: string,
    from: string,
    to: string
  ): Observable<AppointmentResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AppointmentResponse[]>(
      `${this.base(environment, apiVersion)}/admin/branches/${branchId}/appointments`,
      { params }
    );
  }

  getAppointmentPolicy(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string
  ): Observable<AppointmentPolicy> {
    return this.http.get<AppointmentPolicy>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointment-policy`
    );
  }

  updateAppointmentPolicy(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    payload: UpdateAppointmentPolicyRequest
  ): Observable<AppointmentPolicy> {
    return this.http.patch<AppointmentPolicy>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/appointment-policy`,
      payload
    );
  }

  private base(environment: BackendEnvironment, apiVersion: string): string {
    return buildApiBaseUrl(environment, apiVersion);
  }

  private normalizeMerchantSearchRequest(request: MerchantSearchRequest): MerchantSearchRequest {
    return {
      ...request,
      page: request.page ?? 0,
      size: request.size ?? 50
    };
  }
}
