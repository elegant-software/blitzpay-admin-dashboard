import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PayByBankCheckout, StorefrontOrder, StorefrontPayment, StorefrontPaymentMethod } from '../models/storefront.models';
import { StorefrontApiService } from './storefront-api.service';
import { StorefrontSessionService } from './storefront-session.service';

/** A mounted Stripe Payment Element. [confirm] navigates to the return URL on success, otherwise resolves with an error message. */
export interface CardPaymentForm {
  confirm(returnUrl: string): Promise<string>;
}

// ponytail: Stripe.js loaded from js.stripe.com (Stripe requires that origin) and typed as any; no @stripe/stripe-js dependency.
let stripeJs: Promise<any> | undefined;
function loadStripeJs(): Promise<any> {
  return stripeJs ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => resolve((window as any).Stripe);
    script.onerror = () => { stripeJs = undefined; reject(new Error('Unable to load the card form. Please try again.')); };
    document.head.appendChild(script);
  });
}

@Injectable({ providedIn: 'root' })
export class GuestPaymentService {
  private readonly api = inject(StorefrontApiService);
  private readonly cart = inject(StorefrontSessionService);

  /** QR order landing (merchant-created orders) still uses the shopper Pay by Bank endpoint. */
  start(order: StorefrontOrder, merchantId: string, branchId: string, productId?: string): Observable<PayByBankCheckout> {
    const path = `${window.location.origin}/order/${encodeURIComponent(order.orderId)}`;
    return this.api.createPayByBankCheckout({
      orderId: order.orderId, merchantId, branchId, productId,
      successUrl: `${path}/confirmation`, cancelUrl: path
    }).pipe(tap(() => this.cart.savePaymentReturn(order.orderId)));
  }

  /** Guest checkout: authorised by the guest_token cookie set when the order was created. */
  startGuest(orderId: string, method: StorefrontPaymentMethod): Observable<StorefrontPayment> {
    return this.api.startGuestPayment(orderId, method).pipe(tap(() => this.cart.savePaymentReturn(orderId)));
  }

  async mountCard(payment: StorefrontPayment, host: HTMLElement): Promise<CardPaymentForm> {
    if (!payment.clientSecret || !payment.publishableKey) throw new Error('Card payment is not available.');
    const Stripe = await loadStripeJs();
    // Direct charge: the PaymentIntent lives on the merchant's connected account.
    const stripe = Stripe(payment.publishableKey, { stripeAccount: payment.connectedAccountId });
    const elements = stripe.elements({ clientSecret: payment.clientSecret });
    elements.create('payment').mount(host);
    return {
      confirm: async (returnUrl) => {
        const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
        return error?.message ?? 'Payment could not be completed.';
      }
    };
  }
}
