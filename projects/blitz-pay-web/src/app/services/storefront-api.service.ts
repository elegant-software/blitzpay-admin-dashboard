import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreatePayByBankCheckoutRequest,
  CreateStorefrontOrderRequest,
  PayByBankCheckout,
  StorefrontBranch,
  StorefrontMerchant,
  StorefrontOrder,
  StorefrontPaymentCapabilities,
  StorefrontProduct
} from '../models/storefront.models';

@Injectable({ providedIn: 'root' })
export class StorefrontApiService {
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

  createOrder(payload: CreateStorefrontOrderRequest): Observable<StorefrontOrder> {
    return this.http.post<StorefrontOrder>(`${this.baseUrl}/orders`, payload);
  }

  getOrder(orderId: string): Observable<StorefrontOrder> {
    return this.http.get<StorefrontOrder>(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}`);
  }

  getPaymentCapabilities(merchantId: string): Observable<StorefrontPaymentCapabilities> {
    return this.http.get<StorefrontPaymentCapabilities>(
      `${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/stripe-connect/status`
    );
  }

  createPayByBankCheckout(payload: CreatePayByBankCheckoutRequest): Observable<PayByBankCheckout> {
    return this.http.post<PayByBankCheckout>(
      `${this.baseUrl}/payments/stripe/pay-by-bank/create-checkout-session`,
      payload
    );
  }

  private languageHeaders(language?: string | null): HttpHeaders | undefined {
    return language ? new HttpHeaders({ 'Accept-Language': language }) : undefined;
  }

  private get baseUrl(): string {
    return `${environment.apiBaseUrl.replace(/\/$/, '')}/${environment.apiVersion}`;
  }
}
