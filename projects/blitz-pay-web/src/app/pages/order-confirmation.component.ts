import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { StorefrontOrder, StorefrontPreparationStatus } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';

const PREPARATION_LABELS: Record<StorefrontPreparationStatus, string> = {
  RECEIVED: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready for pickup'
};

@Component({
  selector: 'web-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="surface confirmation">
      <span *ngIf="paid" class="confirmation-mark" aria-hidden="true">&#10003;</span>
      <p class="eyebrow">Guest Checkout</p>
      <h1>{{ paid ? 'Payment confirmed' : cash ? 'Order placed' : 'Checking your payment' }}</h1>
      <p *ngIf="paid">Your payment{{ reference ? ' for order ' + reference : '' }} has been received.</p>
      <p *ngIf="!paid && cash" data-testid="cash-note">Please pay staff in cash. Your order shows as paid once they confirm they received it.</p>
      <p *ngIf="!paid && !cash">We're waiting for live payment confirmation. You can check again or return to checkout.</p>
      <p *ngIf="tableName" class="fulfillment-label">Your table: {{ tableName }}</p>
      <section *ngIf="pickupNumber != null || preparationStatus" class="pickup" aria-live="polite">
        <ng-container *ngIf="pickupNumber != null">
          <p class="eyebrow">Pickup Number</p>
          <strong class="pickup-number">{{ pickupNumber }}</strong>
        </ng-container>
        <span *ngIf="preparationStatus" class="preparation-status" [class.ready]="preparationStatus === 'READY'">{{ preparationLabel }}</span>
      </section>
      <p *ngIf="errorMessage" class="storefront-alert" role="alert">{{ errorMessage }}</p>
      <button *ngIf="!paid" class="checkout-button" type="button" [disabled]="loading" (click)="refresh()">{{ loading ? 'Checking...' : 'Check payment status' }}</button>
      <a class="back-link" *ngIf="!paid && !cash && checkoutLink" [routerLink]="checkoutLink">Back to checkout</a>
      <p class="muted">Install BlitzPay to keep payment ready for your next visit.</p>
    </article>
  `
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
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
  /** The guest chose Cash Payment: the order is placed and waits for staff to confirm the cash. */
  readonly cash = this.route.snapshot.queryParamMap?.get('payment') === 'cash';
  tableName: string | null = null;

  get preparationLabel(): string {
    return this.preparationStatus ? PREPARATION_LABELS[this.preparationStatus] : '';
  }

  ngOnInit(): void {
    this.cart.restorePaymentReturn(this.orderId);
    // Stripe appends redirect_status after a card redirect (e.g. 3DS). Only the order status, set by the webhook, means paid.
    if (this.route.snapshot.queryParamMap?.get('redirect_status') === 'failed') {
      this.errorMessage = 'Your payment did not go through. Please try again.';
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
          : 'Unable to check payment. Please try again.';
      }
    });
  }

  private apply(order: StorefrontOrder): void {
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
      error: () => this.events = null
    });
  }

  private closeEvents(): void {
    this.events?.unsubscribe();
    this.events = null;
  }
}
