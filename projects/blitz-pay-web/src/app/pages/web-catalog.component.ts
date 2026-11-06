import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
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

@Component({
  selector: 'web-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, WebCartComponent],
  template: `
    <ng-container *ngIf="!loading; else catalogLoading">
    <section class="merchant-hero">
      <div class="merchant-logo" [class.has-logo]="merchant?.logoUrl">
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
    <p class="table-note" *ngIf="tableCheckIn?.tableCode" data-testid="table-note">
      <strong>Your table: {{ tableCheckIn?.tableName }}</strong><span>Your order is brought to your table.</span>
    </p>
    <p class="table-availability muted" *ngIf="!tableCheckIn && availability && availability.total > 0" data-testid="table-availability">
      {{ availability.free }} of {{ availability.total }} tables free<span *ngIf="availability.freeSeats != null"> &middot; {{ availability.freeSeats }} free seats</span>
    </p>
    <p class="table-note counter" *ngIf="tableCheckIn && !tableCheckIn.tableCode" data-testid="counter-note">
      This table is not taking orders right now. Order here and collect your order at the counter.
    </p>
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
          <div class="search-products language-picker" *ngIf="languages.length">
            <span>Language</span>
            <div class="language-control">
              <button
                #languageTrigger
                class="language-trigger"
                type="button"
                data-testid="catalog-language"
                aria-haspopup="listbox"
                aria-controls="catalog-language-options"
                [attr.aria-expanded]="languageMenuOpen"
                (click)="toggleLanguageMenu()"
                (keydown)="onLanguageTriggerKeydown($event)"
              >
                <span [attr.lang]="activeLanguage" dir="auto">{{ languageName(activeLanguage || 'en') }}</span>
                <svg class="language-chevron" [class.is-open]="languageMenuOpen" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="m5 7.5 5 5 5-5" />
                </svg>
              </button>
              <div
                *ngIf="languageMenuOpen"
                class="language-options"
                id="catalog-language-options"
                role="listbox"
                aria-label="Catalog language"
              >
                <button
                  #languageOption
                  *ngFor="let code of languages; let index = index"
                  type="button"
                  role="option"
                  class="language-option"
                  [attr.data-language]="code"
                  [attr.lang]="code"
                  [attr.aria-selected]="activeLanguage === code"
                  [attr.tabindex]="focusedLanguageIndex === index ? 0 : -1"
                  (click)="selectLanguage(code)"
                  (keydown)="onLanguageOptionKeydown($event, index)"
                >
                  <span dir="auto">{{ languageName(code) }}</span>
                  <svg *ngIf="activeLanguage === code" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m4 10 4 4 8-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <label class="search-products">
            <span>Search products</span>
            <input type="search" [(ngModel)]="query" (ngModelChange)="saveBrowseState()" placeholder="Search products" />
          </label>
        </div>
        <div [attr.aria-busy]="productsLoading">
        <section *ngIf="productsLoading" data-testid="catalog-skeleton" role="status" aria-live="polite">
          <span class="visually-hidden">Loading menu in {{ languageName(activeLanguage || 'en') }}...</span>
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
              <article class="product-card" *ngFor="let product of visibleProducts; trackBy: trackProduct" [class.is-selected]="productQuantity(product.productId) > 0" [attr.dir]="catalogLanguage.direction">
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
        </ng-container>
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
export class WebCatalogComponent implements AfterViewChecked, OnInit, OnDestroy {
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StorefrontApiService);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly cart = inject(StorefrontSessionService);
  readonly catalogLanguage = inject(StorefrontLanguageService);
  @ViewChild('languageTrigger') private languageTrigger?: ElementRef<HTMLButtonElement>;
  @ViewChildren('languageOption', { read: ElementRef }) private languageOptionElements!: QueryList<ElementRef<HTMLButtonElement>>;
  private catalogRequest?: Subscription;
  private pendingLanguageFocus: number | null = null;
  readonly skeletonCards = [0, 1, 2, 3];
  productsLoading = false;
  languageMenuOpen = false;
  focusedLanguageIndex = 0;
  readonly merchantId = this.route.snapshot.paramMap.get('merchantId') ?? '';
  readonly branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
  readonly currency = environment.currency;
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
    // Category names are translated too, so a category picked in another language no longer matches.
    this.chooseCategory('');
    this.query = '';
    this.saveBrowseState();
    this.errorMessage = '';
    this.productsLoading = true;
    this.catalogRequest = this.api.getActiveProducts(this.merchantId, this.branchId, language)
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

  ngAfterViewChecked(): void {
    if (this.pendingLanguageFocus === null) return;
    this.languageOptionElements.get(this.pendingLanguageFocus)?.nativeElement.focus();
    this.pendingLanguageFocus = null;
  }

  @HostListener('document:click', ['$event'])
  closeLanguageMenuOnOutsideClick(event: MouseEvent): void {
    if (this.languageMenuOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.closeLanguageMenu(false);
    }
  }

  toggleLanguageMenu(): void {
    if (this.languageMenuOpen) {
      this.closeLanguageMenu(false);
      return;
    }
    this.openLanguageMenu(this.languages.indexOf(this.activeLanguage ?? ''));
  }

  onLanguageTriggerKeydown(event: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    const selectedIndex = this.languages.indexOf(this.activeLanguage ?? '');
    const index = event.key === 'ArrowUp' ? this.languages.length - 1 : Math.max(selectedIndex, 0);
    this.openLanguageMenu(index);
  }

  onLanguageOptionKeydown(event: KeyboardEvent, index: number): void {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % this.languages.length;
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + this.languages.length) % this.languages.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = this.languages.length - 1;
    else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeLanguageMenu(true);
    } else if (event.key === 'Tab') {
      this.closeLanguageMenu(false);
    }

    if (nextIndex !== null) {
      event.preventDefault();
      this.focusedLanguageIndex = nextIndex;
      this.pendingLanguageFocus = nextIndex;
    }
  }

  selectLanguage(language: string): void {
    this.closeLanguageMenu(true);
    this.chooseLanguage(language);
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

  private openLanguageMenu(index: number): void {
    this.focusedLanguageIndex = index < 0 ? 0 : index;
    this.languageMenuOpen = true;
    this.pendingLanguageFocus = this.focusedLanguageIndex;
  }

  private closeLanguageMenu(restoreFocus: boolean): void {
    this.languageMenuOpen = false;
    this.pendingLanguageFocus = null;
    if (restoreFocus) this.languageTrigger?.nativeElement.focus();
  }
}
