import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { parseTableCode } from './table-code';

@Component({
  selector: 'web-open-shopper-app',
  standalone: true,
  imports: [CommonModule, StorefrontTranslatePipe],
  template: `
    <div *ngIf="appUrl" class="table-note">
      <a class="checkout-button" [href]="appUrl" data-testid="shopper-app-link">{{ 'Open shopper app' | storefrontTranslate }}</a>
      <span>{{ 'Or continue ordering here in your browser.' | storefrontTranslate }}</span>
    </div>
  `
})
export class OpenShopperAppComponent implements OnChanges {
  @Input() code: string | null | undefined;
  private readonly sanitizer = inject(DomSanitizer);
  appUrl: SafeUrl | null = null;

  ngOnChanges(): void {
    const code = parseTableCode(this.code);
    this.appUrl = code
      ? this.sanitizer.bypassSecurityTrustUrl(environment.shopperAppScheme + '://t/' + code)
      : null;
  }
}
