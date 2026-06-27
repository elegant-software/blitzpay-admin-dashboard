import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import {
  AppearanceHistoryItem,
  AppearanceHistoryStatus,
  EnvironmentKey,
  OperationalAppearanceItem,
  Branch,
  CategorySortField,
  CategoryTableState,
  BranchSortField,
  BranchTableState,
  Merchant,
  MerchantLocation,
  MerchantVerticalResponse,
  PaymentAccountStatus,
  ProviderAccountResponse,
  Product,
  ProductCategory,
  ProductSortField,
  ProductTableState,
  TableSortDirection,
} from '../models/merchant-catalog.models';
import { filterRowsByFields, hasActiveQuery, nextSortDirection, paginateRows, sortRows } from './merchant-catalog-table-state';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-merchant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DisplayDatePipe, InputTextModule, PaginatorModule],
  templateUrl: './merchant-detail.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class MerchantDetailComponent implements OnInit, OnDestroy {
  selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  selectedMerchant: Merchant | null = null;
  merchantLocation: MerchantLocation | null = null;
  branches: Branch[] = [];
  categories: ProductCategory[] = [];
  selectedBranch: Branch | null = null;
  products: Product[] = [];

  appearanceOperational: OperationalAppearanceItem[] = [];
  appearanceOperationalLoading = false;
  appearanceOperationalError = '';
  appearanceHistory: AppearanceHistoryItem[] = [];
  appearanceHistoryLoading = false;
  appearanceHistoryError = '';
  appearanceHistoryBranchId = '';
  appearanceHistoryStatus: AppearanceHistoryStatus | '' = '';
  appearanceHistoryFrom = this.isoDateDaysAgo(365);
  appearanceHistoryTo = this.isoDateDaysAgo(0);
  appearanceHistoryPage = 0;
  appearanceHistoryTotalElements = 0;
  appearanceHistoryTotalPages = 0;

  categoryTableState: CategoryTableState = this.createCategoryTableState();
  branchTableState: BranchTableState = this.createBranchTableState();
  productTableState: ProductTableState = this.createProductTableState();

  selectedCategory: ProductCategory | null = null;
  categoryDialogOpen = false;
  categoryDialogMode: 'create' | 'edit' = 'create';
  categoryFormName = '';
  categoryDialogError = '';

  merchantTableLogoFailed = false;
  failedProductImages = new Set<string>();

  paymentAccountStatus: PaymentAccountStatus = 'loading';
  paymentAccountActionLoading = false;
  paymentAccountError: string | null = null;
  tapToPayEnabled = false;
  tapToPayActionLoading = false;
  tapToPayError: string | null = null;

  providerAccounts: ProviderAccountResponse[] = [];
  providerAccountsLoading = false;
  providerAccountsError: string | null = null;
  providerAccountActionLoading = new Set<string>();

  statusMessage = '';
  errorMessage = '';
  loading = false;

  verticals: MerchantVerticalResponse[] = [];
  verticalsLoading = false;

  activeDetailTab: 'info' | 'branches-products' | 'payment' | 'appearances' = 'info';

  readonly serviceOptions = [
    { code: 'PRE_ORDER', label: 'Pre-Order' },
    { code: 'WALK_IN_ORDERING', label: 'Walk-In Ordering' },
    { code: 'DEFERRED_PAYMENT', label: 'Deferred Payment' },
    { code: 'APPOINTMENT_BOOKING', label: 'Appointment' }
  ];

  readonly branchFilterHint = 'Filter by branch name, country, city, or zipcode.';
  readonly categoryFilterHint = 'Filter by category name.';
  readonly productFilterHint = 'Filter by product code, category, or name.';
  readonly knownPspCodes = ['STRIPE', 'PAYPAL'];

  private routeSub?: Subscription;

  constructor(
    private readonly merchantApi: MerchantApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.verticalsLoading = true;
    this.merchantApi.getVerticals(this.selectedEnvironment, this.apiVersion).subscribe({
      next: (v) => { this.verticals = v; this.verticalsLoading = false; },
      error: () => { this.verticalsLoading = false; }
    });

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMerchantById(id, 'Unable to load merchant.');
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  get selectedEnvironment() {
    return getEnvironmentByKey(this.selectedEnvironmentKey);
  }

  get branchCatalogUrl(): string {
    const merchantId = this.selectedMerchant?.applicationId;
    const branchId = this.selectedBranch?.branchId ?? this.selectedBranch?.id;
    if (!merchantId || !branchId) return '';
    return `${this.selectedEnvironment.storefrontUrl}/m/${encodeURIComponent(merchantId)}/b/${encodeURIComponent(branchId)}`;
  }

  branchWebCatalogUrl(branch: Branch): string {
    const merchantId = this.selectedMerchant?.applicationId;
    const branchId = branch.branchId ?? branch.id;
    if (!merchantId || !branchId) return '';
    return `${this.selectedEnvironment.storefrontUrl}/m/${encodeURIComponent(merchantId)}/b/${encodeURIComponent(branchId)}`;
  }

  get visibleBranchRows(): Branch[] { return this.branchTableState.visibleRows; }
  get visibleCategoryRows(): ProductCategory[] { return this.categoryTableState.visibleRows; }
  get visibleProductRows(): Product[] { return this.productTableState.visibleRows; }
  get branchVisibleCount(): number { return this.branchTableState.pagination.totalRecords; }
  get categoryVisibleCount(): number { return this.categoryTableState.pagination.totalRecords; }
  get productVisibleCount(): number { return this.productTableState.pagination.totalRecords; }
  get branchFilterActive(): boolean { return hasActiveQuery(this.branchTableState.filter.query); }
  get categoryFilterActive(): boolean { return hasActiveQuery(this.categoryTableState.filter.query); }
  get productFilterActive(): boolean { return hasActiveQuery(this.productTableState.filter.query); }
  get branchPaginatorVisible(): boolean { return this.branchVisibleCount > this.branchTableState.pagination.rows; }
  get categoryPaginatorVisible(): boolean { return this.categoryVisibleCount > this.categoryTableState.pagination.rows; }
  get productPaginatorVisible(): boolean { return this.productVisibleCount > this.productTableState.pagination.rows; }

  get branchNameSortDirection(): TableSortDirection | null { return this.branchTableState.sort.field === 'name' ? this.branchTableState.sort.direction : null; }
  get branchStatusSortDirection(): TableSortDirection | null { return this.branchTableState.sort.field === 'status' ? this.branchTableState.sort.direction : null; }
  get categoryNameSortDirection(): TableSortDirection | null { return this.categoryTableState.sort.field === 'name' ? this.categoryTableState.sort.direction : null; }
  get productNameSortDirection(): TableSortDirection | null { return this.productTableState.sort.field === 'name' ? this.productTableState.sort.direction : null; }
  get productCodeSortDirection(): TableSortDirection | null { return this.productTableState.sort.field === 'productCode' ? this.productTableState.sort.direction : null; }
  get productCategorySortDirection(): TableSortDirection | null { return this.productTableState.sort.field === 'categoryName' ? this.productTableState.sort.direction : null; }
  get productStatusSortDirection(): TableSortDirection | null { return this.productTableState.sort.field === 'status' ? this.productTableState.sort.direction : null; }

  get productEmptyMessage(): string {
    switch (this.productTableState.emptyStateKind) {
      case 'no-filter-results': return 'No products match the current filters.';
      case 'no-data': return 'No products for the selected branch.';
      default: return 'Select a branch to load products.';
    }
  }
  get branchEmptyMessage(): string {
    return this.branchTableState.emptyStateKind === 'no-filter-results' ? 'No branches match the current filters.' : 'No branches for this merchant.';
  }
  get categoryEmptyMessage(): string {
    return this.categoryTableState.emptyStateKind === 'no-filter-results' ? 'No product categories match the current filters.' : 'No product categories for this merchant.';
  }

  get stripeEnabled(): boolean { return this.isProviderEnabled('STRIPE'); }

  merchantStatusTone(status: string): string {
    const n = status.toLowerCase();
    if (n === 'active') return 'status-tag-success';
    if (n.includes('review') || n.includes('pending') || n.includes('screening')) return 'status-tag-warning';
    if (n.includes('rejected') || n.includes('action_required')) return 'status-tag-danger';
    return 'status-tag-neutral';
  }
  productStatusTone(product: Product): string { return product.active ? 'status-tag-success' : 'status-tag-neutral'; }
  productStatusLabel(product: Product): string { return product.active ? 'Active' : 'Inactive'; }
  branchStatusTone(branch: Branch): string { return branch.active === false ? 'status-tag-neutral' : 'status-tag-success'; }
  branchStatusLabel(branch: Branch): string { return branch.active === false ? 'Inactive' : 'Active'; }
  serviceLabel(code: string): string { return this.serviceOptions.find(s => s.code === code)?.label ?? code; }
  verticalDisplayName(code: string): string { return this.verticals.find(v => v.code === code)?.displayName ?? code; }

  sortAriaSort(direction: TableSortDirection | null): 'ascending' | 'descending' | 'none' {
    if (direction === 'asc') return 'ascending';
    if (direction === 'desc') return 'descending';
    return 'none';
  }
  sortButtonLabel(columnLabel: string, direction: TableSortDirection | null): string {
    return direction === 'asc' ? `Sort ${columnLabel} descending` : `Sort ${columnLabel} ascending`;
  }
  sortIconClass(direction: TableSortDirection | null): string {
    if (direction === 'asc') return 'pi pi-sort-alpha-down';
    if (direction === 'desc') return 'pi pi-sort-alpha-up';
    return 'pi pi-sort-alt';
  }

  navigateToMerchantEdit(): void {
    if (!this.selectedMerchant) return;
    this.router.navigate(['/merchants', this.selectedMerchant.applicationId, 'edit']);
  }

  navigateToBranchEdit(branch: Branch): void {
    if (!this.selectedMerchant) return;
    const branchId = branch.branchId ?? branch.id;
    this.router.navigate(['/merchants', this.selectedMerchant.applicationId, 'branches', branchId, 'edit']);
  }

  navigateToProductEdit(product: Product): void {
    if (!this.selectedMerchant) return;
    this.router.navigate(['/merchants', this.selectedMerchant.applicationId, 'products', product.productId, 'edit']);
  }

  viewSettlements(): void {
    if (!this.selectedMerchant) return;
    this.router.navigate(['/settlements'], { queryParams: { merchantId: this.selectedMerchant.applicationId } });
  }

  viewAppointments(): void {
    if (!this.selectedMerchant) return;
    this.router.navigate(['/appointments'], { queryParams: { merchantId: this.selectedMerchant.applicationId } });
  }

  onBranchFilterChange(): void { this.branchTableState.pagination.first = 0; this.syncBranchTableState(); }
  onCategoryFilterChange(): void { this.categoryTableState.pagination.first = 0; this.syncCategoryTableState(); }
  onProductFilterChange(): void { this.productTableState.pagination.first = 0; this.syncProductTableState(); }
  clearBranchFilters(): void { this.branchTableState.filter.query = ''; this.branchTableState.pagination.first = 0; this.syncBranchTableState(); }
  clearCategoryFilters(): void { this.categoryTableState.filter.query = ''; this.categoryTableState.pagination.first = 0; this.syncCategoryTableState(); }
  clearProductFilters(): void { this.productTableState.filter.query = ''; this.productTableState.pagination.first = 0; this.syncProductTableState(); }

  onBranchPageChange(event: { first?: number; rows?: number }): void {
    this.branchTableState.pagination.first = event.first ?? 0;
    this.branchTableState.pagination.rows = event.rows ?? this.branchTableState.pagination.rows;
    this.syncBranchTableState();
  }
  onCategoryPageChange(event: { first?: number; rows?: number }): void {
    this.categoryTableState.pagination.first = event.first ?? 0;
    this.categoryTableState.pagination.rows = event.rows ?? this.categoryTableState.pagination.rows;
    this.syncCategoryTableState();
  }
  onProductPageChange(event: { first?: number; rows?: number }): void {
    this.productTableState.pagination.first = event.first ?? 0;
    this.productTableState.pagination.rows = event.rows ?? this.productTableState.pagination.rows;
    this.syncProductTableState();
  }

  toggleBranchSort(field: BranchSortField): void {
    const isSameField = this.branchTableState.sort.field === field;
    this.branchTableState.sort = { field, direction: nextSortDirection(this.branchTableState.sort.direction, isSameField) };
    this.syncBranchTableState();
  }
  toggleCategorySort(field: CategorySortField): void {
    const isSameField = this.categoryTableState.sort.field === field;
    this.categoryTableState.sort = { field, direction: nextSortDirection(this.categoryTableState.sort.direction, isSameField) };
    this.syncCategoryTableState();
  }
  toggleProductSort(field: ProductSortField): void {
    const isSameField = this.productTableState.sort.field === field;
    this.productTableState.sort = { field, direction: nextSortDirection(this.productTableState.sort.direction, isSameField) };
    this.syncProductTableState();
  }

  selectBranch(branch: Branch): void {
    if (!this.selectedMerchant) return;
    const branchId = branch.branchId ?? branch.id;
    if (!branchId) { this.selectedBranch = this.normalizeBranch(branch); return; }

    this.loading = true;
    this.merchantApi.getBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, branchId).subscribe({
      next: (detail) => {
        this.selectedBranch = this.normalizeBranch(detail);
        this.resetProductTableStateForBranch(this.selectedBranch.branchId ?? null);
        this.loadProductsForSelectedBranch();
      },
      error: (error) => {
        if (branch.active === false) {
          this.selectedBranch = this.normalizeBranch(branch);
          this.resetProductTableStateForBranch(this.selectedBranch.branchId ?? null);
          this.loadProductsForSelectedBranch();
          return;
        }
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Unable to load branch details.');
      }
    });
  }

  removeBranch(branch: Branch): void {
    if (!this.selectedMerchant || !branch.branchId) return;
    if (!confirm(`Deactivate branch "${branch.name}"?`)) return;

    this.loading = true;
    this.merchantApi.deleteBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, branch.branchId).subscribe({
      next: () => {
        this.loading = false;
        this.statusMessage = `Branch "${branch.name}" deactivated.`;
        this.branches = this.branches.map(b => b.branchId === branch.branchId ? { ...b, active: false } : b);
        this.syncBranchTableState();
        if (this.selectedBranch?.branchId === branch.branchId) {
          this.selectedBranch = null;
          this.products = [];
          this.resetProductTableStateForBranch(null);
        }
      },
      error: (error) => { this.loading = false; this.errorMessage = this.toMessage(error, 'Unable to deactivate branch.'); }
    });
  }

  removeProduct(product: Product): void {
    if (!this.selectedMerchant || !confirm(`Soft-remove product "${product.name}"?`)) return;

    this.loading = true;
    this.merchantApi.removeProduct(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, product.productId, product.branchId ?? undefined).subscribe({
      next: () => {
        this.loading = false;
        this.statusMessage = 'Product marked inactive.';
        this.products = this.products.map(item => item.productId === product.productId ? { ...item, active: false } : item);
        this.syncProductTableState();
      },
      error: (error) => { this.loading = false; this.errorMessage = this.toMessage(error, 'Unable to mark product inactive.'); }
    });
  }

  openCreateCategoryDialog(): void {
    if (!this.selectedMerchant) return;
    this.selectedCategory = null;
    this.categoryDialogMode = 'create';
    this.categoryFormName = '';
    this.categoryDialogError = '';
    this.categoryDialogOpen = true;
  }

  openEditCategoryDialog(category: ProductCategory): void {
    this.selectedCategory = category;
    this.categoryDialogMode = 'edit';
    this.categoryFormName = category.name;
    this.categoryDialogError = '';
    this.categoryDialogOpen = true;
  }

  closeCategoryDialog(force = false): void {
    if (!force && this.categoryFormName !== (this.selectedCategory?.name ?? '') && !confirm('Close the category editor and discard unsaved changes?')) return;
    this.categoryDialogError = '';
    this.categoryDialogOpen = false;
    this.selectedCategory = null;
    this.categoryFormName = '';
    this.categoryDialogMode = 'create';
  }

  saveCategory(): void {
    if (!this.selectedMerchant) return;
    const name = this.categoryFormName.trim();
    if (!name) { this.categoryDialogError = 'Category name is required.'; return; }

    this.loading = true;
    this.categoryDialogError = '';

    const request$ = this.categoryDialogMode === 'create'
      ? this.merchantApi.createProductCategory(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, { name })
      : this.merchantApi.renameProductCategory(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, this.selectedCategory!.id, { name });

    request$.subscribe({
      next: (category) => {
        this.loading = false;
        const wasCreate = this.categoryDialogMode === 'create';
        this.categories = this.upsertCategory(this.categories, category);
        this.syncCategoryTableState();
        this.closeCategoryDialog(true);
        this.statusMessage = wasCreate ? 'Category created.' : 'Category renamed.';
      },
      error: (error) => {
        this.loading = false;
        this.categoryDialogError = this.toMessage(error, this.categoryDialogMode === 'create' ? 'Unable to create category.' : 'Unable to rename category.');
      }
    });
  }

  removeCategory(category: ProductCategory): void {
    if (!this.selectedMerchant || !confirm(`Delete category "${category.name}"?`)) return;

    this.loading = true;
    this.merchantApi.deleteProductCategory(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, category.id).subscribe({
      next: () => {
        this.loading = false;
        this.categories = this.categories.filter(item => item.id !== category.id);
        this.syncCategoryTableState();
        this.statusMessage = 'Category deleted.';
        if (this.selectedCategory?.id === category.id) this.closeCategoryDialog(true);
      },
      error: (error) => { this.loading = false; this.errorMessage = this.toMessage(error, 'Unable to delete category.'); }
    });
  }

  loadAppearanceOperational(): void {
    if (!this.selectedMerchant || this.selectedMerchant.merchantMobility !== 'MOBILE') return;
    this.appearanceOperationalLoading = true;
    this.appearanceOperationalError = '';
    this.merchantApi.getAppearanceOperational(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId).subscribe({
      next: result => { this.appearanceOperational = result; this.appearanceOperationalLoading = false; },
      error: error => { this.appearanceOperational = []; this.appearanceOperationalLoading = false; this.appearanceOperationalError = this.toMessage(error, 'Operational appearances could not be loaded.'); }
    });
  }

  loadAppearanceHistory(page = this.appearanceHistoryPage): void {
    if (!this.selectedMerchant || this.selectedMerchant.merchantMobility !== 'MOBILE') return;
    this.appearanceHistoryLoading = true;
    this.appearanceHistoryError = '';
    this.appearanceHistoryPage = page;
    this.merchantApi.getAppearanceHistory(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, {
      branchId: this.appearanceHistoryBranchId || undefined,
      status: this.appearanceHistoryStatus || undefined,
      from: new Date(`${this.appearanceHistoryFrom}T00:00:00`).toISOString(),
      to: new Date(`${this.appearanceHistoryTo}T23:59:59`).toISOString(),
      page,
      size: 20
    }).subscribe({
      next: result => { this.appearanceHistory = result.content; this.appearanceHistoryPage = result.page; this.appearanceHistoryTotalElements = result.totalElements; this.appearanceHistoryTotalPages = result.totalPages; this.appearanceHistoryLoading = false; },
      error: error => { this.appearanceHistory = []; this.appearanceHistoryLoading = false; this.appearanceHistoryError = this.toMessage(error, 'Appearance history could not be loaded.'); }
    });
  }

  applyAppearanceHistoryFilters(): void { this.loadAppearanceHistory(0); }

  loadPaymentAccountStatus(merchantId: string): void {
    this.merchantApi.getStripeConnectStatus(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: (data) => {
        if (data.connected && data.chargesEnabled) this.paymentAccountStatus = 'connected';
        else if (data.detailsSubmitted) this.paymentAccountStatus = 'verifying';
        else this.paymentAccountStatus = 'not_connected';
        this.tapToPayEnabled = data.enabledPaymentFlows?.includes('TAP_TO_PAY') ?? false;
      },
      error: () => { this.paymentAccountStatus = 'error'; }
    });
  }

  onTapToPayToggle(enabled: boolean, merchantId: string): void {
    if (this.tapToPayActionLoading) return;
    this.tapToPayActionLoading = true;
    this.tapToPayError = null;
    const call$ = enabled
      ? this.merchantApi.enableTapToPay(this.selectedEnvironment, this.apiVersion, merchantId)
      : this.merchantApi.disableTapToPay(this.selectedEnvironment, this.apiVersion, merchantId);
    call$.subscribe({
      next: (res) => { this.tapToPayEnabled = res.tapToPayEnabled; this.tapToPayActionLoading = false; },
      error: (err) => { this.tapToPayError = this.toMessage(err, 'Failed to update Tap to Pay setting.'); this.tapToPayActionLoading = false; }
    });
  }

  handleStripeConnect(): void {
    if (!this.selectedMerchant || this.paymentAccountActionLoading) return;
    const merchantId = this.selectedMerchant.applicationId;
    const origin = window.location.origin;
    const base = `${origin}/stripe-connect/return?merchantId=${merchantId}&env=${this.selectedEnvironmentKey}&apiVersion=${this.apiVersion}`;
    this.paymentAccountActionLoading = true;
    this.paymentAccountError = null;

    const call$ = this.paymentAccountStatus === 'verifying'
      ? this.merchantApi.refreshStripeConnect(this.selectedEnvironment, this.apiVersion, merchantId, base, `${base}&refresh=true`)
      : this.merchantApi.startStripeConnect(this.selectedEnvironment, this.apiVersion, merchantId, { returnUrl: base, refreshUrl: `${base}&refresh=true` });

    call$.subscribe({
      next: (res) => { this.paymentAccountActionLoading = false; window.open(res.onboardingUrl, '_blank'); },
      error: (err) => { this.paymentAccountActionLoading = false; this.paymentAccountError = this.toMessage(err, 'Failed to start Stripe Connect onboarding.'); }
    });
  }

  loadProviderAccounts(merchantId: string): void {
    this.providerAccountsLoading = true;
    this.providerAccountsError = null;
    this.merchantApi.listProviderAccounts(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: (accounts) => { this.providerAccounts = accounts; this.providerAccountsLoading = false; },
      error: (err) => { this.providerAccountsError = this.toMessage(err, 'Failed to load provider accounts.'); this.providerAccountsLoading = false; }
    });
  }

  enableProviderAccount(pspCode: string): void {
    if (!this.selectedMerchant || this.providerAccountActionLoading.has(pspCode)) return;
    this.providerAccountActionLoading.add(pspCode);
    this.merchantApi.enableProviderAccount(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, pspCode).subscribe({
      next: (account) => { this.providerAccounts = this.upsertProviderAccount(this.providerAccounts, account); this.providerAccountActionLoading.delete(pspCode); },
      error: (err) => { this.providerAccountsError = this.toMessage(err, `Failed to enable ${pspCode}.`); this.providerAccountActionLoading.delete(pspCode); }
    });
  }

  disableProviderAccount(pspCode: string): void {
    if (!this.selectedMerchant || this.providerAccountActionLoading.has(pspCode)) return;
    this.providerAccountActionLoading.add(pspCode);
    this.merchantApi.disableProviderAccount(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, pspCode).subscribe({
      next: () => { this.providerAccounts = this.providerAccounts.map(a => a.pspCode === pspCode ? { ...a, enabled: false } : a); this.providerAccountActionLoading.delete(pspCode); },
      error: (err) => { this.providerAccountsError = this.toMessage(err, `Failed to disable ${pspCode}.`); this.providerAccountActionLoading.delete(pspCode); }
    });
  }

  isProviderEnabled(pspCode: string): boolean { return this.providerAccounts.some(a => a.pspCode === pspCode && a.enabled); }
  isProviderInList(pspCode: string): boolean { return this.providerAccounts.some(a => a.pspCode === pspCode); }
  getProviderAccount(pspCode: string): ProviderAccountResponse | null { return this.providerAccounts.find(a => a.pspCode === pspCode) ?? null; }
  pspDisplayName(code: string): string { const n: Record<string, string> = { STRIPE: 'Stripe', PAYPAL: 'PayPal' }; return n[code] ?? code; }

  onProductImageError(productId: string): void { this.failedProductImages.add(productId); }
  onMerchantTableLogoError(): void { this.merchantTableLogoFailed = true; }

  getBranchNameForProduct(product: Product): string {
    if (!product.branchId) return 'Merchant-level product';
    const branch = this.branches.find(b => (b.branchId ?? b.id) === product.branchId);
    return branch ? branch.name : 'Merchant-level product';
  }

  private loadMerchantById(merchantId: string, fallbackMessage: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.merchantApi.getMerchant(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: (merchant) => this.selectMerchant(merchant),
      error: (error) => { this.loading = false; this.errorMessage = this.toMessage(error, fallbackMessage); }
    });
  }

  private selectMerchant(merchant: Merchant): void {
    this.selectedMerchant = merchant;
    this.selectedBranch = null;
    this.merchantTableLogoFailed = false;
    this.failedProductImages.clear();
    this.paymentAccountStatus = 'loading';
    this.paymentAccountActionLoading = false;
    this.paymentAccountError = null;
    this.providerAccounts = [];
    this.providerAccountsLoading = false;
    this.providerAccountsError = null;
    this.providerAccountActionLoading.clear();
    this.resetAppearanceHistory();
    this.activeDetailTab = 'info';

    this.loadPaymentAccountStatus(merchant.applicationId);
    this.loadProviderAccounts(merchant.applicationId);
    if (merchant.merchantMobility === 'MOBILE') {
      this.loadAppearanceOperational();
      this.loadAppearanceHistory();
    }

    forkJoin({
      location: this.merchantApi.getLocation(this.selectedEnvironment, this.apiVersion, merchant.applicationId).pipe(catchError(() => of(null))),
      branches: this.merchantApi.getBranches(this.selectedEnvironment, this.apiVersion, merchant.applicationId).pipe(catchError(() => of([]))),
      categories: this.merchantApi.getProductCategories(this.selectedEnvironment, this.apiVersion, merchant.applicationId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ location, branches, categories }) => {
        this.merchantLocation = location;
        this.branches = branches.map(b => this.normalizeBranch(b));
        this.categories = categories;
        this.selectedBranch = this.branches[0] ?? null;
        this.products = [];
        this.categoryTableState = this.createCategoryTableState();
        this.branchTableState = this.createBranchTableState();
        this.productTableState = this.createProductTableState();
        this.syncCategoryTableState();
        this.syncBranchTableState();
        this.resetProductTableStateForBranch(this.selectedBranch?.branchId ?? null);
        this.statusMessage = `Loaded merchant ${merchant.applicationReference}.`;
        if (this.selectedBranch?.branchId) {
          this.loadProductsForSelectedBranch();
          return;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; this.errorMessage = 'Merchant loaded but one or more related sections failed to load.'; }
    });
  }

  private loadProductsForSelectedBranch(): void {
    if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
      this.loading = false;
      this.products = [];
      this.resetProductTableStateForBranch(null);
      return;
    }

    this.loading = true;
    this.resetProductTableStateForBranch(this.selectedBranch.branchId);
    this.merchantApi.getProducts(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, this.selectedBranch.branchId).subscribe({
      next: (products) => { this.loading = false; this.products = products; this.syncProductTableState(); },
      error: (error) => { this.loading = false; this.products = []; this.syncProductTableState(); this.errorMessage = this.toMessage(error, 'Unable to load products.'); }
    });
  }

  private syncBranchTableState(): void {
    const filteredRows = filterRowsByFields(this.branches, this.branchTableState.filter.query, b => [b.name, b.country, b.city, b.postalCode]);
    const sortedRows = sortRows(filteredRows, this.branchTableState.sort, (b, field) => field === 'status' ? this.branchStatusLabel(b) : b[field]);
    const page = paginateRows(sortedRows, this.branchTableState.pagination);
    this.branchTableState.pagination.totalRecords = page.totalRecords;
    this.branchTableState.pagination.first = page.normalizedFirst;
    this.branchTableState.visibleRows = page.pageRows;
    this.branchTableState.emptyStateKind = this.branches.length === 0 ? 'no-data' : (page.totalRecords === 0 ? 'no-filter-results' : 'no-data');
  }

  private syncCategoryTableState(): void {
    const filteredRows = filterRowsByFields(this.categories, this.categoryTableState.filter.query, c => [c.name]);
    const sortedRows = sortRows(filteredRows, this.categoryTableState.sort, (c, field) => c[field]);
    const page = paginateRows(sortedRows, this.categoryTableState.pagination);
    this.categoryTableState.pagination.totalRecords = page.totalRecords;
    this.categoryTableState.pagination.first = page.normalizedFirst;
    this.categoryTableState.visibleRows = page.pageRows;
    this.categoryTableState.emptyStateKind = this.categories.length === 0 ? 'no-data' : (page.totalRecords === 0 ? 'no-filter-results' : 'no-data');
  }

  private syncProductTableState(): void {
    const filteredRows = filterRowsByFields(this.products, this.productTableState.filter.query, p => [p.productCode, p.categoryName, p.name]);
    const sortedRows = sortRows(filteredRows, this.productTableState.sort, (p, field) => field === 'status' ? this.productStatusLabel(p) : p[field]);
    const page = paginateRows(sortedRows, this.productTableState.pagination);
    this.productTableState.pagination.totalRecords = page.totalRecords;
    this.productTableState.pagination.first = page.normalizedFirst;
    this.productTableState.visibleRows = page.pageRows;
    this.productTableState.branchId = this.selectedBranch?.branchId ?? null;
    if (!this.selectedBranch?.branchId) { this.productTableState.emptyStateKind = 'no-branch-selected'; return; }
    this.productTableState.emptyStateKind = this.products.length === 0 ? 'no-data' : (page.totalRecords === 0 ? 'no-filter-results' : 'no-data');
  }

  private resetProductTableStateForBranch(branchId: string | null): void {
    this.productTableState = this.createProductTableState(branchId);
    this.syncProductTableState();
  }

  private createBranchTableState(): BranchTableState {
    return { filter: { query: '' }, sort: { field: null, direction: null }, pagination: { first: 0, rows: 5, rowsPerPageOptions: [5, 10, 20], totalRecords: 0 }, visibleRows: [], emptyStateKind: 'no-data' };
  }
  private createCategoryTableState(): CategoryTableState {
    return { filter: { query: '' }, sort: { field: null, direction: null }, pagination: { first: 0, rows: 5, rowsPerPageOptions: [5, 10, 20], totalRecords: 0 }, visibleRows: [], emptyStateKind: 'no-data' };
  }
  private createProductTableState(branchId: string | null = null): ProductTableState {
    return { branchId, filter: { query: '' }, sort: { field: null, direction: null }, pagination: { first: 0, rows: 5, rowsPerPageOptions: [5, 10, 20], totalRecords: 0 }, visibleRows: [], emptyStateKind: branchId ? 'no-data' : 'no-branch-selected' };
  }

  private normalizeBranch(branch: Branch): Branch { return { ...branch, branchId: branch.branchId ?? branch.id }; }

  private upsertCategory(categories: ProductCategory[], category: ProductCategory): ProductCategory[] {
    const idx = categories.findIndex(item => item.id === category.id);
    return idx === -1 ? [...categories, category] : categories.map((item, i) => i === idx ? category : item);
  }

  private upsertProviderAccount(accounts: ProviderAccountResponse[], account: ProviderAccountResponse): ProviderAccountResponse[] {
    const idx = accounts.findIndex(a => a.pspCode === account.pspCode);
    return idx === -1 ? [...accounts, account] : accounts.map((a, i) => i === idx ? account : a);
  }

  private resetAppearanceHistory(): void {
    this.appearanceOperational = [];
    this.appearanceOperationalLoading = false;
    this.appearanceOperationalError = '';
    this.appearanceHistory = [];
    this.appearanceHistoryLoading = false;
    this.appearanceHistoryError = '';
    this.appearanceHistoryBranchId = '';
    this.appearanceHistoryStatus = '';
    this.appearanceHistoryFrom = this.isoDateDaysAgo(365);
    this.appearanceHistoryTo = this.isoDateDaysAgo(0);
    this.appearanceHistoryPage = 0;
    this.appearanceHistoryTotalElements = 0;
    this.appearanceHistoryTotalPages = 0;
  }

  private isoDateDaysAgo(days: number): string { return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10); }

  private toMessage(error: unknown, fallback: string): string {
    const body = (error as { error?: { detail?: string; message?: string } })?.error;
    return body?.detail || body?.message || fallback;
  }
}
