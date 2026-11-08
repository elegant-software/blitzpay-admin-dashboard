import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  StorefrontBranch,
  StorefrontCustomerLocation,
  StorefrontMerchant,
  StorefrontPaymentCapabilities,
  StorefrontPaymentMethod,
  StorefrontProduct
} from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { StorefrontLanguageService } from '../services/storefront-language.service';
import { CardPaymentForm, GuestPaymentService } from '../services/guest-payment.service';
import { StorefrontTableService } from '../table/storefront-table.service';
import { StorefrontLocationService } from '../table/storefront-location.service';
import { NotificationService } from '../notifications/notification.service';

/** Online methods are paid now; CASH is paid to staff (at the Table or the counter), and the Order stays unpaid until they confirm it. */
type GuestCheckoutChoice = StorefrontPaymentMethod | 'CASH';

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
        <p class="fulfillment-label" *ngIf="tableName" data-testid="checkout-table">Your table: {{ tableName }}</p>
      </div>
    </section>
    <p class="storefront-alert" *ngIf="errorMessage && (loading || !branch || branch.active === false)" role="alert">{{ errorMessage }}</p>
    <section class="unavailable surface" *ngIf="!loading && branch?.active === false">
      <p class="eyebrow">Unavailable Branch Notice</p>
      <h2>This location is not accepting online orders.</h2>
    </section>
    <section class="checkout-layout" *ngIf="!loading && branch?.active !== false">
      <article class="surface checkout-summary">
        <h2>Your order</h2>
        <p class="muted" *ngIf="cart.itemCount === 0">Your cart is empty.</p>
          <div class="cart-line" *ngFor="let line of cart.lines" [attr.dir]="catalogLanguage.direction">
          <span><bdi dir="ltr">{{ line.quantity }}</bdi> &times; <bdi [attr.lang]="line.product.language">{{ line.product.name }}</bdi></span>
          <strong><bdi dir="ltr">{{ line.product.unitPrice * line.quantity | currency: currency }}</bdi></strong>
        </div>
        <div class="cart-total" *ngIf="cart.itemCount > 0">
          <span>Subtotal</span>
          <strong><bdi dir="ltr">{{ cart.subtotal | currency: currency }}</bdi></strong>
        </div>
        <a class="back-link" [routerLink]="['/m', merchantId, 'b', branchId]">Review cart</a>
      </article>
      <article class="surface payment-panel">
        <p class="surface-label">Payment</p>
        <h2>Choose how to pay</h2>
        <label class="payment-choice" *ngIf="cardAvailable">
          <input type="radio" name="payment" [(ngModel)]="selectedPaymentMethod" value="CARD" [disabled]="!!cardForm" />
          <span><strong>Card</strong><small>Card details go straight to Stripe, never to BlitzPay</small></span>
        </label>
        <label class="payment-choice" *ngIf="payByBankAvailable">
          <input type="radio" name="payment" [(ngModel)]="selectedPaymentMethod" value="PAY_BY_BANK" [disabled]="!!cardForm" />
          <span><strong>Pay by Bank</strong><small>Secure hosted payment powered by Stripe</small></span>
        </label>
        <label class="payment-choice">
          <input type="radio" name="payment" [(ngModel)]="selectedPaymentMethod" value="CASH" data-testid="pay-cash" [disabled]="!!cardForm || !!orderId" />
          <span><strong>Cash</strong><small>Pay staff at your table or the counter. Your order is unpaid until they confirm the cash.</small></span>
        </label>
        <label class="payment-choice guest-count" *ngIf="askGuestCount">
          <span><strong>How many people?</strong><small>At your table, including you.</small></span>
          <input type="number" name="guestCount" min="1" max="50" step="1" data-testid="guest-count" [(ngModel)]="guestCount" />
        </label>
        <p class="muted small" *ngIf="tableCode">To order at your table we check your location once when you place the order.</p>
        <div #cardHost class="card-element" data-testid="card-element" [hidden]="!cardForm"></div>
        <div class="storefront-alert" *ngIf="cartNeedsReview">
          Product availability or pricing has changed. Review and accept the updated cart before paying.
          <button class="review-button" type="button" (click)="acceptCartUpdates()">Accept updates</button>
        </div>
        <div class="storefront-alert" *ngIf="errorMessage" role="alert" aria-live="assertive">
          <p>{{ errorMessage }}</p>
        </div>
        <button
          class="checkout-button"
          type="button"
          data-testid="confirm-payment"
          [disabled]="cart.itemCount === 0 || !selectedPaymentMethod || cartNeedsReview || checkingOut"
          (click)="confirmPayment()"
          *ngIf="!cardForm"
        >{{ confirmLabel }}</button>
        <button class="checkout-button" type="button" data-testid="pay-card" *ngIf="cardForm" [disabled]="checkingOut" (click)="payByCard()">
          {{ checkingOut ? 'Processing...' : 'Pay now' }}
        </button>
      </article>
    </section>
  `
})
export class GuestCheckoutComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  private readonly payment = inject(GuestPaymentService);
  private readonly router = inject(Router);
  private readonly location = inject(StorefrontLocationService);
  readonly cart = inject(StorefrontSessionService);
  readonly catalogLanguage = inject(StorefrontLanguageService);
  readonly merchantId = this.route.snapshot.paramMap.get('merchantId') ?? '';
  readonly branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
  readonly currency = environment.currency;
  private readonly tables = inject(StorefrontTableService);
  private readonly tableCheckIn = this.tables.forBranch(this.merchantId, this.branchId);
  /** Asked once, only when the Table was free when the guest checked in. */
  readonly askGuestCount = !!this.tableCheckIn?.tableCode && !this.tableCheckIn.occupied;
  guestCount = 2;
  /** Set when the guest checked in at an active Table of this Branch; the order is then a Walk-In at that Table. */
  readonly tableCode = this.tableCheckIn?.tableCode ?? null;
  readonly tableName = this.tableCode ? this.tableCheckIn?.tableName ?? null : null;
  merchant: StorefrontMerchant | null = null;
  branch: StorefrontBranch | null = null;
  products: StorefrontProduct[] = [];
  capabilities: StorefrontPaymentCapabilities | null = null;
  selectedPaymentMethod: GuestCheckoutChoice | undefined;
  cartNeedsReview = false;
  loading = true;
  checkingOut = false;
  errorMessage = '';
  cardForm: CardPaymentForm | null = null;
  /** Created once; retries and method switches reuse it (its guest_token cookie is already set). */
  orderId: string | null = null;
  @ViewChild('cardHost') private cardHost?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    if (!this.cart.useScope(this.merchantId, this.branchId)) {
      this.errorMessage = 'Your cart contains items from another location.';
      this.notifications.warning(this.errorMessage);
    }
    forkJoin({
      merchant: this.api.getMerchant(this.merchantId),
      branch: this.api.getBranch(this.merchantId, this.branchId),
      capabilities: this.api.getPaymentCapabilities(this.merchantId)
    }).pipe(
      switchMap(context => this.api.getActiveProducts(this.merchantId, this.branchId, this.catalogLanguage.resolve(context.merchant))
        .pipe(map(products => ({ ...context, products })))),
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ merchant, branch, products, capabilities }) => {
        this.merchant = merchant;
        this.branch = branch;
        this.products = products;
        this.cart.updateCatalogText(products, this.merchantId, this.branchId);
        this.capabilities = capabilities;
        this.cartNeedsReview = this.cart.reconcile(products, false);
        this.selectedPaymentMethod = this.cardAvailable ? 'CARD' : this.payByBankAvailable ? 'PAY_BY_BANK' : 'CASH';
      },
      error: (error: unknown) => this.errorMessage = this.toMessage(error, 'Unable to load guest checkout.')
    });
  }

  get cardAvailable(): boolean {
    return !!this.capabilities?.enabledPaymentFlows.includes('CARD');
  }

  get payByBankAvailable(): boolean {
    return !!this.capabilities?.enabledPaymentFlows.includes('PAY_BY_BANK');
  }

  get confirmLabel(): string {
    if (this.selectedPaymentMethod === 'CASH') return this.checkingOut ? 'Placing order...' : 'Place order';
    return this.checkingOut ? 'Opening payment...' : 'Confirm and pay';
  }

  acceptCartUpdates(): void {
    this.cart.reconcile(this.products, true);
    this.cartNeedsReview = false;
  }

  confirmPayment(): void {
    const method = this.selectedPaymentMethod;
    if (!method || this.cart.itemCount === 0 || this.cartNeedsReview || this.checkingOut || this.branch?.active === false) return;
    this.checkingOut = true;
    this.errorMessage = '';
    if (method === 'CASH') return this.placeCashOrder();
    this.guestOrderId().pipe(
      switchMap((orderId) => this.payment.startGuest(orderId, method)),
      finalize(() => this.checkingOut = false)
    ).subscribe({
      next: async (payment) => {
        if (payment.checkoutUrl) return window.location.assign(payment.checkoutUrl);
        try {
          this.cardForm = await this.payment.mountCard(payment, this.cardHost!.nativeElement);
        } catch (error) {
          this.errorMessage = this.toMessage(error, 'Unable to open card payment. Please try again.');
        }
      },
      error: (error: unknown) => this.errorMessage = this.toMessage(error, 'Unable to start payment.')
    });
  }

  async payByCard(): Promise<void> {
    if (!this.cardForm || !this.orderId || this.checkingOut) return;
    this.checkingOut = true;
    this.errorMessage = '';
    // Resolves only on failure; on success Stripe navigates to the confirmation page.
    try {
      this.errorMessage = await this.cardForm.confirm(`${window.location.origin}/order/${encodeURIComponent(this.orderId)}/confirmation`);
      if (this.errorMessage) this.notifications.error(this.errorMessage);
    } catch (error) {
      this.errorMessage = this.toMessage(error, 'Unable to complete card payment. Please try again.');
    } finally {
      this.checkingOut = false;
    }
  }

  /** 1–50; anything else falls back to 2 rather than blocking the order. */
  private get validGuestCount(): number {
    const count = Math.round(Number(this.guestCount));
    return count >= 1 && count <= 50 ? count : 2;
  }

  private placeCashOrder(): void {
    this.guestOrderId(true).pipe(finalize(() => this.checkingOut = false)).subscribe({
      next: (orderId) => {
        this.notifications.success('Your order was placed. Please pay staff in cash.');
        this.cart.clearLines();
        void this.router.navigate(['/order', orderId, 'confirmation'], { queryParams: { payment: 'cash' } });
      },
      error: (error: unknown) => this.errorMessage = this.toMessage(error, 'Unable to place your order.')
    });
  }

  /** At a Table the order needs a fresh browser location (ADR-0023); taken last, right before the order is created. */
  private tableLocation(): Observable<StorefrontCustomerLocation | null> {
    return this.tableCode ? from(this.location.current()) : of(null);
  }

  private guestOrderId(cash = false): Observable<string> {
    if (this.orderId) return of(this.orderId);
    return this.api.getActiveProducts(this.merchantId, this.branchId, this.catalogLanguage.language).pipe(
      switchMap((products) => {
        this.products = products;
        if (this.cart.reconcile(products, false)) {
          this.cartNeedsReview = true;
          return throwError(() => new Error('Your cart changed. Review updates before payment.'));
        }
        return this.tableLocation();
      }),
      switchMap((customerLocation) => this.api.createOrder({
        branchId: this.branchId,
        items: this.cart.lines.map((line) => ({ productId: line.product.productId, quantity: line.quantity })),
        ...(this.tableCode && customerLocation ? { tableCode: this.tableCode, customerLocation } : {}),
        ...(cash ? { checkoutPaymentMethod: 'CASH' as const } : {}),
        ...(this.askGuestCount && customerLocation ? { guestCount: this.validGuestCount } : {})
      })),
      map((order) => {
        if (this.tableCode) this.tables.markOccupied();
        return this.orderId = order.orderId;
      })
    );
  }

  private toMessage(error: unknown, fallback: string): string {
    return this.notifications.apiError(error, fallback);
  }
}
