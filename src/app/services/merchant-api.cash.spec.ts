import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BackendEnvironment, OrderResponse } from '../models/merchant-catalog.models';
import { MerchantApiService } from './merchant-api.service';

describe('MerchantApiService cash confirmation', () => {
  const environment: BackendEnvironment = { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201' };
  const paid: OrderResponse = {
    orderId: 'order-1', merchantId: 'merchant-1', branchId: 'branch-1', orderType: 'WALK_IN_ORDERING',
    status: 'PAID', checkoutPaymentMethod: 'CASH', paymentSource: 'MANUAL_SETTLEMENT',
    totalAmountMinor: 1200, currency: 'EUR', items: [], usesDeferredPayment: false,
    createdAt: '2026-11-06T10:00:00Z', paidAt: '2026-11-06T10:05:00Z'
  };
  let service: MerchantApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MerchantApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads fresh order details with an encoded order ID', () => {
    let result: OrderResponse | undefined;
    service.getOrder(environment, 'v1', 'order/1').subscribe(order => result = order);
    const request = http.expectOne('http://localhost:8080/v1/merchant/orders/order%2F1');
    expect(request.request.method).toBe('GET');
    request.flush(paid);
    expect(result).toEqual(paid);
  });

  it('posts the note and uses the authoritative paid order response', () => {
    let result: OrderResponse | undefined;
    service.settleCashOrder(environment, 'v1', 'order-1', ' Cash received ').subscribe(order => result = order);
    const request = http.expectOne('http://localhost:8080/v1/merchant/orders/order-1/settle');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ note: 'Cash received' });
    request.flush(paid);
    expect(result).toEqual(paid);
  });

  it('omits an empty optional note', () => {
    service.settleCashOrder(environment, 'v1', 'order-1', ' ').subscribe();
    const request = http.expectOne('http://localhost:8080/v1/merchant/orders/order-1/settle');
    expect(request.request.body).toEqual({});
    request.flush(paid);
  });
});
