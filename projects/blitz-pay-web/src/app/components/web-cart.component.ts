import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { StorefrontSessionService } from '../services/storefront-session.service';

@Component({
  selector: 'web-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="surface cart">
      <p class="surface-label">Web Cart</p>
      <h2>{{ cart.itemCount === 0 ? 'Your cart is empty' : cart.itemCount + (cart.itemCount === 1 ? ' item' : ' items') }}</h2>
      <p class="muted" *ngIf="cart.itemCount === 0">Add products to continue as a guest.</p>
      <div class="cart-lines" *ngIf="cart.itemCount > 0">
        <div class="cart-line" *ngFor="let line of cart.lines">
          <div>
            <strong>{{ line.product.name }}</strong>
            <p>{{ line.product.unitPrice | currency: currency }} each</p>
          </div>
          <div class="quantity">
            <button type="button" (click)="cart.decrease(line.product.productId)" [attr.aria-label]="'Remove one ' + line.product.name">-</button>
            <span>{{ line.quantity }}</span>
            <button type="button" (click)="cart.add(line.product)" [attr.aria-label]="'Add one ' + line.product.name">+</button>
          </div>
        </div>
        <div class="cart-total">
          <span>Subtotal</span>
          <strong>{{ cart.subtotal | currency: currency }}</strong>
        </div>
        <a
          class="checkout-link"
          data-testid="checkout"
          [routerLink]="['/m', merchantId, 'b', branchId, 'checkout']"
        >Checkout securely</a>
      </div>
    </article>
  `
})
export class WebCartComponent {
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) branchId = '';
  readonly cart = inject(StorefrontSessionService);
  readonly currency = environment.currency;
}
