import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BranchCatalogQrComponent } from '../merchant-catalog/branch-catalog-qr.component';
import { Branch, EnvironmentKey, MenuLanguage, Merchant, Product } from '../models/merchant-catalog.models';
import { displayProductLanguage, isRightToLeft, languageLabel, merchantMenuLanguages } from '../menu-language/menu-language';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { CategoryShowcase, FullCatalogSection, buildCategoryShowcase, buildFullCatalog } from './printed-catalog';
import { PrintedCatalogLabels, printedCatalogLabels } from './printed-catalog-labels';

export type PrintedCatalogLayout = 'full' | 'showcase';

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

@Component({
  selector: 'app-printed-catalog',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule, RouterModule, BranchCatalogQrComponent],
  templateUrl: './printed-catalog.component.html',
  styleUrl: './printed-catalog.component.css'
})
export class PrintedCatalogComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly merchantApi = inject(MerchantApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly locale = inject(AdminLocaleService);
  private previousUiLanguage = this.locale.code();
  private loadRequest?: Subscription;
  private readonly followProductLanguage = effect(() => {
    const code = this.locale.code();
    if (code === this.previousUiLanguage) return;
    this.previousUiLanguage = code;
    if (!this.merchant || this.catalogLanguages.length === 1) return;
    const language = displayProductLanguage(this.merchant, code) ?? null;
    this.requestedLanguage = language;
    this.load();
    this.setCatalogLanguage(language ?? '');
  });

  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  merchantId = '';
  branchId = '';
  layout: PrintedCatalogLayout = 'full';
  /** Explicit URL selection, or the supported UI language when absent. */
  requestedLanguage: string | null = null;
  menuLanguages: MenuLanguage[] = [];
  fallbackCount = 0;

  merchant: Merchant | null = null;
  branch: Branch | null = null;
  sections: FullCatalogSection[] = [];
  showcase: CategoryShowcase = { entries: [], hasMoreCategories: false };

  loading = false;
  loadFailed = false;

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  get webCatalogUrl(): string {
    return `${this.selectedEnvironment.storefrontUrl}/m/${encodeURIComponent(this.merchantId)}/b/${encodeURIComponent(this.branchId)}`;
  }

  get isEmpty(): boolean { return this.sections.length === 0; }

  get catalogLanguages(): string[] { return merchantMenuLanguages(this.merchant); }

  /** The Catalog Language this Printed Catalog is rendered in, or null when the merchant has none set. */
  get catalogLanguage(): string | null {
    const languages = this.catalogLanguages;
    return this.requestedLanguage && languages.includes(this.requestedLanguage) ? this.requestedLanguage : (languages[0] ?? null);
  }

  get labels(): PrintedCatalogLabels { return printedCatalogLabels(this.catalogLanguage); }

  get textDirection(): 'rtl' | 'ltr' { return isRightToLeft(this.catalogLanguage) ? 'rtl' : 'ltr'; }

  languageLabel(code: string): string { return languageLabel(code, this.menuLanguages); }

  /** True when the product is shown in the Original Menu Language because it has no translation. */
  isFallback(product: Product): boolean {
    return !!this.catalogLanguage && !!product.language && product.language !== this.catalogLanguage;
  }

  get branchStreet(): string {
    return [this.branch?.addressLine1, this.branch?.addressLine2].filter(Boolean).join(', ');
  }

  get branchCity(): string {
    return [this.branch?.postalCode, this.branch?.city].filter(Boolean).join(' ');
  }

  get website(): string {
    const url = this.branch?.website || this.merchant?.website || this.merchant?.contactInfo?.website || '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  get phone(): string {
    return this.branch?.contactPhoneNumber || this.merchant?.contactInfo?.phoneNumber || '';
  }

  get instagram(): string {
    const handle = this.merchant?.contactInfo?.instagramHandle?.replace(/^@/, '');
    return handle ? `@${handle}` : '';
  }

  ngOnInit(): void {
    this.merchantId = this.route.snapshot.paramMap.get('id') ?? '';
    this.branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.layout = params.get('layout') === 'showcase' ? 'showcase' : 'full';
        const language = params.get('language');
        if (language !== this.requestedLanguage) {
          const reload = this.merchant !== null;
          this.requestedLanguage = language;
          if (reload) this.load();
        }
      });
    if (!this.merchantId || !this.branchId) { this.loadFailed = true; this.notifications.warning('Missing route parameters.'); return; }
    this.load();
  }

  load(): void {
    this.loadRequest?.unsubscribe();
    this.loading = true;
    this.loadFailed = false;
    const env = this.selectedEnvironment;
    // The merchant comes first: its languages decide which Catalog Language the products are read in.
    this.loadRequest = this.merchantApi.getMerchant(env, this.apiVersion, this.merchantId).pipe(
      switchMap((merchant) => {
        this.merchant = merchant;
        this.requestedLanguage ??= displayProductLanguage(merchant, this.locale.code()) ?? null;
        const language = this.catalogLanguage ?? undefined;
        return forkJoin({
          branch: this.merchantApi.getBranch(env, this.apiVersion, this.merchantId, this.branchId),
          products: this.merchantApi.getProducts(env, this.apiVersion, this.merchantId, this.branchId, false, language),
          menuLanguages: !this.menuLanguages.length
            ? this.merchantApi.getMenuLanguages(env, this.apiVersion).pipe(catchError(() => of([] as MenuLanguage[])))
            : of(this.menuLanguages)
        });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({ branch, products, menuLanguages }) => {
        this.branch = branch;
        this.menuLanguages = menuLanguages;
        this.applyProducts(products);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.loadFailed = true; this.notifications.apiError(error, 'Failed to load the Printed Catalog.');
      }
    });
  }

  setCatalogLanguage(language: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { language }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  setLayout(layout: PrintedCatalogLayout): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { layout }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  price(product: Product): string {
    return euro.format(product.unitPrice);
  }

  async print(): Promise<void> {
    const images = Array.from((this.host.nativeElement as HTMLElement).querySelectorAll('img'));
    await Promise.all(images.map((img) => img.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        })));
    window.print();
  }

  private applyProducts(products: Product[]): void {
    this.sections = buildFullCatalog(products, this.labels.uncategorised);
    this.showcase = buildCategoryShowcase(products);
    this.fallbackCount = products.filter((p) => p.active && this.isFallback(p)).length;
  }

}
