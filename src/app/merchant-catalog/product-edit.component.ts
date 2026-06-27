import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnvironmentKey, Product, ProductCategory } from '../models/merchant-catalog.models';
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
  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  merchantId = '';
  productId = '';
  product: Product | null = null;
  categories: ProductCategory[] = [];

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
    forkJoin({
      product: this.merchantApi.getProduct(this.selectedEnvironment, this.apiVersion, this.merchantId, this.productId),
      categories: this.merchantApi.getProductCategories(this.selectedEnvironment, this.apiVersion, this.merchantId).pipe(catchError(() => of([] as ProductCategory[]))),
    }).subscribe({
      next: ({ product, categories }) => {
        this.product = product;
        this.categories = categories;
        this.populateForm(product);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Failed to load product.');
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

    this.merchantApi.updateProduct(this.selectedEnvironment, this.apiVersion, this.merchantId, this.productId, formData).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/merchants', this.merchantId]); },
      error: (error) => { this.saving = false; this.errorMessage = this.toMessage(error, 'Failed to save product.'); }
    });
  }

  cancel(): void { this.router.navigate(['/merchants', this.merchantId]); }

  private toMessage(error: unknown, fallback: string): string {
    const body = (error as { error?: { detail?: string; message?: string } })?.error;
    return body?.detail || body?.message || fallback;
  }
}
