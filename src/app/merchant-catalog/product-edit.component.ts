import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  CatalogTranslation,
  EnvironmentKey,
  MenuLanguage,
  Merchant,
  PreparationConfiguration,
  Product,
  ProductCategory,
} from '../models/merchant-catalog.models';
import { TranslationRow, isRightToLeft, languageLabel, toTranslationRow } from '../menu-language/menu-language';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-edit.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class ProductEditComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  merchantId = '';
  productId = '';
  product: Product | null = null;
  categories: ProductCategory[] = [];
  merchant: Merchant | null = null;
  menuLanguages: MenuLanguage[] = [];
  translations: TranslationRow[] = [];
  /** The product's Branch routing; null when the product has no Branch or the load failed. */
  preparation: PreparationConfiguration | null = null;
  /** Station override for this product; '' means "use the category default". */
  stationOverride = '';

  loading = false;
  saving = false;
  errorMessage = '';

  form = {
    name: '',
    description: '',
    unitPrice: '',
    categoryId: '',
    active: true,
    productCode: '',
  };

  imageFile: File | null = null;
  imagePreviewUrl = '';
  imageFailed = false;

  constructor(
    private readonly merchantApi: MerchantApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.merchantId = this.route.snapshot.paramMap.get('id') ?? '';
    this.productId = this.route.snapshot.paramMap.get('productId') ?? '';
    if (!this.merchantId || !this.productId) { this.errorMessage = 'Missing route parameters.'; return; }
    this.load();
  }

  private load(): void {
    this.loading = true;
    const env = this.selectedEnvironment;
    // Reads are pinned to the Original Menu Language: the browser's Accept-Language must never
    // turn a translation into the text this form saves back as the original.
    this.merchantApi.getMerchant(env, this.apiVersion, this.merchantId).pipe(
      switchMap((merchant) => {
        const original = merchant.originalMenuLanguage ?? undefined;
        const supported = merchant.supportedMenuLanguages ?? [];
        return forkJoin({
          merchant: of(merchant),
          product: this.merchantApi.getProduct(env, this.apiVersion, this.merchantId, this.productId, undefined, original).pipe(
            switchMap((product) => forkJoin({ product: of(product), preparation: this.loadPreparation(product) }))),
          categories: this.merchantApi.getProductCategories(env, this.apiVersion, this.merchantId, original).pipe(catchError(() => of([] as ProductCategory[]))),
          menuLanguages: supported.length
            ? this.merchantApi.getMenuLanguages(env, this.apiVersion).pipe(catchError(() => of([] as MenuLanguage[])))
            : of([] as MenuLanguage[]),
          translations: supported.length
            ? this.merchantApi.getProductTranslations(env, this.apiVersion, this.merchantId, this.productId)
            : of([] as CatalogTranslation[]),
        });
      })
    ).subscribe({
      next: ({ merchant, product: { product, preparation }, categories, menuLanguages, translations }) => {
        this.merchant = merchant;
        this.product = product;
        this.preparation = preparation;
        this.stationOverride = preparation?.productOverrides[product.productId] ?? '';
        this.categories = categories;
        this.menuLanguages = menuLanguages;
        this.translations = (merchant.supportedMenuLanguages ?? []).map((language) =>
          toTranslationRow(language, translations.find((t) => t.language === language)));
        this.populateForm(product);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Failed to load product.');
      }
    });
  }

  private populateForm(product: Product): void {
    this.form = {
      name: product.name ?? '',
      description: product.description ?? '',
      unitPrice: Number(product.unitPrice).toFixed(2),
      categoryId: product.categoryId ?? '',
      active: product.active,
      productCode: product.productCode?.toString() ?? '',
    };
    this.imagePreviewUrl = product.imageUrl ?? '';
  }

  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.imageFile = file;
    this.imageFailed = false;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => { this.imagePreviewUrl = (e.target as FileReader).result as string; };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.errorMessage = '';

    const unitPriceMajor = parseFloat(this.form.unitPrice);
    if (isNaN(unitPriceMajor)) {
      this.errorMessage = 'Unit price must be a valid number.';
      this.saving = false;
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('description', this.form.description ?? '');
    formData.append('unitPrice', unitPriceMajor.toFixed(2));
    formData.append('active', this.form.active ? 'true' : 'false');
    if (this.form.categoryId) formData.append('categoryId', this.form.categoryId);
    if (this.form.productCode) formData.append('productCode', this.form.productCode);
    if (this.product?.branchId) formData.append('branchId', this.product.branchId);
    if (this.imageFile) formData.append('image', this.imageFile);

    this.merchantApi.updateProduct(this.selectedEnvironment, this.apiVersion, this.merchantId, this.productId, formData).pipe(
      switchMap(() => this.saveStationOverride())
    ).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/merchants', this.merchantId]); },
      error: (error) => { this.saving = false; this.notifications.apiError(error, 'Failed to save product.'); }
    });
  }

  /** Name of the station the product's category routes to, for the "use category default" option. */
  get categoryStationName(): string {
    const stationId = this.preparation?.categoryDefaults[this.form.categoryId];
    return this.preparation?.stations.find((s) => s.id === stationId)?.name ?? 'Unassigned';
  }

  private loadPreparation(product: Product): Observable<PreparationConfiguration | null> {
    if (!product.branchId) return of(null);
    return this.merchantApi.getPreparationConfiguration(this.selectedEnvironment, this.apiVersion, this.merchantId, product.branchId)
      .pipe(catchError(() => of(null)));
  }

  /** Saves the override only when it changed, re-reading the Branch routing first so other edits are kept. */
  private saveStationOverride(): Observable<unknown> {
    const branchId = this.product?.branchId;
    const productId = this.product?.productId;
    if (!branchId || !productId || !this.preparation) return of(null);
    if ((this.preparation.productOverrides[productId] ?? '') === this.stationOverride) return of(null);
    const env = this.selectedEnvironment;
    return this.merchantApi.getPreparationConfiguration(env, this.apiVersion, this.merchantId, branchId).pipe(
      map((latest) => {
        const productOverrides = { ...latest.productOverrides };
        if (this.stationOverride) productOverrides[productId] = this.stationOverride;
        else delete productOverrides[productId];
        return { ...latest, productOverrides };
      }),
      switchMap((next) => this.merchantApi.savePreparationConfiguration(env, this.apiVersion, this.merchantId, branchId, next))
    );
  }

  cancel(): void { this.router.navigate(['/merchants', this.merchantId]); }

  languageLabel(code: string): string { return languageLabel(code, this.menuLanguages); }

  textDirection(code: string): 'rtl' | 'ltr' { return isRightToLeft(code) ? 'rtl' : 'ltr'; }

  saveTranslation(row: TranslationRow): void {
    if (row.saving) return;
    row.error = '';
    if (!row.name.trim()) { row.error = 'Enter the translated name.'; return; }
    row.saving = true;
    this.merchantApi.saveProductTranslation(this.selectedEnvironment, this.apiVersion, this.merchantId, this.productId, row.language, {
      name: row.name.trim(),
      description: row.description.trim() || undefined,
    }).subscribe({
      next: (saved) => Object.assign(row, toTranslationRow(row.language, saved)),
      error: (error) => { row.saving = false; this.notifications.apiError(error, 'Failed to save translation.'); }
    });
  }

  deleteTranslation(row: TranslationRow): void {
    if (row.saving || !row.exists) return;
    if (!confirm(`Delete the ${this.languageLabel(row.language)} translation?`)) return;
    row.saving = true;
    row.error = '';
    this.merchantApi.deleteProductTranslation(this.selectedEnvironment, this.apiVersion, this.merchantId, this.productId, row.language).subscribe({
      next: () => Object.assign(row, toTranslationRow(row.language)),
      error: (error) => { row.saving = false; this.notifications.apiError(error, 'Failed to delete translation.'); }
    });
  }

}
