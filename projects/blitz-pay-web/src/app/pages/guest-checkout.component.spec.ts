import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, of } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
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
