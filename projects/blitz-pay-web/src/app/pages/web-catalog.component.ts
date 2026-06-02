import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { finalize, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebCartComponent } from '../components/web-cart.component';
import { StorefrontBranch, StorefrontMerchant, StorefrontProduct } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';

@Component({
  selector: 'web-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DataViewModule, WebCartComponent],
  template: `
    <section class="merchant-hero">
      <div class="merchant-logo">
        <img *ngIf="merchant?.logoUrl" [src]="merchant?.logoUrl" [alt]="merchant?.merchantName + ' logo'" />
        <span *ngIf="!merchant?.logoUrl">{{ merchantInitial }}</span>
      </div>
      <div>
        <p class="eyebrow">Shop online</p>
        <h1>{{ merchant?.merchantName || 'Merchant catalog' }}</h1>
        <p class="fulfillment-label" *ngIf="branch">Fulfilled by {{ branch.name }}<span *ngIf="branchAddress"> &middot; {{ branchAddress }}</span></p>
      </div>
    </section>

    <p class="storefront-alert" *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
    <section class="unavailable surface" *ngIf="!loading && branch && branch.active === false">
      <p class="eyebrow">Unavailable Branch Notice</p>
      <h2>This location is not accepting online orders.</h2>
      <p class="muted">Please check again later.</p>
    </section>

    <section class="shop-layout" *ngIf="branch?.active !== false">
      <article class="surface products">
        <div class="catalog-toolbar">
          <div>
            <h2>Products</h2>
            <p class="muted">{{ products.length }} available</p>
          </div>
          <label class="search-products">
            <span>Search products</span>
            <input type="search" [(ngModel)]="query" (ngModelChange)="saveBrowseState()" placeholder="Search products" />
          </label>
        </div>
        <nav class="category-chips" *ngIf="categories.length > 0" aria-label="Product categories">
          <button type="button" [class.active]="category === ''" (click)="chooseCategory('')">All</button>
          <button type="button" *ngFor="let option of categories" [class.active]="category === option" (click)="chooseCategory(option)">{{ option }}</button>
        </nav>
        <p class="muted" *ngIf="loading">Loading products...</p>
        <section class="unavailable catalog-notice" *ngIf="!loading && products.length === 0">
          <p class="eyebrow">Unavailable Catalog Notice</p>
          <h2>No products are available at this location right now.</h2>
        </section>
        <p-dataview *ngIf="!loading && products.length > 0" [value]="visibleProducts" layout="grid" emptyMessage="No products match your search.">
          <ng-template #grid let-items>
            <div class="product-grid">
              <article class="product-card" *ngFor="let product of items; trackBy: trackProduct">
                <a class="product-detail-link" [routerLink]="['/m', merchantId, 'b', branchId, 'p', product.productId]">
                  <div class="product-image">
                    <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name" />
                    <span *ngIf="!product.imageUrl">Product image</span>
                  </div>
                  <div class="product-copy">
                    <span class="surface-label" *ngIf="product.categoryName">{{ product.categoryName }}</span>
                    <h3>{{ product.name }}</h3>
                    <p class="muted">{{ product.description || 'View details' }}</p>
                    <strong>{{ product.unitPrice | currency: currency }}</strong>
                  </div>
                </a>
                <button class="add-button" type="button" [attr.data-testid]="'add-' + product.productId" (click)="addProduct(product)">Add</button>
              </article>
            </div>
          </ng-template>
        </p-dataview>
      </article>
      <web-cart [merchantId]="merchantId" [branchId]="branchId" />
    </section>
  `
})
export class WebCatalogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  readonly cart = inject(StorefrontSessionService);
  readonly merchantId = this.route.snapshot.paramMap.get('merchantId') ?? '';
  readonly branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
  readonly currency = environment.currency;

  merchant: StorefrontMerchant | null = null;
  branch: StorefrontBranch | null = null;
  products: StorefrontProduct[] = [];
  query = '';
  category = '';
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    if (!this.cart.useScope(this.merchantId, this.branchId)) {
      this.errorMessage = 'Your cart contains items from another location.';
    } else {
      this.query = this.cart.query;
      this.category = this.cart.category;
    }
    forkJoin({
      merchant: this.api.getMerchant(this.merchantId),
      branch: this.api.getBranch(this.merchantId, this.branchId),
      products: this.api.getActiveProducts(this.merchantId, this.branchId)
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: ({ merchant, branch, products }) => {
        this.merchant = merchant;
        this.branch = branch;
        this.products = products;
      },
      error: (error: unknown) => this.errorMessage = this.toMessage(error, 'Unable to load this branch catalog.')
    });
  }

  get merchantInitial(): string {
    return (this.merchant?.merchantName || 'M').charAt(0).toUpperCase();
  }

  get branchAddress(): string {
    return this.branch ? [this.branch.addressLine1, this.branch.addressLine2, this.branch.postalCode, this.branch.city, this.branch.country].filter(Boolean).join(', ') : '';
  }

  get categories(): string[] {
    return [...new Set(this.products.map((product) => product.categoryName).filter((value): value is string => !!value))];
  }

  get visibleProducts(): StorefrontProduct[] {
    const term = this.query.trim().toLowerCase();
    return this.products.filter((product) =>
      (!this.category || product.categoryName === this.category) &&
      (!term || product.name.toLowerCase().includes(term))
    );
  }

  chooseCategory(category: string): void {
    this.category = category;
    this.saveBrowseState();
  }

  saveBrowseState(): void {
    this.cart.setBrowseState(this.query, this.category);
  }

  addProduct(product: StorefrontProduct): void {
    if (this.cart.useScope(this.merchantId, this.branchId)) this.cart.add(product);
  }

  trackProduct(_index: number, product: StorefrontProduct): string {
    return product.productId;
  }

  private toMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.error?.detail ?? error.error?.detail ?? error.error?.message;
      if (typeof detail === 'string' && detail.trim()) return detail;
    }
    return fallback;
  }
}
