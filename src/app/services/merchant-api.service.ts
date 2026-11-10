import { HttpClient, HttpContext, HttpDownloadProgressEvent, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
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
  CardReader,
  BranchCustomer,
  BranchFloor,
  BranchTable,
  CreateTablesRequest,
  TableLive,
  FloorArea,
  FloorPlan,
  FloorPlanImageUploadResponse,
  TablePlacement,
  UpdateTableRequest,
  CatalogTranslation,
  CreateOrderRequest,
  CreateProductCategoryRequest,
  CreateMerchantRequest,
  CreateBranchRequest,
  KitchenAccessStatus,
  KitchenLogin,
  MenuLanguage,
  Merchant,
  MerchantBookAppointmentRequest,
  MerchantLogoUploadResponse,
  MerchantLocation,
  MerchantSearchRequest,
  MerchantSearchResponse,
  MerchantVerticalResponse,
  StorefrontTheme,
  OrderResponse,
  Product,
  PreparationConfiguration,
  ProductCategory,
  ProductListResponse,
  ProviderAccountResponse,
  RenameProductCategoryRequest,
  RescheduleAppointmentRequest,
  ShopperSearchResult,
  StartStripeConnectRequest,
  StripeConnectStatusResponse,
  SupportOverrideAppointmentRequest,
  TranslationCoverage,
  UpdateAppointmentNoteRequest,
  UpdateAppointmentPolicyRequest,
  UpdateBranchRequest,
  UpdateMerchantRequest,
  UpdateMerchantLocationRequest,
  UpdateMerchantLogoRequest,
  UpsertCatalogTranslationRequest
} from '../models/merchant-catalog.models';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { buildApiBaseUrl } from './merchant-environment.service';
import { HANDLE_FORBIDDEN_LOCALLY } from '../auth/interceptors/auth.interceptor';
import { parseServerSentEvents } from '../tables/server-sent-events';

@Injectable({ providedIn: 'root' })
export class MerchantApiService {
  constructor(private readonly http: HttpClient) {}

