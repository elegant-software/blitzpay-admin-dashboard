import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { StorefrontMerchant } from '../models/storefront.models';
import { BONA_ME_LOGO, BONA_ME_MERCHANT_ID } from '../services/storefront-brand.service';

@Component({
  selector: 'web-merchant-logo',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'merchant-logo', '[class.has-logo]': '!!logoUrl && !failed', '[class.boname-logo]': 'bonaMe' },
  template: `
    <img *ngIf="logoUrl && !failed; else fallback" [src]="logoUrl" [alt]="(merchant?.merchantName || 'Merchant') + ' logo'" (error)="failed = true" />
    <ng-template #fallback><span>{{ bonaMe ? 'bona’me' : (merchant?.merchantName || 'M').charAt(0).toUpperCase() }}</span></ng-template>
  `
})
export class MerchantLogoComponent implements OnChanges {
  @Input() merchant: StorefrontMerchant | null = null;
  @Input() merchantId = '';
  failed = false;
  get bonaMe(): boolean { return this.merchantId === BONA_ME_MERCHANT_ID; }
  get logoUrl(): string | null { return this.bonaMe ? BONA_ME_LOGO : this.merchant?.logoUrl ?? null; }
  ngOnChanges(): void { this.failed = false; }
}
