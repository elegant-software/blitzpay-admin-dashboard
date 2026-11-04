import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, of } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { LocationUnavailableError, StorefrontLocationService } from '../table/storefront-location.service';
import { StorefrontTableService } from '../table/storefront-table.service';
import { GuestCheckoutComponent } from './guest-checkout.component';

describe('GuestCheckoutComponent', () => {
  const api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
    'getMerchant', 'getBranch', 'getActiveProducts', 'getPaymentCapabilities', 'createOrder', 'startGuestPayment'
  ]);

  beforeEach(async () => {
    sessionStorage.clear();
    api.getActiveProducts.calls.reset();
    api.createOrder.calls.reset();
    api.startGuestPayment.calls.reset();
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Brew House' }));
    api.getBranch.and.returnValue(of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe' }));
    api.getActiveProducts.and.returnValue(of([
      { productId: 'p1', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true }
    ]));
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: ['PAY_BY_BANK'] }));
    api.createOrder.and.returnValue(of({ orderId: 'order-200' }));
    api.startGuestPayment.and.returnValue(NEVER);
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'm/:merchantId/b/:branchId/checkout', component: GuestCheckoutComponent }]),
        { provide: StorefrontApiService, useValue: api }
      ]
    }).compileComponents();
    const cart = TestBed.inject(StorefrontSessionService);
    cart.useScope('merchant-44', 'branch-12');
    cart.add({ productId: 'p1', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true });
  });

  it('loads checkout without creating an order until payment is confirmed', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/checkout');
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Checkout securely');
    expect(harness.routeNativeElement?.textContent).toContain('Pay by Bank');
    expect(api.createOrder).not.toHaveBeenCalled();

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')?.click();

    expect(api.getActiveProducts).toHaveBeenCalledTimes(2);
    expect(api.createOrder).toHaveBeenCalledWith({
      branchId: 'branch-12',
      items: [{ productId: 'p1', quantity: 1 }]
    });
    expect(api.startGuestPayment).toHaveBeenCalledWith('order-200', 'PAY_BY_BANK');
  });

  it('defaults to card when the merchant accepts cards and sends only the method', async () => {
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: ['CARD', 'PAY_BY_BANK'] }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/checkout');
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Card');
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();

    expect(api.startGuestPayment).toHaveBeenCalledWith('order-200', 'CARD');
  });

  it('uses the saved menu language when loading and revalidating the checkout catalog', async () => {
    sessionStorage.setItem('blitzpay.storefront-language', 'tr');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/checkout');
    harness.detectChanges();
    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', 'tr');
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();
    expect(api.getActiveProducts.calls.allArgs()).toEqual([
      ['merchant-44', 'branch-12', 'tr'], ['merchant-44', 'branch-12', 'tr']
    ]);
  });

  it('resolves the original language on a cold checkout entry', async () => {
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Restaurant', originalMenuLanguage: 'de' }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/checkout');
    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', 'de');
  });
});

describe('GuestCheckoutComponent at a Table', () => {
  const api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
    'getMerchant', 'getBranch', 'getActiveProducts', 'getPaymentCapabilities', 'createOrder', 'startGuestPayment'
  ]);
  const location = jasmine.createSpyObj<StorefrontLocationService>('StorefrontLocationService', ['current']);
  const here = { latitude: 52.52, longitude: 13.405, accuracyMeters: 12, capturedAt: '2026-11-04T10:00:00.000Z' };
  let navigate: jasmine.Spy;

  beforeEach(async () => {
    sessionStorage.clear();
    api.createOrder.calls.reset();
    api.startGuestPayment.calls.reset();
    location.current.calls.reset();
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Brew House' }));
    api.getBranch.and.returnValue(of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe' }));
    api.getActiveProducts.and.returnValue(of([
      { productId: 'p1', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true }
    ]));
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: ['CARD'] }));
    api.createOrder.and.returnValue(of({ orderId: 'order-200' }));
    api.startGuestPayment.and.returnValue(NEVER);
    location.current.and.resolveTo(here);
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'm/:merchantId/b/:branchId/checkout', component: GuestCheckoutComponent }]),
        { provide: StorefrontApiService, useValue: api },
        { provide: StorefrontLocationService, useValue: location }
      ]
    }).compileComponents();
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    TestBed.inject(StorefrontTableService).checkIn('AB3K7Q', {
      merchantId: 'merchant-44', merchantName: 'Brew House', branchId: 'branch-12', branchName: 'Station Cafe',
      tableId: 'table-1', tableName: '5', active: true
    });
    const cart = TestBed.inject(StorefrontSessionService);
    cart.useScope('merchant-44', 'branch-12');
    cart.add({ productId: 'p1', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true });
  });

  async function open(): Promise<RouterTestingHarness> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/m/merchant-44/b/branch-12/checkout');
    harness.detectChanges();
    return harness;
  }

  it('sends the Table Code and a fresh location with an online payment', async () => {
    const harness = await open();
    expect(harness.routeNativeElement?.textContent).toContain('Your table: 5');

    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();
    await harness.fixture.whenStable();

    expect(location.current).toHaveBeenCalled();
    expect(api.createOrder).toHaveBeenCalledWith({
      branchId: 'branch-12',
      items: [{ productId: 'p1', quantity: 1 }],
      tableCode: 'AB3K7Q',
      customerLocation: here
    });
    expect(api.startGuestPayment).toHaveBeenCalledWith('order-200', 'CARD');
  });

  it('places a Cash order without an online payment and empties the cart', async () => {
    const harness = await open();
    const cash = harness.routeNativeElement!.querySelector<HTMLInputElement>('[data-testid="pay-cash"]')!;
    cash.click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();

    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();
    await harness.fixture.whenStable();

    expect(api.createOrder).toHaveBeenCalledWith({
      branchId: 'branch-12',
      items: [{ productId: 'p1', quantity: 1 }],
      tableCode: 'AB3K7Q',
      customerLocation: here,
      checkoutPaymentMethod: 'CASH'
    });
    expect(api.startGuestPayment).not.toHaveBeenCalled();
    expect(TestBed.inject(StorefrontSessionService).itemCount).toBe(0);
    expect(navigate).toHaveBeenCalledWith(['/order', 'order-200', 'confirmation'], { queryParams: { payment: 'cash' } });
  });

  it('asks for location access and creates no order when it is denied', async () => {
    location.current.and.rejectWith(new LocationUnavailableError('Allow location access to order at your table.', true));
    const harness = await open();

    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(api.createOrder).not.toHaveBeenCalled();
    expect(harness.routeNativeElement?.textContent).toContain('Allow location access to order at your table.');
  });

  it('never offers Deferred Payment, and offers Cash only at a Table', async () => {
    TestBed.inject(StorefrontTableService).clear();
    const harness = await open();

    expect(harness.routeNativeElement?.querySelector('[data-testid="pay-cash"]')).toBeNull();
    expect(harness.routeNativeElement?.textContent).not.toMatch(/deferred|pay later/i);
  });
});
