import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { StorefrontLanguageService } from './storefront-language.service';
import { map, Observable } from 'rxjs';
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
  StorefrontTableResolution
} from '../models/storefront.models';

@Injectable({ providedIn: 'root' })
export class StorefrontApiService {
  private readonly catalogLanguage = inject(StorefrontLanguageService);
  constructor(private readonly http: HttpClient) {}

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

  /** Guest order; the response sets the order-scoped HttpOnly guest_token cookie (same-origin, so sent automatically). */
  createOrder(payload: CreateStorefrontOrderRequest): Observable<StorefrontOrder> {
    return this.http.post<StorefrontOrder>(`${this.baseUrl}/storefront/orders`, payload, { headers: this.languageHeaders() });
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
