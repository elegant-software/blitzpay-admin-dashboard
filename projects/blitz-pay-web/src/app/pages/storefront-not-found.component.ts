import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { Component } from '@angular/core';

@Component({
  selector: 'web-storefront-not-found',
  standalone: true,
  imports: [StorefrontTranslatePipe],
  template: `
    <article class="surface missing">
      <p class="eyebrow">BlitzPay</p>
      <h1>{{ 'This link is not available' | storefrontTranslate }}</h1>
      <p>{{ 'Scan a merchant order QR code or open a branch catalog link to continue.' | storefrontTranslate }}</p>
    </article>
  `
})
export class StorefrontNotFoundComponent {}
