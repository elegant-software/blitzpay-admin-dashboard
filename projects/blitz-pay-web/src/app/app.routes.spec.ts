import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { StorefrontApiService } from './services/storefront-api.service';
import { storefrontRoutes } from './app.routes';

describe('Web Storefront public routes', () => {
  const api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
    'getMerchant',
    'getBranch',
    'getActiveProducts',
    'getPaymentCapabilities',
    'getOrder'
  ]);

  beforeEach(async () => {
    sessionStorage.clear();
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Brew House' }));
    api.getBranch.and.returnValue(of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe' }));
    api.getActiveProducts.and.returnValue(of([]));
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: [] }));
    api.getOrder.and.returnValue(of({ orderId: 'order-200', status: 'CREATED', items: [] }));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(storefrontRoutes),
        { provide: StorefrontApiService, useValue: api }
      ]
    }).compileComponents();
  });

  it('renders a branch-scoped Web Catalog from its public URL', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/m/merchant-44/b/branch-12');

    expect(harness.routeNativeElement?.textContent).toContain('Shop online');
    expect(harness.routeNativeElement?.textContent).toContain('Station Cafe');
    expect(api.getActiveProducts).toHaveBeenCalledWith('merchant-44', 'branch-12', null);
  });

  it('renders the QR Order Landing for a universal order URL', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/order/order-200');

    expect(harness.routeNativeElement?.textContent).toContain('Order order-200');
    expect(harness.routeNativeElement?.textContent).toContain('Pay as guest');
    expect(api.getOrder).toHaveBeenCalledWith('order-200');
  });

  it('renders the post-payment confirmation route', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/order/order-200/confirmation');

    expect(harness.routeNativeElement?.textContent).toContain('Payment confirmed');
    expect(harness.routeNativeElement?.textContent).toContain('order-200');
  });
});
