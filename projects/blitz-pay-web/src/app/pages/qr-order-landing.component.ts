import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { StorefrontOrder } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { GuestPaymentService } from '../services/guest-payment.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { NotificationService } from '../notifications/notification.service';
import { StorefrontBrandService } from '../services/storefront-brand.service';

@Component({
  selector: 'web-qr-order-landing',
  standalone: true,
  imports: [StorefrontTranslatePipe, CommonModule],
  template: `
    <section class="page-hero centered">
      <p class="eyebrow">{{ 'QR Order Landing' | storefrontTranslate }}</p>
      <h1>{{ (order?.reference ? 'Order {0}' : 'Your order') | storefrontTranslate: [order?.reference] }}</h1>
      <p class="lede">{{ 'Review your order and complete payment without creating an account.' | storefrontTranslate }}</p>
    </section>

    <article class="surface order-surface">
      <p class="muted" *ngIf="loading">{{ 'Loading order...' | storefrontTranslate }}</p>
      <p class="storefront-alert" *ngIf="errorMessage" role="alert">{{ (errorMessage | storefrontTranslate) }}</p>
      <ng-container *ngIf="order">
        <div class="order-row">
          <strong>{{ 'Status' | storefrontTranslate }}</strong>
          <span class="status-pill">{{ statusLabel | storefrontTranslate }}</span>
        </div>
        <div class="order-items" *ngIf="order.items?.length">
          <div class="order-item" *ngFor="let item of order.items">
            <span>{{ item.quantity }} &times; {{ item.name || item.productId }}</span>
            <strong *ngIf="item.lineTotalMinor != null">
              {{ item.lineTotalMinor / 100 | currency: order.currency || 'EUR' }}
            </strong>
          </div>
        </div>
        <div class="order-total" *ngIf="order.totalAmountMinor != null">
          <span>{{ 'Total' | storefrontTranslate }}</span>
          <strong>{{ order.totalAmountMinor / 100 | currency: order.currency || 'EUR' }}</strong>
        </div>
        <div class="payment-actions">
          <p>{{ 'Pay as guest' | storefrontTranslate }}</p>
          <span class="muted">{{ 'Your order is connected to the live BlitzPay checkout record.' | storefrontTranslate }}</span>
          <button *ngIf="canPay" type="button" data-testid="pay-order" [disabled]="paying" (click)="pay()">
            {{ paying ? ('Opening payment...' | storefrontTranslate) : ('Pay by Bank as guest' | storefrontTranslate) }}
          </button>
          <p *ngIf="!canPay && !loading && unpaid" class="muted">{{ 'Guest payment is not currently available for this order.' | storefrontTranslate }}</p>
        </div>
      </ng-container>
    </article>
  `
})
export class QrOrderLandingComponent implements OnInit {
  private readonly brand = inject(StorefrontBrandService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  private readonly payment = inject(GuestPaymentService);
  private readonly cart = inject(StorefrontSessionService);

  readonly orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
  loading = true;
  order: StorefrontOrder | null = null;
  errorMessage = '';
  paying = false;
  paymentAvailable = false;

  get unpaid(): boolean { return ['CREATED', 'PENDING', 'PENDING_PAYMENT', 'AWAITING_PAYMENT', 'UNPAID'].includes(this.order?.status ?? ''); }
  get canPay(): boolean { return this.unpaid && this.paymentAvailable && !!this.order?.merchantId && !!this.order?.branchId; }

  pay(): void {
    if (!this.canPay || this.paying || !this.order) return;
    this.paying = true;
    this.errorMessage = '';
    this.payment.start(this.order, this.order.merchantId!, this.order.branchId!, this.order.items?.[0]?.productId)
      .pipe(finalize(() => this.paying = false)).subscribe({
        next: checkout => window.location.assign(checkout.checkoutUrl),
        error: error => this.errorMessage = this.toMessage(error, 'Unable to start payment. Please try again.')
      });
  }

  ngOnInit(): void {
    this.cart.restorePaymentReturn(this.orderId);
    this.api.getOrder(this.orderId).pipe(finalize(() => {
      this.loading = false;
    })).subscribe({
      next: (order) => {
        this.brand.useMerchant(order.merchantId);
        this.order = order;
        if (order.merchantId && this.unpaid) {
          this.api.getPaymentCapabilities(order.merchantId).subscribe({
            next: capabilities => this.paymentAvailable = capabilities.enabledPaymentFlows.includes('PAY_BY_BANK'),
            error: error => this.errorMessage = this.toMessage(error, 'Unable to load payment options.')
          });
        }
      },
      error: (error: unknown) => {
        this.errorMessage = this.toMessage(error, 'Unable to load this order.');
      }
    });
  }

  get statusLabel(): string {
    return (this.order?.status ?? 'CREATED').replaceAll('_', ' ').toLowerCase();
  }

  private toMessage(error: unknown, fallback: string): string {
    return this.notifications.apiError(error, fallback);
  }
}
