import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'web-order-confirmation',
  standalone: true,
  template: `
    <article class="surface confirmation">
      <span class="confirmation-mark" aria-hidden="true">&#10003;</span>
      <p class="eyebrow">Guest Checkout</p>
      <h1>Payment confirmed</h1>
      <p>Your payment for order <strong>{{ orderId }}</strong> has been received.</p>
      <p class="muted">Install BlitzPay to keep payment ready for your next visit.</p>
    </article>
  `
})
export class OrderConfirmationComponent {
  private readonly route = inject(ActivatedRoute);

  readonly orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
}
