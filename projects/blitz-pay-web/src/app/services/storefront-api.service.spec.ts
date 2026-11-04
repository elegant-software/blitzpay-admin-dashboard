import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StorefrontApiService } from './storefront-api.service';
import { StorefrontLanguageService } from './storefront-language.service';

describe('StorefrontApiService', () => {
  let service: StorefrontApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [StorefrontApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StorefrontApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  for (const language of ['ar', 'de', 'en', 'tr']) {
    it(`preserves branch parameters and backend fallback fields when requesting ${language}`, () => {
      const fallback = { productId: 'p1', branchId: 'branch-12', name: 'Kaffee', description: 'Original', categoryName: 'Getränke', language: 'de', active: true, unitPrice: 3.5 };
      service.getActiveProducts('merchant-44', 'branch-12', language).subscribe(products => expect(products).toEqual([fallback]));
      service.getProduct('merchant-44', 'branch-12', 'p1', language).subscribe(product => expect(product).toEqual(fallback));
      const list = http.expectOne('/v1/merchants/merchant-44/products?branchId=branch-12');
      expect(list.request.headers.get('Accept-Language')).toBe(language);
      list.flush([fallback]);
      const detail = http.expectOne('/v1/merchants/merchant-44/products/p1?branchId=branch-12');
      expect(detail.request.headers.get('Accept-Language')).toBe(language);
      detail.flush(fallback);
    });
  }

  it('sends the session language on order and hosted checkout requests without changing payloads', () => {
    TestBed.inject(StorefrontLanguageService).choose('ar');
    const payload = { branchId: 'branch-12', items: [{ productId: 'p1', quantity: 2 }] };
    service.createOrder(payload).subscribe();
    const order = http.expectOne('/v1/storefront/orders');
    expect(order.request.headers.get('Accept-Language')).toBe('ar');
    expect(order.request.body).toEqual(payload);
    order.flush({ orderId: 'o1' });
    const checkoutPayload = { orderId: 'o1', merchantId: 'merchant-44', branchId: 'branch-12', successUrl: 'https://example.test/success', cancelUrl: 'https://example.test/cancel' };
    service.createPayByBankCheckout(checkoutPayload).subscribe();
    const checkout = http.expectOne('/v1/payments/stripe/pay-by-bank/create-checkout-session');
    expect(checkout.request.headers.get('Accept-Language')).toBe('ar');
    expect(checkout.request.body).toEqual(checkoutPayload);
    checkout.flush({});
  });

  it('loads only active branch products from the public catalog endpoint', () => {
    let names: string[] = [];

    service.getActiveProducts('merchant-44', 'branch-12').subscribe((products) => {
      names = products.map((product) => product.name);
    });

    const request = http.expectOne(
      '/v1/merchants/merchant-44/products?branchId=branch-12'
    );
    expect(request.request.method).toBe('GET');
    request.flush([
      { productId: 'p2', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true },
      { productId: 'p3', branchId: 'branch-12', name: 'Archived', unitPrice: 2, active: false },
      { productId: 'p1', branchId: 'branch-12', name: 'Bagel', unitPrice: 4, active: true }
    ]);

    expect(names).toEqual(['Bagel', 'Coffee']);
  });

  it('requests catalog text in the shopper-chosen language', () => {
    service.getActiveProducts('merchant-44', 'branch-12', 'en').subscribe();
    service.getProduct('merchant-44', 'branch-12', 'p1', 'en').subscribe();

    const list = http.expectOne('/v1/merchants/merchant-44/products?branchId=branch-12');
    expect(list.request.headers.get('Accept-Language')).toBe('en');
    list.flush([]);
    const detail = http.expectOne('/v1/merchants/merchant-44/products/p1?branchId=branch-12');
    expect(detail.request.headers.get('Accept-Language')).toBe('en');
    detail.flush({});
  });

  it('leaves the browser language in charge when the shopper has not chosen one', () => {
    service.getActiveProducts('merchant-44', 'branch-12').subscribe();

    const list = http.expectOne('/v1/merchants/merchant-44/products?branchId=branch-12');
    expect(list.request.headers.has('Accept-Language')).toBeFalse();
    list.flush([]);
  });

  it('loads merchant and branch display context', () => {
    service.getMerchant('merchant-44').subscribe();
    service.getBranch('merchant-44', 'branch-12').subscribe();

    expect(http.expectOne('/v1/merchants/merchant-44').request.method).toBe('GET');
    expect(
      http.expectOne('/v1/merchants/merchant-44/branches/branch-12').request.method
    ).toBe('GET');
  });

  it('loads one branch product for a shareable product overview route', () => {
    service.getProduct('merchant-44', 'branch-12', 'p1').subscribe();

    const request = http.expectOne(
      '/v1/merchants/merchant-44/products/p1?branchId=branch-12'
    );
    expect(request.request.method).toBe('GET');
    request.flush({ productId: 'p1', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true });
  });

  it('creates a guest order using the web cart selection', () => {
    const payload = { branchId: 'branch-12', items: [{ productId: 'p1', quantity: 2 }] };

    service.createOrder(payload).subscribe();

    const request = http.expectOne('/v1/storefront/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.headers.has('Accept-Language')).toBeFalse();
  });

  it('loads and pays a guest order through the cookie-authorised storefront endpoints', () => {
    service.getGuestOrder('order-200').subscribe();
    expect(http.expectOne('/v1/storefront/orders/order-200').request.method).toBe('GET');

    service.startGuestPayment('order-200', 'CARD').subscribe();
    const payment = http.expectOne('/v1/storefront/orders/order-200/payment');
    expect(payment.request.method).toBe('POST');
    expect(payment.request.body).toEqual({ method: 'CARD' });
  });

  it('loads an order reached through a universal order URL', () => {
    service.getOrder('order-200').subscribe();

    const request = http.expectOne('/v1/orders/order-200');
    expect(request.request.method).toBe('GET');
  });

  it('loads hosted browser payment availability for the merchant', () => {
    service.getPaymentCapabilities('merchant-44').subscribe();

    const request = http.expectOne('/v1/merchants/merchant-44/stripe-connect/status');
    expect(request.request.method).toBe('GET');
  });

  it('creates a hosted Stripe Pay by Bank checkout session', () => {
    const payload = {
      orderId: 'order-200',
      merchantId: 'merchant-44',
      branchId: 'branch-12',
      productId: 'p1',
      successUrl: 'http://localhost:4200/order/order-200/confirmation',
      cancelUrl: 'http://localhost:4200/order/order-200'
    };

    service.createPayByBankCheckout(payload).subscribe();

    const request = http.expectOne('/v1/payments/stripe/pay-by-bank/create-checkout-session');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
  });

  describe('guestOrderEvents', () => {
    class FakeEventSource {
      static readonly CLOSED = 2;
      static last: FakeEventSource;
      readyState = 1;
      closed = false;
      onerror: (() => void) | null = null;
      readonly listeners: Record<string, (event: MessageEvent) => void> = {};
      constructor(readonly url: string, readonly init?: EventSourceInit) { FakeEventSource.last = this; }
      addEventListener(type: string, listener: (event: MessageEvent) => void): void { this.listeners[type] = listener; }
      close(): void { this.closed = true; this.readyState = FakeEventSource.CLOSED; }
      emit(type: string, data: unknown): void { this.listeners[type]?.(new MessageEvent(type, { data: JSON.stringify(data) })); }
    }

    let original: typeof EventSource;
    beforeEach(() => {
      original = window.EventSource;
      (window as unknown as { EventSource: unknown }).EventSource = FakeEventSource;
    });
    afterEach(() => (window as unknown as { EventSource: unknown }).EventSource = original);

    it('streams order.changed events with credentials and closes on unsubscribe', () => {
      const orders: unknown[] = [];
      const subscription = service.guestOrderEvents('o/1').subscribe(order => orders.push(order));
      const source = FakeEventSource.last;
      expect(source.url).toBe('/v1/storefront/orders/o%2F1/events');
      expect(source.init).toEqual({ withCredentials: true });

      source.emit('order.changed', { orderId: 'o/1', preparationStatus: 'PREPARING', pickupNumber: 42 });
      source.emit('message', { orderId: 'ignored' });
      expect(orders).toEqual([{ orderId: 'o/1', preparationStatus: 'PREPARING', pickupNumber: 42 }]);

      subscription.unsubscribe();
      expect(source.closed).toBeTrue();
    });

    it('errors only once the browser stops reconnecting', () => {
      let failed = false;
      service.guestOrderEvents('o1').subscribe({ error: () => failed = true });
      const source = FakeEventSource.last;
      source.readyState = 0;
      source.onerror?.();
      expect(failed).toBeFalse();
      source.readyState = FakeEventSource.CLOSED;
      source.onerror?.();
      expect(failed).toBeTrue();
      expect(source.closed).toBeTrue();
    });
  });

  it('resolves a Table Code through the public storefront endpoint', () => {
    const resolution = { merchantId: 'm', merchantName: 'Brew House', branchId: 'b', branchName: 'Station', tableId: 't', tableName: '5', active: true };
    service.resolveTable('AB3K7Q').subscribe(result => expect(result).toEqual(resolution));
    http.expectOne({ method: 'GET', url: '/v1/storefront/tables/AB3K7Q' }).flush(resolution);
  });
});
