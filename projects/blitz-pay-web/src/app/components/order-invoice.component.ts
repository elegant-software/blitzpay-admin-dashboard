import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, finalize } from 'rxjs';
import * as QRCode from 'qrcode';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { apiErrorMessage } from '../notifications/notification.service';

@Component({
  selector: 'web-order-invoice', standalone: true,
  imports: [CommonModule, StorefrontTranslatePipe],
  template: `<section class="invoice" aria-live="polite">
    <h2>{{ 'Your invoice' | storefrontTranslate }}</h2>
    <p *ngIf="loading">{{ 'Preparing your invoice...' | storefrontTranslate }}</p>
    <p *ngIf="message" role="status">{{ message | storefrontTranslate }}</p>
    <ng-container *ngIf="url && !loading">
      <a data-testid="invoice-download" [href]="url" target="_blank" rel="noopener noreferrer">{{ 'Download invoice' | storefrontTranslate }}</a>
      <img *ngIf="qr" data-testid="invoice-qr" [src]="qr" width="240" height="240" [alt]="'Scan to download your invoice' | storefrontTranslate" />
      <p>{{ 'Scan to download your invoice' | storefrontTranslate }}</p>
      <p class="muted">{{ 'This download link expires in 30 minutes. Refresh to get a new link.' | storefrontTranslate }}</p>
    </ng-container>
    <button type="button" [disabled]="loading" (click)="load()">{{ 'Refresh invoice' | storefrontTranslate }}</button>
  </section>`,
  styles: `.invoice{margin-block:1.5rem;display:grid;justify-items:center;gap:.75rem}.invoice p{margin:0}.invoice img{max-width:100%;height:auto}.invoice a{font-weight:700}`
})
export class OrderInvoiceComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) orderId = '';
  private readonly api = inject(StorefrontApiService);
  private request?: Subscription;
  private generation = 0;
  private expiry?: ReturnType<typeof setTimeout>;
  loading = false;
  url = '';
  qr = '';
  message = '';

  ngOnChanges(): void { this.load(); }
  ngOnDestroy(): void { this.generation++; this.request?.unsubscribe(); clearTimeout(this.expiry); }

  load(): void {
    this.request?.unsubscribe();
    clearTimeout(this.expiry);
    const generation = ++this.generation;
    this.url = ''; this.qr = ''; this.message = '';
    if (!this.orderId) return;
    this.loading = true;
    this.request = this.api.getGuestInvoice(this.orderId).pipe(finalize(() => this.loading = false)).subscribe({
      next: invoice => {
        this.url = invoice.url;
        this.expiry = setTimeout(() => {
          this.generation++;
          this.url = ''; this.qr = '';
          this.message = 'Your invoice is not ready yet. Please refresh in a moment.';
        }, 30 * 60_000);
        QRCode.toDataURL(invoice.url, { width: 240, margin: 4 }).then(qr => {
          if (generation === this.generation) this.qr = qr;
        }).catch(() => {
          if (generation === this.generation) this.message = 'Unable to create the QR code. Use the download link.';
        });
      },
      error: (error: HttpErrorResponse) => {
        this.message = error.status === 404
          ? 'Your invoice is not ready yet. Please refresh in a moment.'
          : apiErrorMessage(error, 'Unable to load your invoice. Please try again.');
      }
    });
  }
}
