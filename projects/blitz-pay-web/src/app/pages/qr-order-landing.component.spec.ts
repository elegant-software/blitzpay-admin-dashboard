import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { QrOrderLandingComponent } from './qr-order-landing.component';

describe('QR Order Landing', () => {
  let api: jasmine.SpyObj<StorefrontApiService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('api', ['getOrder', 'getPaymentCapabilities', 'createPayByBankCheckout']);
    api.getOrder.and.returnValue(of({ orderId: 'uuid-secret', merchantId: 'm', branchId: 'b', status: 'CREATED', reference: 'TABLE-42' } as any));
    api.getPaymentCapabilities.and.returnValue(of({ enabledPaymentFlows: ['PAY_BY_BANK'] }));
    api.createPayByBankCheckout.and.returnValue(NEVER);
    TestBed.configureTestingModule({ providers: [
      { provide: StorefrontApiService, useValue: api },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ orderId: 'uuid-secret' }) } } }
    ] });
  });
  it('shows the readable reference and pays the existing order without creating another', () => {
    const fixture = TestBed.createComponent(QrOrderLandingComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('TABLE-42');
    fixture.nativeElement.querySelector('button[data-testid="pay-order"]').click();
    expect(api.createPayByBankCheckout).toHaveBeenCalledWith(jasmine.objectContaining({ orderId: 'uuid-secret', merchantId: 'm', branchId: 'b' }));
  });
  it('does not offer payment for a paid order', () => {
    api.getOrder.and.returnValue(of({ orderId: 'uuid-secret', merchantId: 'm', branchId: 'b', status: 'PAID' }));
    const fixture = TestBed.createComponent(QrOrderLandingComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[data-testid="pay-order"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('h1').textContent).not.toContain('uuid-secret');
  });
});
