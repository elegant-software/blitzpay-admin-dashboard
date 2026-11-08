import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebCartComponent } from '../components/web-cart.component';
import { StorefrontBranch, StorefrontMerchant, StorefrontProduct } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { StorefrontLanguageService } from '../services/storefront-language.service';
import { NotificationService } from '../notifications/notification.service';
import { StorefrontBrandService } from '../services/storefront-brand.service';
import { MerchantLogoComponent } from '../components/merchant-logo.component';

@Component({
  selector: 'product-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, WebCartComponent, MerchantLogoComponent],
  template: `
    <section class="merchant-hero compact">
      <web-merchant-logo [merchant]="merchant" />
      <div>
        <p class="eyebrow">Shop online</p>
        <h1>{{ merchant?.merchantName || 'Product' }}</h1>
        <p class="fulfillment-label" *ngIf="branch">Fulfilled by {{ branch.name }}</p>
      </div>
    </section>
    <p class="storefront-alert" *ngIf="errorMessage">{{ errorMessage }}</p>
    <section class="shop-layout product-layout" *ngIf="!loading">
      <article class="surface product-overview" *ngIf="product?.active && branch?.active !== false; else unavailable">
        <a class="back-link" [routerLink]="['/m', merchantId, 'b', branchId]">Back to products</a>
        <div class="overview-grid" [attr.dir]="catalogLanguage.direction">
          <div class="overview-image product-image">
            <img *ngIf="product?.imageUrl" [src]="product?.imageUrl" [alt]="product?.name" />
            <span *ngIf="!product?.imageUrl">Product image</span>
          </div>
          <div class="overview-copy">
            <p class="surface-label" *ngIf="product?.categoryName" [attr.lang]="product?.language">{{ product?.categoryName }}</p>
            <h2 [attr.lang]="product?.language" dir="auto">{{ product?.name }}</h2>
            <strong class="overview-price"><bdi dir="ltr">{{ product?.unitPrice | currency: currency }}</bdi></strong>
            <p class="muted" [attr.lang]="product?.language" dir="auto">{{ product?.description || 'Available for guest checkout.' }}</p>
            <div class="overview-actions">
              <div class="quantity">
                <button type="button" (click)="quantity = quantity > 1 ? quantity - 1 : 1">-</button>
                <span>{{ quantity }}</span>
                <button type="button" data-testid="increase-quantity" (click)="quantity = quantity + 1">+</button>
              </div>
              <button class="add-button" type="button" data-testid="add-product" (click)="addProduct()">Add to cart</button>
            </div>
          </div>
        </div>
      </article>
      <ng-template #unavailable>
        <article class="surface unavailable">
          <p class="eyebrow">Product Unavailable</p>
          <h2>This product is not currently available.</h2>
          <a class="back-link" [routerLink]="['/m', merchantId, 'b', branchId]">Return to catalog</a>
        </article>
      </ng-template>
      <web-cart [merchantId]="merchantId" [branchId]="branchId" />
    </section>
  `
})
export class ProductOverviewComponent implements OnInit {
  private readonly brand = inject(StorefrontBrandService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  private readonly cart = inject(StorefrontSessionService);
  readonly catalogLanguage = inject(StorefrontLanguageService);
  readonly merchantId = this.route.snapshot.paramMap.get('merchantId') ?? '';
  readonly branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
  readonly productId = this.route.snapshot.paramMap.get('productId') ?? '';
  readonly currency = environment.currency;
  merchant: StorefrontMerchant | null = null;
  branch: StorefrontBranch | null = null;
  product: StorefrontProduct | null = null;
  quantity = 1;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.brand.useMerchant(this.merchantId);
    this.cart.useScope(this.merchantId, this.branchId);
    forkJoin({
      merchant: this.api.getMerchant(this.merchantId),
      branch: this.api.getBranch(this.merchantId, this.branchId)
    }).pipe(
      switchMap(({ merchant, branch }) => this.api.getProduct(this.merchantId, this.branchId, this.productId, this.catalogLanguage.resolve(merchant))
        .pipe(map(product => ({ merchant, branch, product })))),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (result) => {
        this.merchant = result.merchant;
        this.branch = result.branch;
        this.product = result.product;
      },
      error: (error: unknown) => this.errorMessage = this.notifications.apiError(error, 'Unable to load this product.')
    });
  }

  addProduct(): void {
    if (this.product?.active && this.branch?.active !== false && this.cart.useScope(this.merchantId, this.branchId)) {
      this.cart.add(this.product, this.quantity);
      this.notifications.success('Added to your cart.');
    }
  }
}
