import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { OrderConfirmationComponent } from './order-confirmation.component';

describe('Payment return', () => {
  it('does not claim success based on the return URL alone', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ orderId: 'o1' }) } } },
      { provide: StorefrontApiService, useValue: { getGuestOrder: () => of({ orderId: 'o1', status: 'CREATED' }) } }
    ] });
    const fixture = TestBed.createComponent(OrderConfirmationComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Payment confirmed');
    expect(fixture.nativeElement.textContent).toContain('Checking your payment');
  });
});
