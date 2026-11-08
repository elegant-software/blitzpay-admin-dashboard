import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { StorefrontMerchant } from '../models/storefront.models';

@Component({
  selector: 'web-merchant-logo',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'merchant-logo', '[class.has-logo]': '!!merchant?.logoUrl && !failed' },
  template: `
    <img *ngIf="merchant?.logoUrl && !failed; else fallback" [src]="merchant?.logoUrl" [alt]="(merchant?.merchantName || 'Merchant') + ' logo'" (error)="failed = true" />
    <ng-template #fallback><span>{{ (merchant?.merchantName || 'M').charAt(0).toUpperCase() }}</span></ng-template>
  `
})
export class MerchantLogoComponent implements OnChanges {
  @Input() merchant: StorefrontMerchant | null = null;
  failed = false;
  ngOnChanges(): void { this.failed = false; }
}
