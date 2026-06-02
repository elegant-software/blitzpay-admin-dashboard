import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, of } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { GuestCheckoutComponent } from './guest-checkout.component';

describe('GuestCheckoutComponent', () => {
  const api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
    'getMerchant', 'getBranch', 'getActiveProducts', 'getPaymentCapabilities', 'createOrder', 'createPayByBankCheckout'
  ]);

  beforeEach(async () => {
    sessionStorage.clear();
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Brew House' }));
    api.getBranch.and.returnValue(of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe' }));
    api.getActiveProducts.and.returnValue(of([
      { productId: 'p1', branchId: 'branch-12', name: 'Coffee', unitPrice: 3.5, active: true }
    ]));
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: ['PAY_BY_BANK'] }));
    api.createOrder.and.returnValue(of({ orderId: 'order-200' }));
    api.createPayByBankCheckout.and.returnValue(NEVER);
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
      orderType: 'PRE_ORDER',
      usesDeferredPayment: false,
      paymentMethod: 'STRIPE',
      items: [{ productId: 'p1', quantity: 1 }]
    });
  });
});
