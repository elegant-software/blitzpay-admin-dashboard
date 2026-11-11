import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { StorefrontLanguageService } from './storefront-language.service';
import { map, Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreatePayByBankCheckoutRequest,
  CreateStorefrontOrderRequest,
  PayByBankCheckout,
  StorefrontBranch,
  StorefrontMerchant,
  StorefrontOrder,
  StorefrontPayment,
  StorefrontPaymentCapabilities,
  StorefrontPaymentMethod,
  StorefrontProduct,
  StorefrontCatalogPage,
  StorefrontCatalogCategories,
  StorefrontCatalogFilter,
  StorefrontTableAvailability,
  StorefrontTableResolution,
  StorefrontThemeLook
} from '../models/storefront.models';

@Injectable({ providedIn: 'root' })
export class StorefrontApiService {
  private readonly catalogCache = new Map<string, { expires: number; request: Observable<unknown> }>();
  private readonly catalogLanguage = inject(StorefrontLanguageService);
  constructor(private readonly http: HttpClient) {}

  getStorefrontTheme(code: string): Observable<StorefrontThemeLook> {
    return this.http.get<StorefrontThemeLook>(`${this.baseUrl}/storefront/themes/${encodeURIComponent(code)}`);
  }

  getMerchant(merchantId: string): Observable<StorefrontMerchant> {
    return this.http.get<StorefrontMerchant>(`${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}`);
  }

  getBranch(merchantId: string, branchId: string): Observable<StorefrontBranch> {
    return this.http.get<StorefrontBranch>(
      `${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/branches/${encodeURIComponent(branchId)}`
    );
  }

  /** [language] is the shopper's chosen catalog language; without it the browser's own Accept-Language applies. */
  getActiveProducts(merchantId: string, branchId: string, language?: string | null): Observable<StorefrontProduct[]> {
    const params = new HttpParams().set('branchId', branchId);
    return this.http
      .get<StorefrontProduct[] | { products: StorefrontProduct[] }>(
        `${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/products`,
        { params, headers: this.languageHeaders(language) }
      )
      .pipe(
        map((response) => Array.isArray(response) ? response : response.products ?? []),
        map((products) => products
          .filter((product) => product.active)
          .sort((left, right) => left.name.localeCompare(right.name)))
      );
  }

  getCatalogPage(merchantId: string, branchId: string, language?: string | null, filter: StorefrontCatalogFilter = {}): Observable<StorefrontCatalogPage> {
    return this.cachedCatalog(['page', merchantId, branchId, language ?? '', filter.categoryId ?? '', !!filter.uncategorized, filter.cursor ?? ''], () => {
      let params = new HttpParams().set('branchId', branchId).set('limit', 24);
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
      if (filter.uncategorized) params = params.set('uncategorized', true);
      if (filter.cursor) params = params.set('cursor', filter.cursor);
      return this.http.get<StorefrontCatalogPage>(`${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/catalog/products`,
        { params, headers: this.languageHeaders(language) }).pipe(map(response => {
          if (!response || !Array.isArray(response.items) || response.limit !== 24 || typeof response.hasMore !== 'boolean' ||
              (response.hasMore ? !response.nextCursor || typeof response.nextCursor !== 'string' || response.nextCursor === filter.cursor : response.nextCursor != null)) {
            throw new Error('Invalid catalog page');
          }
          return { ...response, items: response.items.filter(product => product && product.active && product.branchId === branchId &&
            !!product.productId && typeof product.name === 'string' && Number.isFinite(product.unitPrice) &&
            (!filter.categoryId || product.categoryId === filter.categoryId) && (!filter.uncategorized || !product.categoryId)) };
        }));
    });
  }

  getCatalogCategories(merchantId: string, branchId: string, language?: string | null): Observable<StorefrontCatalogCategories> {
    return this.cachedCatalog(['categories', merchantId, branchId, language ?? ''], () => this.http.get<StorefrontCatalogCategories>(
      `${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/catalog/categories`,
      { params: new HttpParams().set('branchId', branchId), headers: this.languageHeaders(language) }
    ).pipe(map(response => {
      if (!response || !Array.isArray(response.categories) || !Number.isSafeInteger(response.totalCount) || response.totalCount < 0 ||
          !Number.isSafeInteger(response.uncategorizedCount) || response.uncategorizedCount < 0 ||
          response.categories.some(category => !category || !category.id || !category.name || !Number.isSafeInteger(category.productCount) || category.productCount <= 0)) {
        throw new Error('Invalid branch categories');
      }
      return response;
    })));
  }

  searchCatalogProducts(merchantId: string, branchId: string, language?: string | null): Observable<StorefrontProduct[]> {
    return this.cachedCatalog(['search', merchantId, branchId, language ?? ''],
      () => this.getActiveProducts(merchantId, branchId, language).pipe(map(products => products.filter(product => product.branchId === branchId))));
  }

