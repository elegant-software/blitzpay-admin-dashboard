import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { BranchCatalogQrComponent } from '../merchant-catalog/branch-catalog-qr.component';
import { Branch, EnvironmentKey, Merchant, Product } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { CategoryShowcase, FullCatalogSection, buildCategoryShowcase, buildFullCatalog } from './printed-catalog';

export type PrintedCatalogLayout = 'full' | 'showcase';

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

@Component({
  selector: 'app-printed-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, BranchCatalogQrComponent],
  templateUrl: './printed-catalog.component.html',
  styleUrl: './printed-catalog.component.css'
})
export class PrintedCatalogComponent implements OnInit {
  private readonly merchantApi = inject(MerchantApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  merchantId = '';
  branchId = '';
  layout: PrintedCatalogLayout = 'full';

  merchant: Merchant | null = null;
  branch: Branch | null = null;
  sections: FullCatalogSection[] = [];
  showcase: CategoryShowcase = { entries: [], hasMoreCategories: false };

  loading = false;
  errorMessage = '';

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  get webCatalogUrl(): string {
    return `${this.selectedEnvironment.storefrontUrl}/m/${encodeURIComponent(this.merchantId)}/b/${encodeURIComponent(this.branchId)}`;
  }

  get isEmpty(): boolean { return this.sections.length === 0; }

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
      .subscribe((params) => this.layout = params.get('layout') === 'showcase' ? 'showcase' : 'full');
    if (!this.merchantId || !this.branchId) { this.errorMessage = 'Missing route parameters.'; return; }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    const env = this.selectedEnvironment;
    forkJoin({
      merchant: this.merchantApi.getMerchant(env, this.apiVersion, this.merchantId),
      branch: this.merchantApi.getBranch(env, this.apiVersion, this.merchantId, this.branchId),
      products: this.merchantApi.getProducts(env, this.apiVersion, this.merchantId, this.branchId, false)
    }).subscribe({
      next: ({ merchant, branch, products }) => {
        this.merchant = merchant;
        this.branch = branch;
        this.applyProducts(products);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Failed to load the Printed Catalog.');
      }
    });
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
    this.sections = buildFullCatalog(products);
    this.showcase = buildCategoryShowcase(products);
  }

  private toMessage(error: unknown, fallback: string): string {
    const body = (error as { error?: { detail?: string; message?: string } })?.error;
    return body?.detail || body?.message || fallback;
  }
}