  getPreparationConfiguration(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): Observable<PreparationConfiguration> {
    return this.http.get<PreparationConfiguration>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}/preparation-configuration`);
  }

  savePreparationConfiguration(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, configuration: PreparationConfiguration): Observable<PreparationConfiguration> {
    return this.http.put<PreparationConfiguration>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}/preparation-configuration`, configuration);
  }

  getMerchant(environment: BackendEnvironment, apiVersion: string, merchantId: string): Observable<Merchant> {
    // Bearer credentials are injected centrally by the auth interceptor.
    return this.http.get<Merchant>(`${this.base(environment, apiVersion)}/merchants/${merchantId}`);
  }

  createMerchant(
    environment: BackendEnvironment,
    apiVersion: string,
    payload: CreateMerchantRequest
  ): Observable<Merchant> {
    return this.http.post<Merchant>(`${this.base(environment, apiVersion)}/merchants`, payload);
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
    includeInactive = true,
    language?: string
  ): Observable<Product[]> {
    let params = new HttpParams().set('branchId', branchId);
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    if (language) {
      params = params.set('language', language);
    }
    return this.http
      .get<ProductListResponse | Product[]>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products`, { params })
      .pipe(map((response) => Array.isArray(response) ? response : (response.products ?? [])));
  }

  getProductCategories(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    language?: string
  ): Observable<ProductCategory[]> {
    const params = language ? new HttpParams().set('language', language) : undefined;
    return this.http.get<ProductCategory[]>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories`, { params });
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
    branchId?: string,
    language?: string
  ): Observable<Product> {
    let params = new HttpParams();
    if (branchId) params = params.set('branchId', branchId);
    if (language) params = params.set('language', language);
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

  getMenuLanguages(environment: BackendEnvironment, apiVersion: string): Observable<MenuLanguage[]> {
    return this.http.get<MenuLanguage[]>(`${this.base(environment, apiVersion)}/merchants/menu-languages`);
  }

  getProductTranslations(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    productId: string
  ): Observable<CatalogTranslation[]> {
    return this.http.get<CatalogTranslation[]>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}/translations`);
  }

  saveProductTranslation(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    productId: string,
    language: string,
    payload: UpsertCatalogTranslationRequest
  ): Observable<CatalogTranslation> {
    return this.http.put<CatalogTranslation>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}/translations/${language}`,
      payload
    );
  }

  deleteProductTranslation(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    productId: string,
    language: string
  ): Observable<void> {
    return this.http.delete<void>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}/translations/${language}`);
  }

  getCategoryTranslations(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    categoryId: string
  ): Observable<CatalogTranslation[]> {
    return this.http.get<CatalogTranslation[]>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories/${categoryId}/translations`
    );
  }

  saveCategoryTranslation(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    categoryId: string,
    language: string,
    payload: UpsertCatalogTranslationRequest
  ): Observable<CatalogTranslation> {
    return this.http.put<CatalogTranslation>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories/${categoryId}/translations/${language}`,
      payload
    );
  }

  deleteCategoryTranslation(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    categoryId: string,
    language: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.base(environment, apiVersion)}/merchants/${merchantId}/product-categories/${categoryId}/translations/${language}`
    );
  }

  getTranslationCoverage(environment: BackendEnvironment, apiVersion: string, merchantId: string): Observable<TranslationCoverage[]> {
    return this.http.get<TranslationCoverage[]>(`${this.base(environment, apiVersion)}/merchants/${merchantId}/translation-coverage`);
  }

  /** All themes including drafts, so a draft can be previewed before merchants can pick it. */
  getStorefrontThemes(environment: BackendEnvironment, apiVersion: string): Observable<StorefrontTheme[]> {
    return this.http.get<StorefrontTheme[]>(`${this.base(environment, apiVersion)}/storefront/themes`, { params: { includeDrafts: true } });
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

  /** Card readers paired to the merchant's branches (Stripe Terminal Locations), optionally for one branch. */
  getCardReaders(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    branchId?: string | null
  ): Observable<CardReader[]> {
    let params = new HttpParams().set('merchantId', merchantId);
    if (branchId) params = params.set('branchId', branchId);
    return this.http.get<CardReader[]>(
      `${this.base(environment, apiVersion)}/payments/stripe/terminal/readers`,
      { params }
    );
  }

  /** Kitchen Login status of a Branch. A 403 (caller is not a Merchant Manager) is handled by the caller. */
  getKitchenAccess(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<KitchenAccessStatus> {
    return this.http.get<KitchenAccessStatus>(this.kitchenUrl(environment, apiVersion, branchId), { context: this.kitchenContext() });
  }

  /** Enables the Kitchen Screen, or resets its password when already enabled. Returns the new password once. */
  enableKitchenAccess(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<KitchenLogin> {
    return this.http.post<KitchenLogin>(`${this.kitchenUrl(environment, apiVersion, branchId)}/enable`, {}, { context: this.kitchenContext() });
  }

  /** Disables the Kitchen Login and logs out every kitchen screen of the Branch. */
  disableKitchenAccess(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<KitchenAccessStatus> {
    return this.http.post<KitchenAccessStatus>(`${this.kitchenUrl(environment, apiVersion, branchId)}/disable`, {}, { context: this.kitchenContext() });
  }

  private kitchenUrl(environment: BackendEnvironment, apiVersion: string, branchId: string): string {
    return `${this.base(environment, apiVersion)}/merchant/branches/${encodeURIComponent(branchId)}/kitchen`;
  }

  private kitchenContext(): HttpContext {
    return new HttpContext().set(HANDLE_FORBIDDEN_LOCALLY, true);
  }

  // ── Tables and Floor Plans (zack-pay#195) ─────────────────────────────

  getTables(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): Observable<BranchTable[]> {
    return this.http.get<BranchTable[]>(`${this.branchUrl(environment, apiVersion, merchantId, branchId)}/tables`);
  }

  /** Creates several Tables at once, one per name; [seats] applies to all of them. */
  createTables(
    environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, names: string[], seats?: number | null
  ): Observable<BranchTable[]> {
    const body: CreateTablesRequest = seats ? { names, seats } : { names };
    return this.http.post<BranchTable[]>(`${this.branchUrl(environment, apiVersion, merchantId, branchId)}/tables`, body);
  }

  updateTable(
    environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, tableId: string, payload: UpdateTableRequest
  ): Observable<BranchTable> {
    return this.http.patch<BranchTable>(this.tableUrl(environment, apiVersion, merchantId, branchId, tableId), payload);
  }

  /** Deletes a Table without orders; 409 when it has orders (deactivate it instead). */
  deleteTable(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, tableId: string): Observable<void> {
    return this.http.delete<void>(this.tableUrl(environment, apiVersion, merchantId, branchId, tableId));
  }

  placeTable(
    environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, tableId: string, placement: TablePlacement
  ): Observable<BranchTable> {
    return this.http.put<BranchTable>(`${this.tableUrl(environment, apiVersion, merchantId, branchId, tableId)}/placement`, placement);
  }

  unplaceTable(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, tableId: string): Observable<unknown> {
    return this.http.delete(`${this.tableUrl(environment, apiVersion, merchantId, branchId, tableId)}/placement`);
  }

  getFloorPlans(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): Observable<FloorPlan[]> {
    return this.http.get<FloorPlan[]>(`${this.branchUrl(environment, apiVersion, merchantId, branchId)}/floor-plans`);
  }

  createFloorPlan(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, name: string): Observable<FloorPlan> {
    return this.http.post<FloorPlan>(`${this.branchUrl(environment, apiVersion, merchantId, branchId)}/floor-plans`, { name });
  }

  renameFloorPlan(
    environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, floorPlanId: string, name: string
  ): Observable<FloorPlan> {
    return this.http.patch<FloorPlan>(this.floorPlanUrl(environment, apiVersion, merchantId, branchId, floorPlanId), { name });
  }

  /** Replaces the Floor Areas traced over a Floor Plan; an empty list shows the picture again. */
  updateFloorAreas(
    environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, floorPlanId: string, areas: FloorArea[]
  ): Observable<FloorPlan> {
    return this.http.put<FloorPlan>(`${this.floorPlanUrl(environment, apiVersion, merchantId, branchId, floorPlanId)}/areas`, { areas });
  }

  /** Deletes a Floor Plan; the Tables on it become unplaced. */
  deleteFloorPlan(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, floorPlanId: string): Observable<void> {
    return this.http.delete<void>(this.floorPlanUrl(environment, apiVersion, merchantId, branchId, floorPlanId));
  }

  /** Presigned upload for a Floor Plan picture, same pattern as the merchant logo upload. */
  createFloorPlanImageUploadUrl(
    environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, floorPlanId: string, contentType: string
  ): Observable<FloorPlanImageUploadResponse> {
    return this.http.post<FloorPlanImageUploadResponse>(
      `${this.floorPlanUrl(environment, apiVersion, merchantId, branchId, floorPlanId)}/image/upload-url`, { contentType }
    );
  }

  /** The live floor: Floor Plans plus every active Table with its Table Status and open orders. */
  getFloor(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): Observable<BranchFloor> {
    return this.http.get<BranchFloor>(`${this.branchUrl(environment, apiVersion, merchantId, branchId)}/floor`);
  }

  /**
   * Live floor changes over SSE: one `table` event with the Table's live state whenever it changes. Goes through
   * HttpClient (not EventSource) so the auth interceptor adds the bearer token. Completes after a few MB so the
   * buffered response does not grow forever; callers then reload the floor and reconnect.
   */
  floorEvents(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): Observable<TableLive> {
    const url = `${this.branchUrl(environment, apiVersion, merchantId, branchId)}/floor/events`;
    return new Observable<TableLive>((subscriber) => {
      let consumed = 0;
      let buffer = '';
      const request = this.http.get(url, {
        observe: 'events',
        reportProgress: true,
        responseType: 'text',
        headers: new HttpHeaders({ Accept: 'text/event-stream' })
      }).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Response) return subscriber.complete();
          if (event.type !== HttpEventType.DownloadProgress) return;
          const text = (event as HttpDownloadProgressEvent).partialText ?? '';
          buffer += text.slice(consumed);
          consumed = text.length;
          const parsed = parseServerSentEvents(buffer);
          buffer = parsed.rest;
          for (const sse of parsed.events) {
            if (sse.event !== 'table') continue;
            try {
              subscriber.next(JSON.parse(sse.data) as TableLive);
            } catch { /* skip a malformed event; the next reload corrects the floor */ }
          }
          if (consumed > 4_000_000) subscriber.complete();
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete()
      });
      return () => request.unsubscribe();
    });
  }

  private branchUrl(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string): string {
    return `${this.base(environment, apiVersion)}/merchants/${encodeURIComponent(merchantId)}/branches/${encodeURIComponent(branchId)}`;
  }

  private tableUrl(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, tableId: string): string {
    return `${this.branchUrl(environment, apiVersion, merchantId, branchId)}/tables/${encodeURIComponent(tableId)}`;
  }

  private floorPlanUrl(environment: BackendEnvironment, apiVersion: string, merchantId: string, branchId: string, floorPlanId: string): string {
    return `${this.branchUrl(environment, apiVersion, merchantId, branchId)}/floor-plans/${encodeURIComponent(floorPlanId)}`;
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

  // ── Orders ──────────────────────────────────────────────────────────────

  getOrders(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    branchId: string
  ): Observable<OrderResponse[]> {
    const params = new HttpParams().set('branchId', branchId);
    return this.http.get<OrderResponse[]>(
      `${this.base(environment, apiVersion)}/merchant/orders`,
      { params }
    );
  }

  createOrder(
    environment: BackendEnvironment,
    apiVersion: string,
    payload: CreateOrderRequest
  ): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(
      `${this.base(environment, apiVersion)}/merchant/orders`,
      payload
    );
  }

  getBranchCustomers(
    environment: BackendEnvironment,
    apiVersion: string,
    branchId: string
  ): Observable<BranchCustomer[]> {
    return this.http.get<BranchCustomer[]>(
      `${this.base(environment, apiVersion)}/merchant/orders/branches/${branchId}/customers`
    );
  }

  searchShopperByEmail(
    environment: BackendEnvironment,
    apiVersion: string,
    email: string
  ): Observable<ShopperSearchResult> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ShopperSearchResult>(
      `${this.base(environment, apiVersion)}/merchant/orders/shoppers/search`,
      { params }
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
