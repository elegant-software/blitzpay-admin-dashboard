import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';

@Component({
  selector: 'web-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="surface confirmation">
      <span *ngIf="paid" class="confirmation-mark" aria-hidden="true">&#10003;</span>
      <p class="eyebrow">Guest Checkout</p>
      <h1>{{ paid ? 'Payment confirmed' : 'Checking your payment' }}</h1>
      <p *ngIf="paid">Your payment{{ reference ? ' for order ' + reference : '' }} has been received.</p>
      <p *ngIf="!paid">We're waiting for live payment confirmation. You can check again or view your order.</p>
      <p *ngIf="errorMessage" class="storefront-alert" role="alert">{{ errorMessage }}</p>
      <button *ngIf="!paid" class="checkout-button" type="button" [disabled]="loading" (click)="refresh()">{{ loading ? 'Checking...' : 'Check payment status' }}</button>
      <a class="back-link" [routerLink]="['/order', orderId]">View order</a>
      <p class="muted">Install BlitzPay to keep payment ready for your next visit.</p>
    </article>
  `
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  private readonly cart = inject(StorefrontSessionService);
  paid = false;
  loading = false;
  reference = '';
  errorMessage = '';

  readonly orderId = this.route.snapshot.paramMap.get('orderId') ?? '';

  ngOnInit(): void {
    this.cart.restorePaymentReturn(this.orderId);
    this.refresh();
  }

  refresh(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.api.getOrder(this.orderId).pipe(finalize(() => this.loading = false)).subscribe({
      next: order => { this.paid = order.status === 'PAID'; this.reference = order.reference ?? ''; },
      error: (error: unknown) => {
        this.errorMessage = error instanceof HttpErrorResponse
          ? error.error?.detail ?? error.error?.message ?? 'Unable to check payment. Please try again.'
          : 'Unable to check payment. Please try again.';
      }
    });
  }
}
