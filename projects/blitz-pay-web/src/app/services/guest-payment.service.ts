import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PayByBankCheckout, StorefrontOrder } from '../models/storefront.models';
import { StorefrontApiService } from './storefront-api.service';
import { StorefrontSessionService } from './storefront-session.service';

@Injectable({ providedIn: 'root' })
export class GuestPaymentService {
  private readonly api = inject(StorefrontApiService);
  private readonly cart = inject(StorefrontSessionService);

  start(order: StorefrontOrder, merchantId: string, branchId: string, productId?: string): Observable<PayByBankCheckout> {
    const path = `${window.location.origin}/order/${encodeURIComponent(order.orderId)}`;
    return this.api.createPayByBankCheckout({
      orderId: order.orderId, merchantId, branchId, productId,
      successUrl: `${path}/confirmation`, cancelUrl: path
    }).pipe(tap(() => this.cart.savePaymentReturn(order.orderId)));
  }
}
