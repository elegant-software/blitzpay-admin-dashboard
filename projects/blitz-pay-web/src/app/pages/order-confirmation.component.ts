import { OrderInvoiceComponent } from '../components/order-invoice.component';
import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { AppDownloadComponent } from '../components/app-download.component';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { StorefrontOrder, StorefrontPreparationStatus } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { NotificationService } from '../notifications/notification.service';
import { StorefrontBrandService } from '../services/storefront-brand.service';

const PREPARATION_LABELS: Record<StorefrontPreparationStatus, string> = {
  RECEIVED: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready for pickup'
};

@Component({
  selector: 'web-order-confirmation',
  standalone: true,
  imports: [StorefrontTranslatePipe, CommonModule, RouterLink, AppDownloadComponent, OrderInvoiceComponent],
  template: `
    <article class="surface confirmation">
      <span *ngIf="paid" class="confirmation-mark" aria-hidden="true">&#10003;</span>
      <p class="eyebrow">{{ 'Guest Checkout' | storefrontTranslate }}</p>
      <h1>{{ paid ? ('Payment confirmed' | storefrontTranslate) : cash ? ('Order placed' | storefrontTranslate) : ('Checking your payment' | storefrontTranslate) }}</h1>
      <p *ngIf="paid">{{ (reference ? 'Your payment for order {0} has been received.' : 'Your payment has been received.') | storefrontTranslate: [reference] }}</p>
      <p *ngIf="!paid && payment === 'cash'" data-testid="cash-note">{{ 'Please pay staff in cash. Your order shows as paid once they confirm they received it.' | storefrontTranslate }}</p>
      <p *ngIf="!paid && payment === 'terminal'" data-testid="terminal-note">{{ 'Staff will bring the card terminal to you. Your order shows as paid once they confirm the payment.' | storefrontTranslate }}</p>
      <p *ngIf="!paid && !cash">{{ 'We\\'re waiting for live payment confirmation. You can check again or return to checkout.' | storefrontTranslate }}</p>
      <p *ngIf="tableName" class="fulfillment-label">{{ 'Your table: {0}' | storefrontTranslate: [tableName] }}</p>
      <section *ngIf="pickupNumber != null || preparationStatus" class="pickup" aria-live="polite">
        <ng-container *ngIf="pickupNumber != null">
          <p class="eyebrow">{{ 'Pickup Number' | storefrontTranslate }}</p>
          <strong class="pickup-number">{{ pickupNumber }}</strong>
        </ng-container>
        <span *ngIf="preparationStatus" class="preparation-status" [class.ready]="preparationStatus === 'READY'">{{ (preparationLabel | storefrontTranslate) }}</span>
      </section>
      <p *ngIf="errorMessage" class="storefront-alert" role="alert">{{ (errorMessage | storefrontTranslate) }}</p>
      <button *ngIf="!paid" class="checkout-button" type="button" [disabled]="loading" (click)="refresh()">{{ loading ? ('Checking...' | storefrontTranslate) : ('Check payment status' | storefrontTranslate) }}</button>
      <a class="back-link" *ngIf="!paid && !cash && checkoutLink" [routerLink]="checkoutLink">{{ 'Back to checkout' | storefrontTranslate }}</a>
      <web-order-invoice *ngIf="paid" [orderId]="orderId" />
      <web-app-download *ngIf="paid" />
    </article>
  `
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  private readonly brand = inject(StorefrontBrandService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  private readonly cart = inject(StorefrontSessionService);
  private events: Subscription | null = null;
  paid = false;
  loading = false;
  reference = '';
  errorMessage = '';
  checkoutLink: string[] | null = null;
  pickupNumber: number | null = null;
  preparationStatus: StorefrontPreparationStatus | null = null;

  readonly orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
  /** The guest pays staff (cash or card terminal): the order is placed and waits for staff to confirm the payment. */
  readonly payment = this.route.snapshot.queryParamMap?.get('payment');
  readonly cash = this.payment === 'cash' || this.payment === 'terminal';
  tableName: string | null = null;

  get preparationLabel(): string {
    return this.preparationStatus ? PREPARATION_LABELS[this.preparationStatus] : '';
  }

  ngOnInit(): void {
    this.cart.restorePaymentReturn(this.orderId);
    // Stripe appends redirect_status after a card redirect (e.g. 3DS). Only the order status, set by the webhook, means paid.
    if (this.route.snapshot.queryParamMap?.get('redirect_status') === 'failed') {
      this.errorMessage = 'Your payment did not go through. Please try again.';
      this.notifications.error(this.errorMessage);
    }
    this.refresh();
  }

  ngOnDestroy(): void {
    this.closeEvents();
  }

  refresh(): void {
    if (this.loading) return;
    this.loading = true;
    this.api.getGuestOrder(this.orderId).pipe(finalize(() => this.loading = false)).subscribe({
      next: order => {
        this.apply(order);
        this.listen();
      },
      error: (error: unknown) => {
        // 404 also covers a missing or expired guest_token cookie (order is only visible in the browser that created it).
        this.errorMessage = error instanceof HttpErrorResponse && error.status === 404
          ? 'This order can only be viewed in the browser it was placed in, for up to an hour.'
          : this.notifications.apiError(error, 'Unable to check payment. Please try again.');
        if (error instanceof HttpErrorResponse && error.status === 404) this.notifications.error(this.errorMessage);
      }
    });
  }

  private apply(order: StorefrontOrder): void {
    this.brand.useMerchant(order.merchantId);
    if (order.status === 'PAID' && !this.paid) this.notifications.success('Your payment has been confirmed.');
    if (order.preparationStatus === 'READY' && this.preparationStatus !== 'READY') this.notifications.info('Your order is ready for pickup.');
    this.paid = order.status === 'PAID';
    this.reference = order.reference ?? '';
    this.checkoutLink = order.merchantId && order.branchId ? ['/m', order.merchantId, 'b', order.branchId, 'checkout'] : null;
    this.pickupNumber = order.pickupNumber ?? null;
    this.preparationStatus = order.preparationStatus ?? null;
    this.tableName = order.tableName ?? null;
    if (this.paid) this.errorMessage = '';
    if (this.preparationStatus === 'READY') this.closeEvents();
  }

  /** Live updates; if the stream fails, the manual "Check payment status" button remains the fallback. */
  private listen(): void {
    if (this.events || this.preparationStatus === 'READY') return;
    this.events = this.api.guestOrderEvents(this.orderId).subscribe({
      next: order => this.apply(order),
      error: () => {
        this.events = null;
        this.notifications.warning('Live updates are unavailable. Use Check payment status to refresh your order.');
      }
    });
  }

  private closeEvents(): void {
    this.events?.unsubscribe();
    this.events = null;
  }
}