  invalidateCatalog(merchantId: string, branchId: string, language?: string | null): void {
    for (const key of this.catalogCache.keys()) {
      const scope = JSON.parse(key) as unknown[];
      if (scope[1] === merchantId && scope[2] === branchId && scope[3] === (language ?? '')) this.catalogCache.delete(key);
    }
  }

  private cachedCatalog<T>(parts: unknown[], request: () => Observable<T>): Observable<T> {
    const key = JSON.stringify(parts);
    const cached = this.catalogCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.request as Observable<T>;
    const result = request().pipe(shareReplay({ bufferSize: 1, refCount: true }));
    if (this.catalogCache.size >= 64) this.catalogCache.delete(this.catalogCache.keys().next().value!);
    this.catalogCache.set(key, { expires: Date.now() + 300_000, request: result });
    return result;
  }

  getProduct(merchantId: string, branchId: string, productId: string, language?: string | null): Observable<StorefrontProduct> {
    const params = new HttpParams().set('branchId', branchId);
    return this.http.get<StorefrontProduct>(
      `${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/products/${encodeURIComponent(productId)}`,
      { params, headers: this.languageHeaders(language) }
    );
  }

  /** Resolves a Table Code from a Table Link; 404 when no Table has that code. */
  resolveTable(tableCode: string): Observable<StorefrontTableResolution> {
    return this.http.get<StorefrontTableResolution>(`${this.baseUrl}/storefront/tables/${encodeURIComponent(tableCode)}`);
  }

  /** How many of a Branch's Tables (and seats) are free right now. */
  getTableAvailability(branchId: string): Observable<StorefrontTableAvailability> {
    return this.http.get<StorefrontTableAvailability>(`${this.baseUrl}/storefront/branches/${encodeURIComponent(branchId)}/table-availability`);
  }

  /** Guest order; the response sets the order-scoped HttpOnly guest_token cookie (same-origin, so sent automatically). */
  createOrder(payload: CreateStorefrontOrderRequest): Observable<StorefrontOrder> {
    return this.http.post<StorefrontOrder>(`${this.baseUrl}/storefront/orders`, payload, { headers: this.languageHeaders() });
  }

  getGuestInvoice(orderId: string): Observable<{ url: string; filename: string }> {
    return this.http.get<{ url: string; filename: string }>(`${this.baseUrl}/storefront/orders/${encodeURIComponent(orderId)}/invoice`);
  }

  getGuestOrder(orderId: string): Observable<StorefrontOrder> {
    return this.http.get<StorefrontOrder>(`${this.baseUrl}/storefront/orders/${encodeURIComponent(orderId)}`);
  }

  /**
   * Live order updates over SSE (event `order.changed`, full order on connect and on every status change).
   * Authenticated by the guest_token cookie. Transient drops reconnect on their own; errors once the browser gives up.
   */
  guestOrderEvents(orderId: string): Observable<StorefrontOrder> {
    return new Observable<StorefrontOrder>((subscriber) => {
      const source = new EventSource(`${this.baseUrl}/storefront/orders/${encodeURIComponent(orderId)}/events`, { withCredentials: true });
      source.addEventListener('order.changed', (event) => {
        try {
          subscriber.next(JSON.parse((event as MessageEvent<string>).data) as StorefrontOrder);
        } catch (error) {
          subscriber.error(error);
        }
      });
      source.onerror = () => {
        if (source.readyState === EventSource.CLOSED) subscriber.error(new Error('Order event stream closed'));
      };
      return () => source.close();
    });
  }

  startGuestPayment(orderId: string, method: StorefrontPaymentMethod): Observable<StorefrontPayment> {
    return this.http.post<StorefrontPayment>(`${this.baseUrl}/storefront/orders/${encodeURIComponent(orderId)}/payment`, { method });
  }

  getOrder(orderId: string): Observable<StorefrontOrder> {
    return this.http.get<StorefrontOrder>(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}`, { headers: this.languageHeaders() });
  }

  getPaymentCapabilities(merchantId: string): Observable<StorefrontPaymentCapabilities> {
    return this.http.get<StorefrontPaymentCapabilities>(
      `${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/stripe-connect/status`,
      { headers: this.languageHeaders() }
    );
  }

  createPayByBankCheckout(payload: CreatePayByBankCheckoutRequest): Observable<PayByBankCheckout> {
    return this.http.post<PayByBankCheckout>(
      `${this.baseUrl}/payments/stripe/pay-by-bank/create-checkout-session`,
      payload,
      { headers: this.languageHeaders() }
    );
  }

  private languageHeaders(language: string | null = this.catalogLanguage.language): HttpHeaders | undefined {
    return language ? new HttpHeaders({ 'Accept-Language': language }) : undefined;
  }

  private get baseUrl(): string {
    return `${environment.apiBaseUrl.replace(/\/$/, '')}/${environment.apiVersion}`;
  }
}
