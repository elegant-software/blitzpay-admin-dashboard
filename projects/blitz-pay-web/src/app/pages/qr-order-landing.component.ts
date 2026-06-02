import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { StorefrontOrder } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';

@Component({
  selector: 'web-qr-order-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-hero centered">
      <p class="eyebrow">QR Order Landing</p>
      <h1>Order {{ orderId }}</h1>
      <p class="lede">Review your order and complete payment without creating an account.</p>
    </section>

    <article class="surface order-surface">
      <p class="muted" *ngIf="loading">Loading order...</p>
      <p class="storefront-alert" *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
      <ng-container *ngIf="order">
        <div class="order-row">
          <strong>Status</strong>
          <span class="status-pill">{{ statusLabel }}</span>
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
          <span>Total</span>
          <strong>{{ order.totalAmountMinor / 100 | currency: order.currency || 'EUR' }}</strong>
        </div>
        <div class="payment-actions">
          <p>Pay as guest</p>
          <span class="muted">Your order is connected to the live BlitzPay checkout record.</span>
        </div>
      </ng-container>
    </article>
  `
})
export class QrOrderLandingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);

  readonly orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
  loading = true;
  order: StorefrontOrder | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.api.getOrder(this.orderId).pipe(finalize(() => {
      this.loading = false;
    })).subscribe({
      next: (order) => {
        this.order = order;
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
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.error?.detail ?? error.error?.detail ?? error.error?.message;
      if (typeof detail === 'string' && detail.trim()) return detail;
    }
    return fallback;
  }
}
