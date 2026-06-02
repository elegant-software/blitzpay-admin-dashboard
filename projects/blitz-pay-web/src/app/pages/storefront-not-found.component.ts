import { Component } from '@angular/core';

@Component({
  selector: 'web-storefront-not-found',
  standalone: true,
  template: `
    <article class="surface missing">
      <p class="eyebrow">BlitzPay</p>
      <h1>This link is not available</h1>
      <p>Scan a merchant order QR code or open a branch catalog link to continue.</p>
    </article>
  `
})
export class StorefrontNotFoundComponent {}
