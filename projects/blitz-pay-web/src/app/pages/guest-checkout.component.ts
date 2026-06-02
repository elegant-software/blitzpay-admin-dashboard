import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  StorefrontBranch,
  StorefrontMerchant,
  StorefrontPaymentCapabilities,
  StorefrontPaymentMethod,
  StorefrontProduct
} from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';

@Component({
  selector: 'guest-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="merchant-hero compact">
      <div class="merchant-logo"><span>{{ (merchant?.merchantName || 'M').charAt(0) }}</span></div>
      <div>
        <p class="eyebrow">Guest checkout</p>
        <h1>Checkout securely</h1>
        <p class="fulfillment-label" *ngIf="branch">{{ merchant?.merchantName }} &middot; Fulfilled by {{ branch.name }}</p>
      </div>
    </section>
    <p class="storefront-alert" *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
    <section class="unavailable surface" *ngIf="!loading && branch?.active === false">
      <p class="eyebrow">Unavailable Branch Notice</p>
      <h2>This location is not accepting online orders.</h2>
    </section>
    <section class="checkout-layout" *ngIf="!loading && branch?.active !== false">
      <article class="surface checkout-summary">
        <h2>Your order</h2>
        <p class="muted" *ngIf="cart.itemCount === 0">Your cart is empty.</p>
        <div class="cart-line" *ngFor="let line of cart.lines">
          <span>{{ line.quantity }} &times; {{ line.product.name }}</span>
          <strong>{{ line.product.unitPrice * line.quantity | currency: currency }}</strong>
        </div>
        <div class="cart-total" *ngIf="cart.itemCount > 0">
          <span>Subtotal</span>
          <strong>{{ cart.subtotal | currency: currency }}</strong>
        </div>
        <a class="back-link" [routerLink]="['/m', merchantId, 'b', branchId]">Review cart</a>
      </article>
      <article class="surface payment-panel">
        <p class="surface-label">Payment</p>
        <h2>Choose how to pay</h2>
        <label class="payment-choice" *ngIf="payByBankAvailable">
          <input type="radio" name="payment" [(ngModel)]="selectedPaymentMethod" value="STRIPE" />
          <span><strong>Pay by Bank</strong><small>Secure hosted payment powered by Stripe</small></span>
        </label>
        <p class="muted" *ngIf="!payByBankAvailable">No hosted payment method is available for this merchant.</p>
        <div class="storefront-alert" *ngIf="cartNeedsReview">
          Product availability or pricing has changed. Review and accept the updated cart before paying.
          <button class="review-button" type="button" (click)="acceptCartUpdates()">Accept updates</button>
        </div>
        <button
          class="checkout-button"
          type="button"
          data-testid="confirm-payment"
          [disabled]="cart.itemCount === 0 || !selectedPaymentMethod || cartNeedsReview || checkingOut"
          (click)="confirmPayment()"
        >{{ checkingOut ? 'Opening payment...' : 'Confirm and pay' }}</button>
      </article>
    </section>
  `
})
export class GuestCheckoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  readonly cart = inject(StorefrontSessionService);
  readonly merchantId = this.route.snapshot.paramMap.get('merchantId') ?? '';
  readonly branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
  readonly currency = environment.currency;
  merchant: StorefrontMerchant | null = null;
  branch: StorefrontBranch | null = null;
  products: StorefrontProduct[] = [];
  capabilities: StorefrontPaymentCapabilities | null = null;
  selectedPaymentMethod: StorefrontPaymentMethod | undefined;
  cartNeedsReview = false;
  loading = true;
  checkingOut = false;
  errorMessage = '';

  ngOnInit(): void {
    if (!this.cart.useScope(this.merchantId, this.branchId)) {
      this.errorMessage = 'Your cart contains items from another location.';
    }
    forkJoin({
      merchant: this.api.getMerchant(this.merchantId),
      branch: this.api.getBranch(this.merchantId, this.branchId),
      products: this.api.getActiveProducts(this.merchantId, this.branchId),
      capabilities: this.api.getPaymentCapabilities(this.merchantId)
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: ({ merchant, branch, products, capabilities }) => {
        this.merchant = merchant;
        this.branch = branch;
        this.products = products;
        this.capabilities = capabilities;
        this.cartNeedsReview = this.cart.reconcile(products, false);
        if (this.payByBankAvailable) this.selectedPaymentMethod = 'STRIPE';
      },
      error: () => this.errorMessage = 'Unable to load guest checkout.'
    });
  }

  get payByBankAvailable(): boolean {
    return !!this.capabilities?.enabledPaymentFlows.includes('PAY_BY_BANK');
  }

  acceptCartUpdates(): void {
    this.cart.reconcile(this.products, true);
    this.cartNeedsReview = false;
  }

  confirmPayment(): void {
    if (!this.selectedPaymentMethod || this.cart.itemCount === 0 || this.cartNeedsReview || this.checkingOut || this.branch?.active === false) return;
    this.checkingOut = true;
    this.errorMessage = '';
    this.api.getActiveProducts(this.merchantId, this.branchId).pipe(
      switchMap((products) => {
        this.products = products;
        if (this.cart.reconcile(products, false)) {
          this.cartNeedsReview = true;
          return throwError(() => new Error('Your cart changed. Review updates before payment.'));
        }
        return this.api.createOrder({
          branchId: this.branchId,
          orderType: 'PRE_ORDER',
          usesDeferredPayment: false,
          paymentMethod: this.selectedPaymentMethod,
          items: this.cart.lines.map((line) => ({ productId: line.product.productId, quantity: line.quantity }))
        });
      }),
      switchMap((order) => this.api.createPayByBankCheckout({
        orderId: order.orderId,
        merchantId: this.merchantId,
        branchId: this.branchId,
        productId: this.cart.lines[0]?.product.productId,
        successUrl: `${window.location.origin}/order/${encodeURIComponent(order.orderId)}/confirmation`,
        cancelUrl: `${window.location.origin}/order/${encodeURIComponent(order.orderId)}`
      }).pipe(map((checkout) => checkout.checkoutUrl))),
      finalize(() => this.checkingOut = false)
    ).subscribe({
      next: (checkoutUrl) => window.location.assign(checkoutUrl),
      error: (error: Error) => this.errorMessage = error.message || 'Unable to start payment.'
    });
  }
}
