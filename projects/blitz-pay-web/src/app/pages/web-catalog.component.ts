import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebCartComponent } from '../components/web-cart.component';
import { StorefrontBranch, StorefrontMerchant, StorefrontProduct } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { StorefrontLanguageService, catalogLanguages, nativeLanguageName } from '../services/storefront-language.service';

@Component({
  selector: 'web-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, WebCartComponent],
  template: `
    <ng-container *ngIf="!loading; else catalogLoading">
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
          <label class="search-products" *ngIf="languages.length">
            <span>Language</span>
            <select data-testid="catalog-language" [ngModel]="activeLanguage" (ngModelChange)="chooseLanguage($event)">
              <option *ngFor="let code of languages" [value]="code" [lang]="code">{{ languageName(code) }}</option>
            </select>
          </label>
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
            <p class="muted" *ngIf="products.length > 0 && visibleProducts.length === 0">No products match your search.</p>
            <div class="product-grid" *ngIf="products.length > 0">
              <article class="product-card" *ngFor="let product of visibleProducts; trackBy: trackProduct" [class.is-selected]="productQuantity(product.productId) > 0">
                <a class="product-detail-link" [routerLink]="['/m', merchantId, 'b', branchId, 'p', product.productId]">
                  <div class="product-image">
                    <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name" loading="lazy" decoding="async" />
                    <span *ngIf="!product.imageUrl">Product image</span>
                  </div>
                  <div class="product-copy" [attr.lang]="product.language">
                    <span class="surface-label" *ngIf="product.categoryName">{{ product.categoryName }}</span>
                    <h3 dir="auto">{{ product.name }}</h3>
                    <p class="muted" dir="auto">{{ product.description || 'View details' }}</p>
                    <strong><bdi dir="ltr">{{ product.unitPrice | currency: currency }}</bdi></strong>
                  </div>
                </a>
                <div class="product-cart-actions" *ngIf="productQuantity(product.productId) as quantity; else addToCart">
                  <span class="in-cart-label">In cart</span>
                  <div class="quantity product-quantity" role="group" [attr.aria-label]="'Quantity for ' + product.name">
                    <button type="button" [attr.data-testid]="'decrease-' + product.productId" [attr.aria-label]="quantity === 1 ? 'Remove ' + product.name + ' from cart' : 'Remove one ' + product.name" (click)="cart.decrease(product.productId)">&minus;</button>
                    <span class="quantity-count" aria-live="polite" aria-atomic="true" [attr.aria-label]="quantity + ' in cart'">{{ quantity }}</span>
                    <button type="button" [attr.data-testid]="'increase-' + product.productId" [attr.aria-label]="'Add one ' + product.name" (click)="addProduct(product)">+</button>
                  </div>
                </div>
                <ng-template #addToCart>
                  <button class="add-button" type="button" [attr.data-testid]="'add-' + product.productId" [attr.aria-label]="'Add ' + product.name + ' to cart'" (click)="addProduct(product)">Add</button>
                </ng-template>
              </article>
            </div>
      </article>
      <web-cart [merchantId]="merchantId" [branchId]="branchId" />
    </section>
    </ng-container>
    <ng-template #catalogLoading>
      <section class="surface catalog-loading" role="status" aria-live="polite" aria-busy="true">
        <p class="eyebrow">Your menu</p><h1>Getting things ready</h1><p>Loading the live menu for this location...</p>
      </section>
    </ng-template>
  `
})
export class WebCatalogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  readonly cart = inject(StorefrontSessionService);
  private readonly catalogLanguage = inject(StorefrontLanguageService);
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
      products: this.api.getActiveProducts(this.merchantId, this.branchId, this.catalogLanguage.language)
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: ({ merchant, branch, products }) => {
        this.merchant = merchant;
        this.branch = branch;
        this.products = products;
      },
      error: (error: unknown) => this.errorMessage = this.toMessage(error, 'Unable to load this branch catalog.')
    });
  }

  get languages(): string[] {
    return catalogLanguages(this.merchant);
  }

  /** The chosen language when this merchant offers it; otherwise what the catalog was served in. */
  get activeLanguage(): string | null {
    const chosen = this.catalogLanguage.language;
    if (chosen && this.languages.includes(chosen)) return chosen;
    return this.products[0]?.language ?? this.merchant?.originalMenuLanguage ?? null;
  }

  languageName(code: string): string {
    return nativeLanguageName(code);
  }

  chooseLanguage(language: string): void {
    this.catalogLanguage.choose(language);
    // Category names are translated too, so a category picked in another language no longer matches.
    this.chooseCategory('');
    this.loading = true;
    this.api.getActiveProducts(this.merchantId, this.branchId, language)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (products) => this.products = products,
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

  productQuantity(productId: string): number {
    const scope = this.cart.scope;
    if (scope?.merchantId !== this.merchantId || scope.branchId !== this.branchId) return 0;
    return this.cart.lines.find((line) => line.product.productId === productId)?.quantity ?? 0;
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
