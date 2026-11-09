import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, finalize, forkJoin, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebCartComponent } from '../components/web-cart.component';
import { StorefrontBranch, StorefrontMerchant, StorefrontProduct, StorefrontTableAvailability } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { StorefrontLanguageService, catalogLanguages, nativeLanguageName } from '../services/storefront-language.service';
import { StorefrontTableService } from '../table/storefront-table.service';
import { NotificationService } from '../notifications/notification.service';
import { StorefrontBrandService } from '../services/storefront-brand.service';
import { MerchantLogoComponent } from '../components/merchant-logo.component';

@Component({
  selector: 'web-catalog',
  standalone: true,
  imports: [StorefrontTranslatePipe, CommonModule, FormsModule, RouterLink, WebCartComponent, MerchantLogoComponent],
  template: `
    <ng-container *ngIf="!loading; else catalogLoading">
    <section class="merchant-hero">
      <web-merchant-logo [merchant]="merchant" />
      <div>
        <p class="eyebrow">{{ (brand.theme() ? 'Fresh from our kitchen' : 'Shop online') | storefrontTranslate }}</p>
        <h1>{{ merchant?.merchantName || ('Merchant catalog' | storefrontTranslate) }}</h1>
        <p class="fulfillment-label" *ngIf="branch">{{ 'Fulfilled by {0}' | storefrontTranslate: [branch.name] }}<span *ngIf="branchAddress"> &middot; {{ branchAddress }}</span></p>
      </div>
    </section>

    <p class="storefront-alert" *ngIf="errorMessage" role="alert">{{ (errorMessage | storefrontTranslate) }}</p>
    <p class="table-note" *ngIf="tableCheckIn?.tableCode" data-testid="table-note">
      <strong>{{ 'Your table: {0}' | storefrontTranslate: [tableCheckIn?.tableName] }}</strong><span>{{ 'Your order is brought to your table.' | storefrontTranslate }}</span>
    </p>
    <p class="table-availability muted" *ngIf="!tableCheckIn && availability && availability.total > 0" data-testid="table-availability">
      {{ '{0} of {1} tables free' | storefrontTranslate: [availability.free, availability.total] }}<span *ngIf="availability.freeSeats != null"> {{ '· {0} free seats' | storefrontTranslate: [availability.freeSeats] }}</span>
    </p>
    <p class="table-note counter" *ngIf="tableCheckIn && !tableCheckIn.tableCode" data-testid="counter-note">
      {{ 'This table is not taking orders right now. Order here and collect your order at the counter.' | storefrontTranslate }}</p>
    <section class="unavailable surface" *ngIf="!loading && branch && branch.active === false">
      <p class="eyebrow">{{ 'Unavailable Branch Notice' | storefrontTranslate }}</p>
      <h2>{{ 'This location is not accepting online orders.' | storefrontTranslate }}</h2>
      <p class="muted">{{ 'Please check again later.' | storefrontTranslate }}</p>
    </section>

    <section class="shop-layout" *ngIf="branch?.active !== false">
      <article class="surface products">
        <div class="catalog-toolbar">
          <div class="catalog-heading">
            <h2>{{ (brand.theme() ? 'The menu' : 'Products') | storefrontTranslate }}</h2>
            <p class="muted">{{ (brand.theme() ? '{0} things to look forward to' : '{0} available') | storefrontTranslate: [products.length] }}</p>
          </div>
          <label class="search-products">
            <span>{{ 'Search products' | storefrontTranslate }}</span>
            <input type="search" [(ngModel)]="query" (ngModelChange)="saveBrowseState()" [attr.placeholder]="'Search products' | storefrontTranslate" />
          </label>
        </div>
        <div [attr.aria-busy]="productsLoading">
        <section *ngIf="productsLoading" data-testid="catalog-skeleton" role="status" aria-live="polite">
          <span class="visually-hidden">{{ 'Loading menu in {0}...' | storefrontTranslate: [languageName(activeLanguage || 'en')] }}</span>
          <div class="product-grid" aria-hidden="true">
            <article class="product-card skeleton-card" *ngFor="let placeholder of skeletonCards">
              <div class="skeleton skeleton-image"></div>
              <div class="skeleton skeleton-category"></div>
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-line"></div>
              <div class="skeleton skeleton-price"></div>
              <div class="skeleton skeleton-button"></div>
            </article>
          </div>
        </section>
        <ng-container *ngIf="!productsLoading">
        <nav class="category-chips" *ngIf="categories.length > 0" [attr.aria-label]="'Product categories' | storefrontTranslate">
          <button type="button" [class.active]="category === ''" [attr.aria-pressed]="category === ''" (click)="chooseCategory('')">{{ 'All products' | storefrontTranslate }}<span class="category-count">{{ products.length }}</span></button>
          <button type="button" *ngFor="let option of categoryOptions" [class.active]="category === option.key" [attr.aria-pressed]="category === option.key" (click)="chooseCategory(option.key)"><span dir="auto">{{ option.name }}</span><span class="category-count">{{ option.count }}</span></button>
        </nav>
        <p class="muted" *ngIf="loading">{{ 'Loading products...' | storefrontTranslate }}</p>
        <section class="unavailable catalog-notice" *ngIf="!loading && products.length === 0">
          <p class="eyebrow">{{ 'Unavailable Catalog Notice' | storefrontTranslate }}</p>
          <h2>{{ 'No products are available at this location right now.' | storefrontTranslate }}</h2>
        </section>
            <p class="muted" *ngIf="products.length > 0 && visibleProducts.length === 0">{{ 'No products match your search.' | storefrontTranslate }}</p>
            <div class="product-grid" *ngIf="products.length > 0">
              <article class="product-card" *ngFor="let product of visibleProducts; trackBy: trackProduct" [class.is-selected]="productQuantity(product.productId) > 0" [attr.dir]="catalogLanguage.direction">
                <a class="product-detail-link" [routerLink]="['/m', merchantId, 'b', branchId, 'p', product.productId]">
                  <div class="product-image">
                    <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name" loading="lazy" decoding="async" />
                    <span *ngIf="!product.imageUrl">{{ 'Product image' | storefrontTranslate }}</span>
                  </div>
                  <div class="product-copy" [attr.lang]="product.language">
                    <span class="surface-label" *ngIf="product.categoryName">{{ product.categoryName }}</span>
                    <h3 dir="auto">{{ product.name }}</h3>
                    <p class="muted" dir="auto">{{ product.description || ('View details' | storefrontTranslate) }}</p>
                    <strong><bdi dir="ltr">{{ product.unitPrice | currency: currency }}</bdi></strong>
                  </div>
                </a>
                <div class="product-cart-actions" *ngIf="productQuantity(product.productId) as quantity; else addToCart">
                  <span class="in-cart-label">{{ 'In cart' | storefrontTranslate }}</span>
                  <div class="quantity product-quantity" role="group" [attr.aria-label]="'Quantity for {0}' | storefrontTranslate: [product.name]">
                    <button type="button" [attr.data-testid]="'decrease-' + product.productId" [attr.aria-label]="(quantity === 1 ? 'Remove {0} from cart' : 'Remove one {0}') | storefrontTranslate: [product.name]" (click)="cart.decrease(product.productId)">&minus;</button>
                    <span class="quantity-count" aria-live="polite" aria-atomic="true" [attr.aria-label]="'{0} in cart' | storefrontTranslate: [quantity]">{{ quantity }}</span>
                    <button type="button" [attr.data-testid]="'increase-' + product.productId" [attr.aria-label]="'Add one {0}' | storefrontTranslate: [product.name]" (click)="addProduct(product)">+</button>
                  </div>
                </div>
                <ng-template #addToCart>
                  <button class="add-button" type="button" [attr.data-testid]="'add-' + product.productId" [attr.aria-label]="'Add {0} to cart' | storefrontTranslate: [product.name]" (click)="addProduct(product)">{{ 'Add' | storefrontTranslate }}</button>
                </ng-template>
              </article>
            </div>
        </ng-container>
        </div>
      </article>
      <web-cart [merchantId]="merchantId" [branchId]="branchId" />
    </section>
    </ng-container>
    <ng-template #catalogLoading>
      <section class="surface catalog-loading" role="status" aria-live="polite" aria-busy="true">
        <p class="eyebrow">{{ 'Your menu' | storefrontTranslate }}</p><h1>{{ 'Getting things ready' | storefrontTranslate }}</h1><p>{{ 'Loading the live menu for this location...' | storefrontTranslate }}</p>
      </section>
    </ng-template>
  `
})
export class WebCatalogComponent implements OnInit, OnDestroy {
  readonly brand = inject(StorefrontBrandService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  readonly cart = inject(StorefrontSessionService);
  readonly catalogLanguage = inject(StorefrontLanguageService);
  private catalogRequest?: Subscription;
  readonly skeletonCards = [0, 1, 2, 3];
  productsLoading = false;
  readonly merchantId = this.route.snapshot.paramMap.get('merchantId') ?? '';
  readonly branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
  readonly currency = environment.currency;
  private lastLanguageChange = this.catalogLanguage.changes();
  private readonly followHeaderLanguage = effect(() => {
    const revision = this.catalogLanguage.changes();
    if (revision === this.lastLanguageChange || !this.merchant) return;
    this.lastLanguageChange = revision;
    if (catalogLanguages(this.merchant).length > 1) this.reloadProducts();
  });

  readonly tableCheckIn = inject(StorefrontTableService).forBranch(this.merchantId, this.branchId);

  merchant: StorefrontMerchant | null = null;
  branch: StorefrontBranch | null = null;
  products: StorefrontProduct[] = [];
  query = '';
  category = '';
  loading = true;
  errorMessage = '';
  /** Free Tables and seats, for guests deciding whether to come in or sit down; hidden when the Branch has no Tables. */
  availability: StorefrontTableAvailability | null = null;
  private availabilityRequest?: Subscription;

  ngOnInit(): void {
    this.brand.useMerchant(this.merchantId);
    if (!this.tableCheckIn) {
      this.availabilityRequest = this.api.getTableAvailability(this.branchId).subscribe({
        next: (availability) => this.availability = availability,
        error: () => this.availability = null
      });
    }
    if (!this.cart.useScope(this.merchantId, this.branchId)) {
      this.errorMessage = 'Your cart contains items from another location.';
      this.notifications.warning(this.errorMessage);
    } else {
      this.query = this.cart.query;
      this.category = this.cart.category;
    }
    this.catalogRequest = forkJoin({
      merchant: this.api.getMerchant(this.merchantId),
      branch: this.api.getBranch(this.merchantId, this.branchId)
    }).pipe(
      switchMap(({ merchant, branch }) => {
        this.merchant = merchant;
        this.branch = branch;
        return this.api.getActiveProducts(this.merchantId, this.branchId, this.catalogLanguage.resolve(merchant))
          .pipe(map(products => ({ merchant, branch, products })));
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ merchant, branch, products }) => {
        this.merchant = merchant;
        this.branch = branch;
        this.products = products;
        this.cart.updateCatalogText(products, this.merchantId, this.branchId);
      },
      error: (error: unknown) => this.errorMessage = this.toMessage(error, 'Unable to load this branch catalog.')
    });
  }

