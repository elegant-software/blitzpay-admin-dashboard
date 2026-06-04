import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StorefrontApiService } from './storefront-api.service';

describe('StorefrontApiService', () => {
  let service: StorefrontApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorefrontApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StorefrontApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

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
    const payload = {
      branchId: 'branch-12',
      orderType: 'PRE_ORDER' as const,
      usesDeferredPayment: false as const,
      paymentMethod: 'STRIPE' as const,
      items: [{ productId: 'p1', quantity: 2 }]
    };

    service.createOrder(payload).subscribe();

    const request = http.expectOne('/v1/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
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
});
