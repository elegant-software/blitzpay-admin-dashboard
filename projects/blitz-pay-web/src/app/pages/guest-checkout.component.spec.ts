import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { LocationUnavailableError, StorefrontLocationService } from '../table/storefront-location.service';
import { StorefrontTableService } from '../table/storefront-table.service';
import { GuestCheckoutComponent } from './guest-checkout.component';
import { NotificationService } from '../notifications/notification.service';

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
      customerLocation: here,
      guestCount: 2
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
      checkoutPaymentMethod: 'CASH',
      guestCount: 2
    });
    expect(api.startGuestPayment).not.toHaveBeenCalled();
    expect(TestBed.inject(StorefrontSessionService).itemCount).toBe(0);
    expect(navigate).toHaveBeenCalledWith(['/order', 'order-200', 'confirmation'], { queryParams: { payment: 'cash' } });
  });

  it('asks "How many people?" (default 2) at a free Table and sends the answer once', async () => {
    const harness = await open();
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('[data-testid="guest-count"]')!;
    expect(input).not.toBeNull();
    await harness.fixture.whenStable();
    input.value = '4';
    input.dispatchEvent(new Event('input'));

    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();
    await harness.fixture.whenStable();

    expect(api.createOrder.calls.mostRecent().args[0].guestCount).toBe(4);
    expect(TestBed.inject(StorefrontTableService).forBranch('merchant-44', 'branch-12')?.occupied).toBeTrue();
  });

  it('does not ask how many people when the Table is already occupied', async () => {
    TestBed.inject(StorefrontTableService).checkIn('AB3K7Q', {
      merchantId: 'merchant-44', merchantName: 'Brew House', branchId: 'branch-12', branchName: 'Station Cafe',
      tableId: 'table-1', tableName: '5', active: true, occupied: true
    });
    const harness = await open();
    expect(harness.routeNativeElement?.querySelector('[data-testid="guest-count"]')).toBeNull();

    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();
    await harness.fixture.whenStable();

    expect(api.createOrder.calls.mostRecent().args[0].guestCount).toBeUndefined();
  });

  it('shows an actionable accuracy rejection beside Place order and preserves the cart for retry', async () => {
    const toasts: string[] = [];
    TestBed.inject(NotificationService).messageObserver.subscribe(message => {
      for (const item of Array.isArray(message) ? message : [message]) toasts.push(item.detail ?? '');
    });
    const detail = 'customerLocation accuracy is insufficient for WALK_IN_ORDERING';
    api.createOrder.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400, error: { status: 400, detail, code: 'LOCATION_INACCURATE' }
    })));
    const harness = await open();
    harness.routeNativeElement!.querySelector<HTMLInputElement>('[data-testid="pay-cash"]')!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    const panel = harness.routeNativeElement!.querySelector('.payment-panel')!;
    const alert = panel.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Your location is too approximate');
    expect(alert?.textContent).toContain('precise location');
    expect(alert?.textContent).not.toContain('WALK_IN_ORDERING');
    expect(toasts.length).toBe(1);
    expect(toasts[0]).toContain('precise location');
    const button = panel.querySelector<HTMLButtonElement>('[data-testid="confirm-payment"]')!;
    expect(button.disabled).toBeFalse();
    expect(button.textContent).toContain('Place order');
    expect(TestBed.inject(StorefrontSessionService).itemCount).toBe(1);
    expect(navigate).not.toHaveBeenCalled();
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

  it('never offers Deferred Payment, and offers Cash without a Table', async () => {
    TestBed.inject(StorefrontTableService).clear();
    const harness = await open();

    expect(harness.routeNativeElement?.querySelector('[data-testid="pay-cash"]')).not.toBeNull();
    expect(harness.routeNativeElement?.textContent).not.toMatch(/deferred|pay later/i);
  });
});