  get languages(): string[] {
    return catalogLanguages(this.merchant);
  }

  /** The requested language stays selected even when individual products fall back. */
  get activeLanguage(): string | null {
    return this.catalogLanguage.language ?? this.merchant?.originalMenuLanguage ?? this.merchant?.originalLanguage ?? null;
  }

  languageName(code: string): string {
    return nativeLanguageName(code);
  }

  chooseLanguage(language: string): void {
    this.catalogRequest?.unsubscribe();
    this.catalogLanguage.choose(language);
    this.reloadProducts();
  }

  private reloadProducts(): void {
    if (!this.merchant) return;
    this.lastLanguageChange = this.catalogLanguage.changes();
    this.catalogRequest?.unsubscribe();
    // Retain stable category IDs across translated names; legacy name-only categories reset.
    if (!this.products.some(product => product.categoryId === this.category)) this.chooseCategory('');
    this.query = '';
    this.saveBrowseState();
    this.errorMessage = '';
    this.productsLoading = true;
    this.catalogRequest = this.api.getActiveProducts(this.merchantId, this.branchId, this.catalogLanguage.resolve(this.merchant))
      .pipe(finalize(() => this.productsLoading = false))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.cart.updateCatalogText(products, this.merchantId, this.branchId);
        },
        error: (error: unknown) => this.errorMessage = this.toMessage(error, 'Unable to load this branch catalog.')
      });
  }

  ngOnDestroy(): void {
    this.catalogRequest?.unsubscribe();
    this.availabilityRequest?.unsubscribe();
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

  get categoryOptions(): { key: string; name: string; count: number }[] {
    const groups = new Map<string, { key: string; name: string; count: number }>();
    for (const product of this.products) {
      if (!product.categoryName) continue;
      const key = product.categoryId ?? product.categoryName;
      const group = groups.get(key) ?? { key, name: product.categoryName, count: 0 };
      group.count++;
      groups.set(key, group);
    }
    return [...groups.values()];
  }

  get visibleProducts(): StorefrontProduct[] {
    const term = this.query.trim().toLowerCase();
    return this.products.filter((product) =>
      (!this.category || product.categoryId === this.category || product.categoryName === this.category) &&
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
    if (this.cart.useScope(this.merchantId, this.branchId)) {
      this.cart.add(product);
      this.notifications.success('Added to your cart.');
    }
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
    return this.notifications.apiError(error, fallback);
  }

}
