import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { StorefrontLanguageService } from '../services/storefront-language.service';

@Component({
  selector: 'web-cart',
  standalone: true,
  imports: [StorefrontTranslatePipe, CommonModule, RouterLink],
  template: `
    <button #cartTrigger class="mobile-cart-summary" type="button" (click)="openCart()" [attr.aria-expanded]="expanded" aria-haspopup="dialog" aria-controls="mobile-cart-dialog">
      <span><bdi dir="ltr">{{ cart.itemCount }}</bdi> {{ cart.itemCount === 1 ? ('item' | storefrontTranslate) : ('items' | storefrontTranslate) }} &middot; <bdi dir="ltr">{{ cart.subtotal | currency: currency }}</bdi></span>
      <strong>{{ 'View cart' | storefrontTranslate }}</strong>
    </button>
    <article class="surface cart">
      <p class="surface-label">{{ 'Web Cart' | storefrontTranslate }}</p>
      <h2>{{ (cart.itemCount === 0 ? 'Your cart is empty' : cart.itemCount === 1 ? '{0} item' : '{0} items') | storefrontTranslate: [cart.itemCount] }}</h2>
      <ng-container *ngTemplateOutlet="cartContents; context: { mobile: false }" />
    </article>
    <dialog #cartDialog id="mobile-cart-dialog" class="mobile-cart-dialog" aria-labelledby="mobile-cart-title" (cancel)="$event.preventDefault(); closeCart()" (close)="finishClose()">
      <header class="mobile-cart-header">
        <h2 id="mobile-cart-title">{{ 'Your cart · {0} {1}' | storefrontTranslate: [cart.itemCount, (cart.itemCount === 1 ? 'item' : 'items') | storefrontTranslate] }}</h2>
        <button type="button" class="cart-close" [attr.aria-label]="'Close cart' | storefrontTranslate" autofocus (click)="closeCart()">&times;</button>
      </header>
      <ng-container *ngIf="expanded">
        <ng-container *ngTemplateOutlet="cartContents; context: { mobile: true }" />
      </ng-container>
    </dialog>
    <ng-template #cartContents let-mobile="mobile">
      <div class="cart-empty" *ngIf="cart.itemCount === 0">
        <h3 *ngIf="mobile">{{ 'Your cart is empty' | storefrontTranslate }}</h3>
        <p class="muted">{{ 'Add products to continue as a guest.' | storefrontTranslate }}</p>
        <button *ngIf="mobile" class="add-button continue-shopping" type="button" (click)="closeCart()">{{ 'Continue shopping' | storefrontTranslate }}</button>
      </div>
      <div class="cart-lines" *ngIf="cart.itemCount > 0">
        <div class="cart-line" *ngFor="let line of cart.lines" [attr.dir]="catalogLanguage.direction">
          <img class="cart-thumbnail" *ngIf="mobile && line.product.imageUrl" [src]="line.product.imageUrl" alt="" />
          <div class="cart-line-copy">
            <strong [attr.lang]="line.product.language" dir="auto">{{ line.product.name }}</strong>
            <p><bdi dir="ltr">{{ line.product.unitPrice | currency: currency }}</bdi> {{ 'each' | storefrontTranslate }}</p>
          </div>
          <div class="quantity">
            <button type="button" (click)="cart.decrease(line.product.productId)" [attr.aria-label]="'Remove one {0}' | storefrontTranslate: [line.product.name]">-</button>
            <span aria-live="polite" aria-atomic="true">{{ line.quantity }}</span>
            <button type="button" (click)="cart.add(line.product)" [attr.aria-label]="'Add one {0}' | storefrontTranslate: [line.product.name]">+</button>
          </div>
        </div>
      </div>
      <footer class="cart-footer" *ngIf="cart.itemCount > 0">
        <div class="cart-total">
          <span>{{ 'Subtotal' | storefrontTranslate }}</span>
          <strong><bdi dir="ltr">{{ cart.subtotal | currency: currency }}</bdi></strong>
        </div>
        <a
          class="checkout-link"
          data-testid="checkout"
          [routerLink]="['/m', merchantId, 'b', branchId, 'checkout']"
          (click)="mobile && closeCart()"
        >{{ 'Continue to checkout' | storefrontTranslate }}</a>
      </footer>
    </ng-template>
  `
})
export class WebCartComponent implements OnDestroy {
  @ViewChild('cartDialog', { static: true }) private cartDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('cartTrigger', { static: true }) private cartTrigger!: ElementRef<HTMLButtonElement>;
  private previousOverflow: string | null = null;
  expanded = false;
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) branchId = '';
  readonly cart = inject(StorefrontSessionService);
  readonly catalogLanguage = inject(StorefrontLanguageService);
  readonly currency = environment.currency;

  openCart(): void {
    if (this.expanded) return;
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.expanded = true;
    this.cartDialog.nativeElement.showModal();
  }

  closeCart(): void {
    this.cartDialog.nativeElement.close();
  }

  finishClose(): void {
    if (!this.expanded) return;
    this.expanded = false;
    this.restoreScrolling();
    this.cartTrigger.nativeElement.focus({ preventScroll: true });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.expanded && window.matchMedia('(min-width: 841px)').matches) this.closeCart();
  }

  ngOnDestroy(): void {
    this.expanded = false;
    this.cartDialog.nativeElement.close();
    this.restoreScrolling();
  }

  private restoreScrolling(): void {
    if (this.previousOverflow === null) return;
    document.body.style.overflow = this.previousOverflow;
    this.previousOverflow = null;
  }
}
