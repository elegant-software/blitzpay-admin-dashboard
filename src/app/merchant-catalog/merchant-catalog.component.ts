import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import * as L from 'leaflet';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  Branch,
  CategorySortField,
  CategoryTableState,
  BranchSortField,
  BranchTableState,
  BranchFormModel,
  LogoFormModel,
  LocationFormModel,
  Merchant,
  MerchantFormModel,
  MerchantLocation,
  MerchantSearchRequest,
  MerchantSearchResultItem,
  MerchantSearchResponse,
  MerchantVerticalResponse,
  PaymentAccountStatus,
  ProviderAccountResponse,
  Product,
  ProductCategory,
  ProductSortField,
  ProductTableState,
  ProductFormModel,
  TableSortDirection,
  UpdateBranchRequest,
  UpdateMerchantRequest
} from '../models/merchant-catalog.models';
import { filterRowsByFields, hasActiveQuery, nextSortDirection, paginateRows, sortRows } from './merchant-catalog-table-state';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import { BranchCatalogQrComponent } from './branch-catalog-qr.component';

@Component({
  selector: 'app-merchant-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe, InputTextModule, PaginatorModule, BranchCatalogQrComponent],
  templateUrl: './merchant-catalog.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class MerchantCatalogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('leafletBranchMap') private leafletBranchMapElement?: ElementRef<HTMLDivElement>;

  selectedEnvironmentKey: 'local' | 'staging' = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  searchQuery = '';
  searchFilterBusinessTypes: string[] = [];
  searchFilterMobilities: string[] = [];
  searchFilterStatuses: string[] = [];
  viewMode: 'none' | 'results' | 'detail' = 'none';
  searchResults: MerchantSearchResultItem[] = [];
  searchPage = 0;
  searchTotalPages = 0;
  searchTotalElements = 0;
  searchLoading = false;

  selectedMerchant: Merchant | null = null;
  merchantLocation: MerchantLocation | null = null;
  branches: Branch[] = [];
  categories: ProductCategory[] = [];
  selectedBranch: Branch | null = null;
  products: Product[] = [];
  categoryTableState: CategoryTableState = this.createCategoryTableState();
  branchTableState: BranchTableState = this.createBranchTableState();
  productTableState: ProductTableState = this.createProductTableState();

  selectedProduct: Product | null = null;
  selectedCategory: ProductCategory | null = null;
  productDialogOpen = false;
  categoryDialogOpen = false;
  merchantDialogOpen = false;
  branchDialogOpen = false;
  merchantTableLogoFailed = false;
  failedProductImages = new Set<string>();
  productDialogPreviewUrl: string | null = null;
  productDialogImageLoadFailed = false;
  merchantLogoPreviewUrl: string | null = null;
  merchantLogoImageLoadFailed = false;
  merchantLogoSelectedFileName = '';
  merchantLogoSelectedFile: File | null = null;

  locationForm: LocationFormModel = this.emptyLocationForm();
  merchantForm: MerchantFormModel = this.emptyMerchantForm();
  branchForm: BranchFormModel = this.emptyBranchForm();
  productEditForm: ProductFormModel = this.emptyProductForm();
  logoForm: LogoFormModel = { storageKey: '' };
  categoryFormName = '';
  categoryDialogMode: 'create' | 'edit' = 'create';

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
  branchDialogError = '';
  branchDialogSuccess = '';
  merchantDialogError = '';
  merchantDialogSuccess = '';
  productDialogError = '';
  productDialogSuccess = '';
  categoryDialogError = '';
  loading = false;

  dirtyForms = {
    location: false,
    merchant: false,
    branch: false,
    editProduct: false,
    logo: false,
    category: false
  };

  verticals: MerchantVerticalResponse[] = [];
  verticalsLoading = false;

  readonly serviceOptions = [
    { code: 'PRE_ORDER', label: 'Pre-Order' },
    { code: 'WALK_IN_ORDERING', label: 'Walk-In Ordering' },
    { code: 'DEFERRED_PAYMENT', label: 'Deferred Payment' },
    { code: 'APPOINTMENT_BOOKING', label: 'Appointment' }
  ];
  private readonly serviceCodes = new Set(['PRE_ORDER', 'WALK_IN_ORDERING', 'DEFERRED_PAYMENT', 'APPOINTMENT_BOOKING']);
  readonly branchFilterHint = 'Filter by branch name, country, city, or zipcode.';
  readonly categoryFilterHint = 'Filter by category name.';
  readonly productFilterHint = 'Filter by product code, category, or name.';
  readonly merchantStatusOptions = [
    'DRAFT',
    'SUBMITTED',
    'VERIFICATION',
    'SCREENING',
    'RISK_REVIEW',
    'DECISION_PENDING',
    'SETUP',
    'ACTIVE',
    'MONITORING',
    'ACTION_REQUIRED',
    'REJECTED'
  ];
  readonly merchantMobilityOptions = ['BRICK_AND_MORTAR', 'MOBILE'];

  private leafletMap: L.Map | null = null;
  private leafletMarker: L.CircleMarker | null = null;
  private leafletCircle: L.Circle | null = null;
  private leafletRenderTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly merchantApi: MerchantApiService
  ) {}

  ngOnInit(): void {
    this.verticalsLoading = true;
    this.merchantApi.getVerticals(this.selectedEnvironment, this.apiVersion).subscribe({
      next: (verticals) => { this.verticals = verticals; this.verticalsLoading = false; },
      error: () => { this.verticalsLoading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.scheduleLeafletRender();
  }

  ngOnDestroy(): void {
    this.clearLeafletTimer();
    this.destroyLeafletMap();
    this.clearProductDialogPreviewUrl();
    this.clearMerchantLogoPreviewUrl();
  }

  get hasUnsavedChanges(): boolean {
    return Object.values(this.dirtyForms).some(Boolean);
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

  get activeSearchHint(): string {
    return 'Search by name, code, city, product, or apply filters. All fields are optional — leave blank to list recently updated merchants.';
  }

  get visibleBranchRows(): Branch[] {
    return this.branchTableState.visibleRows;
  }

  get visibleCategoryRows(): ProductCategory[] {
    return this.categoryTableState.visibleRows;
  }

  get visibleProductRows(): Product[] {
    return this.productTableState.visibleRows;
  }

  get branchVisibleCount(): number {
    return this.branchTableState.pagination.totalRecords;
  }

  get categoryVisibleCount(): number {
    return this.categoryTableState.pagination.totalRecords;
  }

  get productVisibleCount(): number {
    return this.productTableState.pagination.totalRecords;
  }

  get branchFilterActive(): boolean {
    return hasActiveQuery(this.branchTableState.filter.query);
  }

  get categoryFilterActive(): boolean {
    return hasActiveQuery(this.categoryTableState.filter.query);
  }

  get productFilterActive(): boolean {
    return hasActiveQuery(this.productTableState.filter.query);
  }

  get branchPaginatorVisible(): boolean {
    return this.branchVisibleCount > this.branchTableState.pagination.rows;
  }

  get categoryPaginatorVisible(): boolean {
    return this.categoryVisibleCount > this.categoryTableState.pagination.rows;
  }

  get productPaginatorVisible(): boolean {
    return this.productVisibleCount > this.productTableState.pagination.rows;
  }

  get branchNameSortDirection(): TableSortDirection | null {
    return this.branchTableState.sort.field === 'name' ? this.branchTableState.sort.direction : null;
  }

  get branchStatusSortDirection(): TableSortDirection | null {
    return this.branchTableState.sort.field === 'status' ? this.branchTableState.sort.direction : null;
  }

  get categoryNameSortDirection(): TableSortDirection | null {
    return this.categoryTableState.sort.field === 'name' ? this.categoryTableState.sort.direction : null;
  }

  get productNameSortDirection(): TableSortDirection | null {
    return this.productTableState.sort.field === 'name' ? this.productTableState.sort.direction : null;
  }

  get productCodeSortDirection(): TableSortDirection | null {
    return this.productTableState.sort.field === 'productCode' ? this.productTableState.sort.direction : null;
  }

  get productCategorySortDirection(): TableSortDirection | null {
    return this.productTableState.sort.field === 'categoryName' ? this.productTableState.sort.direction : null;
  }

  get productStatusSortDirection(): TableSortDirection | null {
    return this.productTableState.sort.field === 'status' ? this.productTableState.sort.direction : null;
  }

  get productEmptyMessage(): string {
    switch (this.productTableState.emptyStateKind) {
      case 'no-filter-results':
        return 'No products match the current filters.';
      case 'no-data':
        return 'No products for the selected branch.';
      default:
        return 'Select a branch to load products.';
    }
  }

  get branchEmptyMessage(): string {
    return this.branchTableState.emptyStateKind === 'no-filter-results'
      ? 'No branches match the current filters.'
      : 'No branches for this merchant.';
  }

  get categoryEmptyMessage(): string {
    return this.categoryTableState.emptyStateKind === 'no-filter-results'
      ? 'No product categories match the current filters.'
      : 'No product categories for this merchant.';
  }

  merchantStatusTone(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized === 'active') {
      return 'status-tag-success';
    }
    if (normalized.includes('review') || normalized.includes('pending') || normalized.includes('screening')) {
      return 'status-tag-warning';
    }
    if (normalized.includes('rejected') || normalized.includes('action_required')) {
      return 'status-tag-danger';
    }
    return 'status-tag-neutral';
  }

  productStatusTone(product: Product): string {
    return product.active ? 'status-tag-success' : 'status-tag-neutral';
  }

  productStatusLabel(product: Product): string {
    return product.active ? 'Active' : 'Inactive';
  }

  branchStatusTone(branch: Branch): string {
    return branch.active === false ? 'status-tag-neutral' : 'status-tag-success';
  }

  branchStatusLabel(branch: Branch): string {
    return branch.active === false ? 'Inactive' : 'Active';
  }

  get hasBranchCoordinates(): boolean {
    const latitude = this.toOptionalNumber(this.branchForm.latitude);
    const longitude = this.toOptionalNumber(this.branchForm.longitude);
    return latitude != null && longitude != null;
  }

  get branchMapLink(): string | null {
    const latitude = this.toOptionalNumber(this.branchForm.latitude);
    const longitude = this.toOptionalNumber(this.branchForm.longitude);
    if (latitude == null || longitude == null) {
      return null;
    }

    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  }

  get branchGeofenceRadius(): number | null {
    return this.toOptionalNumber(this.branchForm.geofenceRadiusMeters) ?? null;
  }

  onMerchantActiveToggle(active: boolean): void {
    if (active) {
      this.merchantForm.status = 'ACTIVE';
    } else if (this.merchantForm.status === 'ACTIVE') {
      this.merchantForm.status = 'SETUP';
    }
    this.dirtyForms.merchant = true;
  }

  onProductStatusToggle(active: boolean): void {
    if (!this.selectedProduct) {
      return;
    }
    this.productEditForm.active = active;
    this.selectedProduct = { ...this.selectedProduct, active };
    this.dirtyForms.editProduct = true;
  }

  refreshBranchMapPreview(): void {
    this.scheduleLeafletRender();
  }

  onBranchFilterChange(): void {
    this.branchTableState.pagination.first = 0;
    this.syncBranchTableState();
  }

  onCategoryFilterChange(): void {
    this.categoryTableState.pagination.first = 0;
    this.syncCategoryTableState();
  }

  onProductFilterChange(): void {
    this.productTableState.pagination.first = 0;
    this.syncProductTableState();
  }

  clearBranchFilters(): void {
    this.branchTableState.filter.query = '';
    this.branchTableState.pagination.first = 0;
    this.syncBranchTableState();
  }

  clearCategoryFilters(): void {
    this.categoryTableState.filter.query = '';
    this.categoryTableState.pagination.first = 0;
    this.syncCategoryTableState();
  }

  clearProductFilters(): void {
    this.productTableState.filter.query = '';
    this.productTableState.pagination.first = 0;
    this.syncProductTableState();
  }

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
    this.branchTableState.sort = {
      field,
      direction: nextSortDirection(this.branchTableState.sort.direction, isSameField)
    };
    this.syncBranchTableState();
  }

  toggleCategorySort(field: CategorySortField): void {
    const isSameField = this.categoryTableState.sort.field === field;
    this.categoryTableState.sort = {
      field,
      direction: nextSortDirection(this.categoryTableState.sort.direction, isSameField)
    };
    this.syncCategoryTableState();
  }

  toggleProductSort(field: ProductSortField): void {
    const isSameField = this.productTableState.sort.field === field;
    this.productTableState.sort = {
      field,
      direction: nextSortDirection(this.productTableState.sort.direction, isSameField)
    };
    this.syncProductTableState();
  }

  sortAriaSort(direction: TableSortDirection | null): 'ascending' | 'descending' | 'none' {
    if (direction === 'asc') {
      return 'ascending';
    }
    if (direction === 'desc') {
      return 'descending';
    }
    return 'none';
  }

  sortButtonLabel(columnLabel: string, direction: TableSortDirection | null): string {
    if (direction === 'asc') {
      return `Sort ${columnLabel} descending`;
    }
    if (direction === 'desc') {
      return `Sort ${columnLabel} ascending`;
    }
    return `Sort ${columnLabel} ascending`;
  }

  sortIconClass(direction: TableSortDirection | null): string {
    if (direction === 'asc') {
      return 'pi pi-sort-alpha-down';
    }
    if (direction === 'desc') {
      return 'pi pi-sort-alpha-up';
    }
    return 'pi pi-sort-alt';
  }

  runCatalogSearch(page = 0): void {
    this.errorMessage = '';
    this.statusMessage = '';
    this.searchLoading = true;
    this.searchPage = page;

    const request: MerchantSearchRequest = {
      q: this.searchQuery.trim() || undefined,
      businessTypes: this.searchFilterBusinessTypes.length ? [...this.searchFilterBusinessTypes] : undefined,
      merchantMobilities: this.searchFilterMobilities.length ? [...this.searchFilterMobilities] : undefined,
      statuses: this.searchFilterStatuses.length ? [...this.searchFilterStatuses] : undefined,
      page,
      size: 50,
    };

    this.merchantApi.searchMerchants(this.selectedEnvironment, this.apiVersion, request).subscribe({
      next: (response: MerchantSearchResponse) => {
        this.searchResults = response.results;
        this.searchPage = response.page;
        this.searchTotalPages = response.totalPages;
        this.searchTotalElements = response.totalElements;
        this.searchLoading = false;
        this.viewMode = 'results';
      },
      error: (error) => {
        this.searchLoading = false;
        this.errorMessage = this.toMessage(error, 'Search failed. Please try again.');
      }
    });
  }

  selectSearchResult(item: MerchantSearchResultItem): void {
    this.loadMerchantById(item.applicationId, 'Unable to load merchant.');
  }

  backToResults(): void {
    this.selectedMerchant = null;
    this.merchantLocation = null;
    this.branches = [];
    this.categories = [];
    this.products = [];
    this.viewMode = 'results';
    this.closeMerchantDialog();
    this.closeBranchDialog();
    this.closeCategoryDialog(true);
    this.closeProductDialog(true);
  }

  goToSearchPage(page: number): void {
    this.runCatalogSearch(page);
  }

  clearCatalogSearch(): void {
    this.searchQuery = '';
    this.searchFilterBusinessTypes = [];
    this.searchFilterMobilities = [];
    this.searchFilterStatuses = [];
    this.searchResults = [];
    this.searchPage = 0;
    this.searchTotalPages = 0;
    this.searchTotalElements = 0;
    this.viewMode = 'none';
    this.errorMessage = '';
    this.statusMessage = '';
    this.selectedMerchant = null;
    this.merchantLocation = null;
    this.branches = [];
    this.categories = [];
    this.products = [];
    this.selectedBranch = null;
    this.branchTableState = this.createBranchTableState();
    this.categoryTableState = this.createCategoryTableState();
    this.productTableState = this.createProductTableState();
    this.merchantForm = this.emptyMerchantForm();
    this.branchForm = this.emptyBranchForm();
    this.closeMerchantDialog();
    this.closeBranchDialog();
    this.closeCategoryDialog(true);
    this.closeProductDialog(true);
  }

  openMerchantDialog(): void {
    if (!this.selectedMerchant) {
      return;
    }
    this.merchantDialogError = '';
    this.merchantDialogSuccess = '';
    this.clearMerchantLogoPreviewUrl();
    this.merchantLogoImageLoadFailed = false;
    this.merchantLogoSelectedFileName = '';
    this.merchantLogoSelectedFile = null;
    this.merchantForm = this.merchantFormFromEntity(this.selectedMerchant);
    this.logoForm.storageKey = this.selectedMerchant.logoStorageKey ?? '';
    this.merchantDialogOpen = true;
    this.dirtyForms.merchant = false;
    this.dirtyForms.logo = false;

    if (!this.verticals.length && !this.verticalsLoading) {
      this.verticalsLoading = true;
      this.merchantApi.getVerticals(this.selectedEnvironment, this.apiVersion).subscribe({
        next: (verticals) => {
          this.verticals = verticals;
          this.verticalsLoading = false;
        },
        error: () => { this.verticalsLoading = false; }
      });
    }
  }

  closeMerchantDialog(): void {
    this.merchantDialogError = '';
    this.merchantDialogSuccess = '';
    this.clearMerchantLogoPreviewUrl();
    this.merchantLogoImageLoadFailed = false;
    this.merchantLogoSelectedFileName = '';
    this.merchantLogoSelectedFile = null;
    this.merchantDialogOpen = false;
  }

  openCreateCategoryDialog(): void {
    if (!this.selectedMerchant) {
      return;
    }

    this.selectedCategory = null;
    this.categoryDialogMode = 'create';
    this.categoryFormName = '';
    this.categoryDialogError = '';
    this.categoryDialogOpen = true;
    this.dirtyForms.category = false;
  }

  openEditCategoryDialog(category: ProductCategory): void {
    this.selectedCategory = category;
    this.categoryDialogMode = 'edit';
    this.categoryFormName = category.name;
    this.categoryDialogError = '';
    this.categoryDialogOpen = true;
    this.dirtyForms.category = false;
  }

  closeCategoryDialog(force = false): void {
    if (!force && this.dirtyForms.category && !confirm('Close the category editor and discard unsaved changes?')) {
      return;
    }

    this.categoryDialogError = '';
    this.categoryDialogOpen = false;
    this.selectedCategory = null;
    this.categoryFormName = '';
    this.categoryDialogMode = 'create';
    this.dirtyForms.category = false;
  }

  saveCategory(): void {
    if (!this.selectedMerchant) {
      return;
    }

    const name = this.categoryFormName.trim();
    if (!name) {
      this.categoryDialogError = 'Category name is required.';
      return;
    }

    this.loading = true;
    this.categoryDialogError = '';

    const request$ = this.categoryDialogMode === 'create'
      ? this.merchantApi.createProductCategory(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, { name })
      : this.merchantApi.renameProductCategory(
          this.selectedEnvironment,
          this.apiVersion,
          this.selectedMerchant.applicationId,
          this.selectedCategory!.id,
          { name }
        );

    request$.subscribe({
      next: (category) => {
        const message = this.categoryDialogMode === 'create' ? 'Category created.' : 'Category renamed.';
        this.loading = false;
        this.categories = this.upsertCategory(this.categories, category);
        this.reconcileCategoryReferences();
        this.syncCategoryTableState();
        this.closeCategoryDialog(true);
        this.statusMessage = message;
      },
      error: (error) => {
        this.loading = false;
        this.categoryDialogError = this.toMessage(
          error,
          this.categoryDialogMode === 'create' ? 'Unable to create category.' : 'Unable to rename category.'
        );
      }
    });
  }

  removeCategory(category: ProductCategory): void {
    if (!this.selectedMerchant || !confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.merchantApi
      .deleteProductCategory(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, category.id)
      .subscribe({
        next: () => {
          this.loading = false;
          this.categories = this.categories.filter((item) => item.id !== category.id);
          this.reconcileCategoryReferences();
          this.syncCategoryTableState();
          this.statusMessage = 'Category deleted.';
          if (this.selectedCategory?.id === category.id) {
            this.closeCategoryDialog(true);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.toMessage(error, 'Unable to delete category.');
        }
      });
  }

  saveMerchant(): void {
    if (!this.selectedMerchant) {
      return;
    }
    if (
      !this.merchantForm.legalBusinessName.trim() ||
      !this.merchantForm.primaryBusinessAddress.trim() ||
      !this.merchantForm.contactFullName.trim() ||
      !this.merchantForm.contactEmail.trim() ||
      !this.merchantForm.contactPhoneNumber.trim()
    ) {
      this.merchantDialogError = 'Merchant name, address, contact name, email, and phone are required.';
      return;
    }

    const payload: UpdateMerchantRequest = {
      merchantName: this.merchantForm.merchantName.trim() || undefined,
      legalBusinessName: this.merchantForm.legalBusinessName.trim(),
      primaryBusinessAddress: this.merchantForm.primaryBusinessAddress.trim(),
      website: this.merchantForm.website.trim() || undefined,
      contactFullName: this.merchantForm.contactFullName.trim(),
      contactEmail: this.merchantForm.contactEmail.trim(),
      contactPhoneNumber: this.merchantForm.contactPhoneNumber.trim(),
      businessType: this.merchantForm.businessType.trim() || undefined,
      merchantMobility: this.merchantForm.merchantMobility.trim() || undefined,
      offerings: this.merchantForm.services.length > 0 ? [...this.merchantForm.services] : undefined,
      status: this.merchantForm.status
    };

    const merchantId = this.selectedMerchant.applicationId;
    const shouldSaveLogo =
      this.dirtyForms.logo ||
      this.merchantLogoSelectedFile !== null ||
      this.logoForm.storageKey.trim() !== (this.selectedMerchant.logoStorageKey ?? '');

    this.loading = true;
    this.merchantApi.updateMerchant(this.selectedEnvironment, this.apiVersion, merchantId, payload).subscribe({
      next: (merchant) => {
        this.selectedMerchant = merchant;
        this.merchantForm = this.merchantFormFromEntity(merchant);
        this.dirtyForms.merchant = false;

        if (!shouldSaveLogo) {
          this.loading = false;
          this.merchantDialogSuccess = 'Merchant updated.';
          return;
        }

        this.saveMerchantLogoAfterMerchantUpdate(merchantId);
      },
      error: (error) => {
        this.loading = false;
        this.merchantDialogError = this.toMessage(error, 'Unable to update merchant.');
      }
    });
  }

  saveLocation(): void {
    if (!this.selectedMerchant) {
      return;
    }

    const latitude = Number(this.locationForm.latitude);
    const longitude = Number(this.locationForm.longitude);
    const geofenceRadiusMeters = Number(this.locationForm.geofenceRadiusMeters);

    if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(geofenceRadiusMeters) || geofenceRadiusMeters <= 0) {
      this.merchantDialogError = 'Valid latitude, longitude, and positive geofence radius are required.';
      return;
    }

    this.loading = true;
    this.merchantApi
      .saveLocation(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, {
        latitude,
        longitude,
        geofenceRadiusMeters,
        googlePlaceId: this.locationForm.googlePlaceId,
        addressLine1: this.locationForm.addressLine1,
        addressLine2: this.locationForm.addressLine2,
        city: this.locationForm.city,
        postalCode: this.locationForm.postalCode,
        country: this.locationForm.country
      })
      .subscribe({
        next: (location) => {
          this.loading = false;
          this.merchantLocation = location;
          this.locationForm = this.locationFromEntity(location);
          this.dirtyForms.location = false;
          this.merchantDialogSuccess = 'Merchant location saved.';
        },
        error: (error) => {
          this.loading = false;
          this.merchantDialogError = this.toMessage(error, 'Unable to save merchant location.');
        }
      });
  }

  removeLocation(): void {
    if (!this.selectedMerchant || !confirm('Remove merchant location?')) {
      return;
    }

    this.loading = true;
    this.merchantApi.removeLocation(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId).subscribe({
      next: () => {
        this.loading = false;
        this.merchantLocation = null;
        this.locationForm = this.emptyLocationForm();
        this.dirtyForms.location = false;
        this.merchantDialogSuccess = 'Merchant location removed.';
      },
      error: (error) => {
        this.loading = false;
        this.merchantDialogError = this.toMessage(error, 'Unable to remove merchant location.');
      }
    });
  }

  selectBranch(branch: Branch): void {
    if (!this.selectedMerchant) {
      return;
    }

    const branchId = branch.branchId ?? branch.id;
    if (!branchId) {
      this.selectedBranch = this.normalizeBranch(branch);
      return;
    }

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

  openBranchDialog(branch: Branch): void {
    if (!this.selectedMerchant) {
      return;
    }

    const branchId = branch.branchId ?? branch.id;
    if (!branchId) {
      this.selectedBranch = this.normalizeBranch(branch);
      this.branchForm = this.branchFormFromEntity(this.selectedBranch);
      this.branchDialogOpen = true;
      this.dirtyForms.branch = false;
      return;
    }

    this.loading = true;
    this.merchantApi.getBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, branchId).subscribe({
      next: (detail) => this.openBranchDialogWithData(detail),
      error: (error) => {
        if (branch.active === false) {
          this.openBranchDialogWithData(branch);
          return;
        }
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Unable to load branch details.');
      }
    });
  }

  closeBranchDialog(): void {
    this.branchDialogError = '';
    this.branchDialogSuccess = '';
    this.branchDialogOpen = false;
    this.destroyLeafletMap();
  }

  saveBranch(): void {
    if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
      return;
    }
    if (!this.branchForm.name.trim()) {
      this.branchDialogError = 'Branch name is required.';
      return;
    }

    const merchantId = this.selectedMerchant.applicationId;
    const branchId = this.selectedBranch.branchId;
    const willBeActive = this.branchForm.active;

    const payload: UpdateBranchRequest = {
      name: this.branchForm.name.trim(),
      active: willBeActive,
      addressLine1: this.branchForm.addressLine1.trim() || undefined,
      addressLine2: this.branchForm.addressLine2.trim() || undefined,
      city: this.branchForm.city.trim() || undefined,
      postalCode: this.branchForm.postalCode.trim() || undefined,
      country: this.branchForm.country.trim() || undefined,
      contactFullName: this.branchForm.contactFullName.trim() || undefined,
      contactEmail: this.branchForm.contactEmail.trim() || undefined,
      contactPhoneNumber: this.branchForm.contactPhoneNumber.trim() || undefined,
      latitude: this.toOptionalNumber(this.branchForm.latitude),
      longitude: this.toOptionalNumber(this.branchForm.longitude),
      geofenceRadiusMeters: this.toOptionalNumber(this.branchForm.geofenceRadiusMeters) ?? 0,
      googlePlaceId: this.branchForm.googlePlaceId.trim() || undefined
    };

    this.loading = true;
    this.merchantApi
      .updateBranch(this.selectedEnvironment, this.apiVersion, merchantId, branchId, payload)
      .subscribe({
        next: (updatedBranch) => {
          const branch = this.normalizeBranch({ ...updatedBranch, branchId, active: willBeActive });
          this.loading = false;
          this.branches = this.branches.map((b) =>
            b.branchId === branchId ? branch : b
          );
          this.selectedBranch = branch;
          this.branchForm = this.branchFormFromEntity(branch);
          this.dirtyForms.branch = false;
          this.branchDialogSuccess = 'Branch updated.';
          this.syncBranchTableState();
          this.syncCatalogSearchSummary();
          this.loadProductsForSelectedBranch();
        },
        error: (error) => {
          this.loading = false;
          this.branchDialogError = this.toMessage(error, 'Unable to update branch.');
        }
      });
  }

  removeBranch(branch: Branch): void {
    if (!this.selectedMerchant || !branch.branchId) {
      return;
    }
    if (!confirm(`Deactivate branch "${branch.name}"?`)) {
      return;
    }

    this.loading = true;
    this.merchantApi.deleteBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, branch.branchId).subscribe({
      next: () => {
        this.loading = false;
        this.statusMessage = `Branch "${branch.name}" deactivated.`;
        this.branches = this.branches.map((b) =>
          b.branchId === branch.branchId ? { ...b, active: false } : b
        );
        this.syncBranchTableState();
        if (this.selectedBranch?.branchId === branch.branchId) {
          this.selectedBranch = null;
          this.products = [];
          this.resetProductTableStateForBranch(null);
          this.syncCatalogSearchSummary();
        }
        this.closeBranchDialog();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Unable to deactivate branch.');
      }
    });
  }

  openProduct(product: Product): void {
    if (!this.selectedMerchant) {
      return;
    }

    this.loading = true;
    this.merchantApi
      .getProduct(
        this.selectedEnvironment,
        this.apiVersion,
        this.selectedMerchant.applicationId,
        product.productId,
        product.branchId ?? undefined
      )
      .subscribe({
        next: (detail) => {
          this.openProductDialogWithData(detail);
        },
        error: (error) => {
          if (product.active === false) {
            this.statusMessage = 'Loaded inactive product from the table because the detail endpoint did not return it.';
            this.openProductDialogWithData(product);
            return;
          }
          this.loading = false;
          this.errorMessage = this.toMessage(error, 'Unable to load product details.');
        }
      });
  }

  closeProductDialog(force = false): void {
    if (!force && this.dirtyForms.editProduct && !confirm('Close the product editor and discard unsaved changes?')) {
      return;
    }

    this.productDialogError = '';
    this.productDialogSuccess = '';
    this.productDialogOpen = false;
    this.clearProductDialogPreviewUrl();
    this.productDialogImageLoadFailed = false;
    this.selectedProduct = null;
    this.productEditForm = this.emptyProductForm();
    this.dirtyForms.editProduct = false;
  }

  updateProduct(): void {
    if (!this.selectedMerchant || !this.selectedProduct) {
      return;
    }

    if (!this.productEditForm.name.trim() || !this.productEditForm.unitPrice.trim()) {
      this.productDialogError = 'Product name and unit price are required.';
      return;
    }

    const merchantId = this.selectedMerchant.applicationId;
    const productId = this.selectedProduct.productId;
    const branchId = this.selectedProduct.branchId ?? undefined;
    const wasActive = this.selectedProduct.active;
    const willBeActive = this.productEditForm.active;
    const shouldDeactivate = wasActive && !willBeActive;

    const payload = this.buildProductPayload(this.productEditForm);
    this.loading = true;
    this.merchantApi
      .updateProduct(this.selectedEnvironment, this.apiVersion, merchantId, productId, payload)
      .pipe(
        switchMap((updatedProduct) => {
          if (!shouldDeactivate) {
            return of({ ...updatedProduct, active: willBeActive });
          }
          return this.merchantApi
            .removeProduct(this.selectedEnvironment, this.apiVersion, merchantId, productId, branchId)
            .pipe(map(() => ({ ...updatedProduct, active: false })));
        })
      )
      .subscribe({
        next: (result) => {
          this.loading = false;
          this.products = this.products.map((item) =>
            item.productId === result.productId ? result : item
          );
          this.selectedProduct = result;
          this.dirtyForms.editProduct = false;
          this.syncCatalogSearchSummary();
          this.productDialogSuccess = 'Product updated.';
        },
        error: (error) => {
          this.loading = false;
          this.productDialogError = this.toMessage(error, 'Unable to update product.');
        }
      });
  }

  removeProduct(product: Product): void {
    if (!this.selectedMerchant || !confirm(`Soft-remove product "${product.name}"?`)) {
      return;
    }

    this.loading = true;
    this.merchantApi
      .removeProduct(
        this.selectedEnvironment,
        this.apiVersion,
        this.selectedMerchant.applicationId,
        product.productId,
        product.branchId ?? undefined
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.statusMessage = 'Product marked inactive.';
          this.products = this.products.map((item) =>
            item.productId === product.productId ? { ...item, active: false } : item
          );
          if (this.selectedProduct?.productId === product.productId) {
            this.selectedProduct = { ...this.selectedProduct, active: false };
          }
          this.syncCatalogSearchSummary();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.toMessage(error, 'Unable to mark product inactive.');
        }
      });
  }

  saveLogo(): void {
    if (!this.selectedMerchant) {
      return;
    }

    this.loading = true;
    this.saveMerchantLogoAfterMerchantUpdate(this.selectedMerchant.applicationId);
  }

  onProductImageError(productId: string): void {
    this.failedProductImages.add(productId);
  }

  onMerchantLogoError(): void {
    this.merchantLogoImageLoadFailed = true;
  }

  onMerchantTableLogoError(): void {
    this.merchantTableLogoFailed = true;
  }

  onMerchantLogoFileSelected(event: Event): void {
    if (!this.selectedMerchant) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    this.clearMerchantLogoPreviewUrl();
    this.merchantLogoImageLoadFailed = false;
    this.merchantLogoSelectedFile = file;
    this.merchantLogoSelectedFileName = file?.name ?? '';

    if (!file) {
      this.dirtyForms.logo = true;
      return;
    }

    this.merchantLogoPreviewUrl = URL.createObjectURL(file);
    const extension = this.fileExtension(file.name);
    this.logoForm.storageKey = `merchants/${this.selectedMerchant.applicationId}/logo.${extension}`;
    this.dirtyForms.logo = true;
  }

  onProductDialogImageError(): void {
    this.productDialogImageLoadFailed = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    this.clearProductDialogPreviewUrl();
    this.productDialogImageLoadFailed = false;

    if (file) {
      this.productDialogPreviewUrl = URL.createObjectURL(file);
    }

    this.productEditForm.imageFile = file;
    this.dirtyForms.editProduct = true;
  }

  hasService(code: string): boolean {
    return this.merchantForm.services.includes(code);
  }

  toggleService(code: string, checked: boolean): void {
    this.merchantForm.services = checked
      ? [...new Set([...this.merchantForm.services, code])]
      : this.merchantForm.services.filter(s => s !== code);
    this.dirtyForms.merchant = true;
  }

  serviceLabel(code: string): string {
    return this.serviceOptions.find(s => s.code === code)?.label ?? code;
  }

  verticalDisplayName(code: string): string {
    return this.verticals.find(v => v.code === code)?.displayName ?? code;
  }

  get productDialogImageUrl(): string | null {
    if (this.productDialogImageLoadFailed) {
      return null;
    }

    return this.productDialogPreviewUrl || this.selectedProduct?.imageUrl || null;
  }

  get merchantLogoImageUrl(): string | null {
    if (this.merchantLogoImageLoadFailed) {
      return null;
    }

    return this.merchantLogoPreviewUrl || this.selectedMerchant?.logoUrl || null;
  }

  private loadMerchantById(merchantId: string, fallbackMessage: string): void {
    if (this.selectedMerchant && !this.confirmDirty('Open another merchant and discard unsaved form edits?')) {
      return;
    }

    this.loading = true;
    this.merchantApi.getMerchant(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: (merchant) => this.selectMerchant(merchant),
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, fallbackMessage);
      }
    });
  }

  private selectMerchant(merchant: Merchant): void {
    this.viewMode = 'detail';
    this.selectedMerchant = merchant;
    this.merchantForm = this.merchantFormFromEntity(merchant);
    this.logoForm.storageKey = merchant.logoStorageKey ?? '';
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
    this.closeMerchantDialog();
    this.closeBranchDialog();
    this.closeCategoryDialog(true);
    this.closeProductDialog(true);
    this.loadPaymentAccountStatus(merchant.applicationId);
    this.loadProviderAccounts(merchant.applicationId);

    forkJoin({
      location: this.merchantApi
        .getLocation(this.selectedEnvironment, this.apiVersion, merchant.applicationId)
        .pipe(catchError(() => of(null))),
      branches: this.merchantApi
        .getBranches(this.selectedEnvironment, this.apiVersion, merchant.applicationId)
        .pipe(catchError(() => of([]))),
      categories: this.merchantApi
        .getProductCategories(this.selectedEnvironment, this.apiVersion, merchant.applicationId)
        .pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ location, branches, categories }) => {
        this.merchantLocation = location;
        this.locationForm = location ? this.locationFromEntity(location) : this.emptyLocationForm();
        this.branches = branches.map((branch) => this.normalizeBranch(branch));
        this.categories = categories;
        this.selectedBranch = this.branches[0] ?? null;
        this.products = [];
        this.categoryTableState = this.createCategoryTableState();
        this.branchTableState = this.createBranchTableState();
        this.productTableState = this.createProductTableState();
        this.syncCategoryTableState();
        this.syncBranchTableState();
        this.resetProductTableStateForBranch(this.selectedBranch?.branchId ?? null);
        this.resetDirtyForms();
        this.syncCatalogSearchSummary();
        this.statusMessage = `Loaded merchant ${merchant.applicationReference}.`;
        if (this.selectedBranch?.branchId) {
          this.loadProductsForSelectedBranch();
          return;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Merchant loaded but one or more related sections failed to load.';
      }
    });
  }

  loadPaymentAccountStatus(merchantId: string): void {
    this.merchantApi.getStripeConnectStatus(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: (data) => {
        if (data.connected && data.chargesEnabled) {
          this.paymentAccountStatus = 'connected';
        } else if (data.detailsSubmitted) {
          this.paymentAccountStatus = 'verifying';
        } else {
          this.paymentAccountStatus = 'not_connected';
        }
        this.tapToPayEnabled = data.enabledPaymentFlows?.includes('TAP_TO_PAY') ?? false;
      },
      error: () => {
        this.paymentAccountStatus = 'error';
      }
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
      next: (res) => {
        this.tapToPayEnabled = res.tapToPayEnabled;
        this.tapToPayActionLoading = false;
      },
      error: (err) => {
        this.tapToPayError = this.toMessage(err, 'Failed to update Tap to Pay setting.');
        this.tapToPayActionLoading = false;
      }
    });
  }

  handleStripeConnect(): void {
    if (!this.selectedMerchant || this.paymentAccountActionLoading) return;
    const merchantId = this.selectedMerchant.applicationId;
    const origin = window.location.origin;
    const base = `${origin}/stripe-connect/return?merchantId=${merchantId}&env=${this.selectedEnvironmentKey}&apiVersion=${this.apiVersion}`;
    const returnUrl = base;
    const refreshUrl = `${base}&refresh=true`;
    this.paymentAccountActionLoading = true;
    this.paymentAccountError = null;

    const call$ = this.paymentAccountStatus === 'verifying'
      ? this.merchantApi.refreshStripeConnect(this.selectedEnvironment, this.apiVersion, merchantId, returnUrl, refreshUrl)
      : this.merchantApi.startStripeConnect(this.selectedEnvironment, this.apiVersion, merchantId, { returnUrl, refreshUrl });

    call$.subscribe({
      next: (res) => {
        this.paymentAccountActionLoading = false;
        window.open(res.onboardingUrl, '_blank');
      },
      error: (err) => {
        this.paymentAccountActionLoading = false;
        this.paymentAccountError = this.toMessage(err, 'Failed to start Stripe Connect onboarding.');
      }
    });
  }

  loadProviderAccounts(merchantId: string): void {
    this.providerAccountsLoading = true;
    this.providerAccountsError = null;
    this.merchantApi.listProviderAccounts(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: (accounts) => {
        this.providerAccounts = accounts;
        this.providerAccountsLoading = false;
      },
      error: (err) => {
        this.providerAccountsError = this.toMessage(err, 'Failed to load provider accounts.');
        this.providerAccountsLoading = false;
      }
    });
  }

  enableProviderAccount(pspCode: string): void {
    if (!this.selectedMerchant || this.providerAccountActionLoading.has(pspCode)) return;
    this.providerAccountActionLoading.add(pspCode);
    this.merchantApi.enableProviderAccount(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, pspCode).subscribe({
      next: (account) => {
        this.providerAccounts = this.upsertProviderAccount(this.providerAccounts, account);
        this.providerAccountActionLoading.delete(pspCode);
      },
      error: (err) => {
        this.providerAccountsError = this.toMessage(err, `Failed to enable ${pspCode}.`);
        this.providerAccountActionLoading.delete(pspCode);
      }
    });
  }

  disableProviderAccount(pspCode: string): void {
    if (!this.selectedMerchant || this.providerAccountActionLoading.has(pspCode)) return;
    this.providerAccountActionLoading.add(pspCode);
    this.merchantApi.disableProviderAccount(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, pspCode).subscribe({
      next: () => {
        this.providerAccounts = this.providerAccounts.map(a => a.pspCode === pspCode ? { ...a, enabled: false } : a);
        this.providerAccountActionLoading.delete(pspCode);
      },
      error: (err) => {
        this.providerAccountsError = this.toMessage(err, `Failed to disable ${pspCode}.`);
        this.providerAccountActionLoading.delete(pspCode);
      }
    });
  }

  readonly knownPspCodes = ['STRIPE', 'PAYPAL'];

  isProviderEnabled(pspCode: string): boolean {
    return this.providerAccounts.some(a => a.pspCode === pspCode && a.enabled);
  }

  isProviderInList(pspCode: string): boolean {
    return this.providerAccounts.some(a => a.pspCode === pspCode);
  }

  get stripeEnabled(): boolean {
    return this.isProviderEnabled('STRIPE');
  }

  private upsertProviderAccount(accounts: ProviderAccountResponse[], account: ProviderAccountResponse): ProviderAccountResponse[] {
    const idx = accounts.findIndex(a => a.pspCode === account.pspCode);
    return idx === -1 ? [...accounts, account] : accounts.map((a, i) => i === idx ? account : a);
  }

  private openBranchDialogWithData(branch: Branch): void {
    this.loading = false;
    this.branchDialogError = '';
    this.branchDialogSuccess = '';
    this.selectedBranch = this.normalizeBranch(branch);
    this.branchForm = this.branchFormFromEntity(this.selectedBranch);
    this.branchDialogOpen = true;
    this.dirtyForms.branch = false;
    this.scheduleLeafletRender();
  }

  private refreshProducts(): void {
    if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
      this.products = [];
      return;
    }

    this.merchantApi
      .getProducts(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, this.selectedBranch.branchId)
      .subscribe({
      next: (products) => {
        this.loading = false;
        this.products = products;
        this.syncProductTableState();
        this.syncCatalogSearchSummary();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Unable to refresh products.');
      }
    });
  }

  private syncCatalogSearchSummary(): void {
    // summary shown as status message within the merchant detail view
    if (this.selectedMerchant) {
      this.statusMessage = `Showing ${this.branches.length} branches and ${this.products.length} products for ${this.selectedMerchant.applicationReference}.`;
    }
  }

  private loadProductsForSelectedBranch(): void {
    if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
      this.loading = false;
      this.products = [];
      this.resetProductTableStateForBranch(null);
      this.syncCatalogSearchSummary();
      return;
    }

    this.loading = true;
    this.resetProductTableStateForBranch(this.selectedBranch.branchId);
    this.merchantApi
      .getProducts(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, this.selectedBranch.branchId)
      .subscribe({
        next: (products) => {
          this.loading = false;
          this.products = products;
          this.syncProductTableState();
          this.syncCatalogSearchSummary();
        },
        error: (error) => {
          this.loading = false;
          this.products = [];
          this.syncProductTableState();
          this.errorMessage = this.toMessage(error, 'Unable to load products for the selected branch.');
        }
      });
  }

  private scheduleLeafletRender(): void {
    if (!this.branchDialogOpen) {
      return;
    }

    this.clearLeafletTimer();
    this.leafletRenderTimer = setTimeout(() => this.renderLeafletBranchMap(), 0);
  }

  private clearLeafletTimer(): void {
    if (this.leafletRenderTimer) {
      clearTimeout(this.leafletRenderTimer);
      this.leafletRenderTimer = null;
    }
  }

  private renderLeafletBranchMap(): void {
    const container = this.leafletBranchMapElement?.nativeElement;
    const latitude = this.toOptionalNumber(this.branchForm.latitude);
    const longitude = this.toOptionalNumber(this.branchForm.longitude);
    if (!container || latitude == null || longitude == null) {
      this.destroyLeafletMap();
      return;
    }

    if (!this.leafletMap) {
      this.leafletMap = L.map(container, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.leafletMap);
    }

    if (!this.leafletMarker) {
      this.leafletMarker = L.circleMarker([latitude, longitude], {
        radius: 8,
        color: '#1d4ed8',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.9
      }).addTo(this.leafletMap);
    } else {
      this.leafletMarker.setLatLng([latitude, longitude]);
    }

    const radius = this.toOptionalNumber(this.branchForm.geofenceRadiusMeters);
    if (radius != null && radius > 0) {
      if (!this.leafletCircle) {
        this.leafletCircle = L.circle([latitude, longitude], {
          radius,
          color: '#1d4ed8',
          weight: 3,
          fillColor: '#60a5fa',
          fillOpacity: 0.22
        }).addTo(this.leafletMap);
      } else {
        this.leafletCircle.setLatLng([latitude, longitude]);
        this.leafletCircle.setRadius(radius);
      }
      this.leafletMap.fitBounds(this.leafletCircle.getBounds(), { padding: [24, 24] });
    } else if (this.leafletCircle) {
      this.leafletCircle.remove();
      this.leafletCircle = null;
    }

    if (radius == null || radius <= 0) {
      this.leafletMap.setView([latitude, longitude], 16);
    }

    setTimeout(() => this.leafletMap?.invalidateSize(), 0);
  }

  private destroyLeafletMap(): void {
    this.clearLeafletTimer();
    if (this.leafletCircle) {
      this.leafletCircle.remove();
      this.leafletCircle = null;
    }
    if (this.leafletMarker) {
      this.leafletMarker.remove();
      this.leafletMarker = null;
    }
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
  }

  private openProductDialogWithData(product: Product): void {
    this.loading = false;
    this.productDialogError = '';
    this.productDialogSuccess = '';
    this.clearProductDialogPreviewUrl();
    this.productDialogImageLoadFailed = false;
    this.selectedProduct = product;
    this.productEditForm = {
      name: product.name,
      active: product.active,
      unitPrice: String(product.unitPrice),
      branchId: product.branchId ?? '',
      categoryId: product.categoryId ?? '',
      productCode: product.productCode != null ? String(product.productCode) : '',
      description: product.description ?? '',
      imageFile: null
    };
    this.productDialogOpen = true;
    this.dirtyForms.editProduct = false;
  }

  private syncBranchTableState(): void {
    const filteredRows = filterRowsByFields(this.branches, this.branchTableState.filter.query, (branch) => [
      branch.name,
      branch.country,
      branch.city,
      branch.postalCode
    ]);
    const sortedRows = sortRows(filteredRows, this.branchTableState.sort, (branch, field) => {
      if (field === 'status') {
        return this.branchStatusLabel(branch);
      }

      return branch[field];
    });
    const page = paginateRows(sortedRows, this.branchTableState.pagination);
    this.branchTableState.pagination.totalRecords = page.totalRecords;
    this.branchTableState.pagination.first = page.normalizedFirst;
    this.branchTableState.visibleRows = page.pageRows;
    this.branchTableState.emptyStateKind = this.branches.length === 0 ? 'no-data' : (page.totalRecords === 0 ? 'no-filter-results' : 'no-data');
  }

  private syncCategoryTableState(): void {
    const filteredRows = filterRowsByFields(this.categories, this.categoryTableState.filter.query, (category) => [
      category.name
    ]);
    const sortedRows = sortRows(filteredRows, this.categoryTableState.sort, (category, field) => category[field]);
    const page = paginateRows(sortedRows, this.categoryTableState.pagination);
    this.categoryTableState.pagination.totalRecords = page.totalRecords;
    this.categoryTableState.pagination.first = page.normalizedFirst;
    this.categoryTableState.visibleRows = page.pageRows;
    this.categoryTableState.emptyStateKind = this.categories.length === 0 ? 'no-data' : (page.totalRecords === 0 ? 'no-filter-results' : 'no-data');
  }

  private syncProductTableState(): void {
    const filteredRows = filterRowsByFields(this.products, this.productTableState.filter.query, (product) => [
      product.productCode,
      product.categoryName,
      product.name
    ]);
    const sortedRows = sortRows(filteredRows, this.productTableState.sort, (product, field) => {
      if (field === 'status') {
        return this.productStatusLabel(product);
      }

      return product[field];
    });
    const page = paginateRows(sortedRows, this.productTableState.pagination);
    this.productTableState.pagination.totalRecords = page.totalRecords;
    this.productTableState.pagination.first = page.normalizedFirst;
    this.productTableState.visibleRows = page.pageRows;
    this.productTableState.branchId = this.selectedBranch?.branchId ?? null;

    if (!this.selectedBranch?.branchId) {
      this.productTableState.emptyStateKind = 'no-branch-selected';
      return;
    }

    this.productTableState.emptyStateKind = this.products.length === 0 ? 'no-data' : (page.totalRecords === 0 ? 'no-filter-results' : 'no-data');
  }

  private resetProductTableStateForBranch(branchId: string | null): void {
    this.productTableState = this.createProductTableState(branchId);
    this.syncProductTableState();
  }

  private createBranchTableState(): BranchTableState {
    return {
      filter: { query: '' },
      sort: {
        field: null,
        direction: null
      },
      pagination: {
        first: 0,
        rows: 5,
        rowsPerPageOptions: [5, 10, 20],
        totalRecords: 0
      },
      visibleRows: [],
      emptyStateKind: 'no-data'
    };
  }

  private createCategoryTableState(): CategoryTableState {
    return {
      filter: { query: '' },
      sort: {
        field: null,
        direction: null
      },
      pagination: {
        first: 0,
        rows: 5,
        rowsPerPageOptions: [5, 10, 20],
        totalRecords: 0
      },
      visibleRows: [],
      emptyStateKind: 'no-data'
    };
  }

  private createProductTableState(branchId: string | null = null): ProductTableState {
    return {
      branchId,
      filter: { query: '' },
      sort: {
        field: null,
        direction: null
      },
      pagination: {
        first: 0,
        rows: 5,
        rowsPerPageOptions: [5, 10, 20],
        totalRecords: 0
      },
      visibleRows: [],
      emptyStateKind: branchId ? 'no-data' : 'no-branch-selected'
    };
  }

  private emptyLocationForm(): LocationFormModel {
    return {
      latitude: '',
      longitude: '',
      geofenceRadiusMeters: '',
      googlePlaceId: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: ''
    };
  }

  private emptyBranchForm(): BranchFormModel {
    return {
      name: '',
      active: true,
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: '',
      contactFullName: '',
      contactEmail: '',
      contactPhoneNumber: '',
      latitude: '',
      longitude: '',
      geofenceRadiusMeters: '',
      googlePlaceId: ''
    };
  }

  private emptyProductForm(): ProductFormModel {
    return {
      name: '',
      active: true,
      unitPrice: '',
      branchId: '',
      categoryId: '',
      productCode: '',
      description: '',
      imageFile: null
    };
  }

  private emptyMerchantForm(): MerchantFormModel {
    return {
      merchantName: '',
      legalBusinessName: '',
      primaryBusinessAddress: '',
      website: '',
      contactFullName: '',
      contactEmail: '',
      contactPhoneNumber: '',
      businessType: '',
      merchantMobility: 'BRICK_AND_MORTAR',
      services: [],
      status: 'DRAFT'
    };
  }

  private locationFromEntity(location: MerchantLocation): LocationFormModel {
    return {
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      geofenceRadiusMeters: String(location.geofenceRadiusMeters),
      googlePlaceId: location.googlePlaceId ?? '',
      addressLine1: location.addressLine1 ?? '',
      addressLine2: location.addressLine2 ?? '',
      city: location.city ?? '',
      postalCode: location.postalCode ?? '',
      country: location.country ?? ''
    };
  }

  private merchantFormFromEntity(merchant: Merchant): MerchantFormModel {
    return {
      merchantName: merchant.merchantName ?? '',
      legalBusinessName: merchant.legalBusinessName ?? '',
      primaryBusinessAddress: merchant.primaryBusinessAddress ?? '',
      website: merchant.website ?? '',
      contactFullName: merchant.contactFullName ?? '',
      contactEmail: merchant.contactEmail ?? '',
      contactPhoneNumber: merchant.contactPhoneNumber ?? '',
      businessType: merchant.businessType ?? '',
      merchantMobility: merchant.merchantMobility ?? 'BRICK_AND_MORTAR',
      services: (merchant.offerings ?? []).filter(o => this.serviceCodes.has(o)),
      status: merchant.status
    };
  }

  private branchFormFromEntity(branch: Branch): BranchFormModel {
    return {
      name: branch.name ?? '',
      active: branch.active ?? true,
      addressLine1: branch.addressLine1 ?? '',
      addressLine2: branch.addressLine2 ?? '',
      city: branch.city ?? '',
      postalCode: branch.postalCode ?? '',
      country: branch.country ?? '',
      contactFullName: branch.contactFullName ?? '',
      contactEmail: branch.contactEmail ?? '',
      contactPhoneNumber: branch.contactPhoneNumber ?? '',
      latitude: branch.latitude != null ? String(branch.latitude) : '',
      longitude: branch.longitude != null ? String(branch.longitude) : '',
      geofenceRadiusMeters: String(branch.geofenceRadiusMeters ?? 0),
      googlePlaceId: branch.googlePlaceId ?? ''
    };
  }

  getBranchNameForProduct(product: Product): string {
    if (!product.branchId) return 'Merchant-level product';
    const branch = this.branches.find(b => (b.branchId ?? b.id) === product.branchId);
    return branch ? branch.name : 'Merchant-level product';
  }

  private normalizeBranch(branch: Branch): Branch {
    return {
      ...branch,
      branchId: branch.branchId ?? branch.id
    };
  }

  private upsertCategory(categories: ProductCategory[], category: ProductCategory): ProductCategory[] {
    const existingIndex = categories.findIndex((item) => item.id === category.id);
    if (existingIndex === -1) {
      return [...categories, category];
    }

    return categories.map((item) => item.id === category.id ? category : item);
  }

  private reconcileCategoryReferences(): void {
    const activeCategoryIds = new Set(this.categories.map((category) => category.id));

    if (this.productEditForm.categoryId && !activeCategoryIds.has(this.productEditForm.categoryId)) {
      this.productEditForm.categoryId = '';
    }

    if (this.selectedProduct?.categoryId && !activeCategoryIds.has(this.selectedProduct.categoryId)) {
      this.selectedProduct = {
        ...this.selectedProduct,
        categoryId: null,
        categoryName: null
      };
    }
  }

  private toOptionalNumber(value: string): number | undefined {
    const parsed = value.trim() ? Number(value) : undefined;
    return parsed === undefined || Number.isNaN(parsed) ? undefined : parsed;
  }

  private buildProductPayload(form: ProductFormModel): FormData {
    const payload = new FormData();
    payload.set('name', form.name.trim());
    payload.set('unitPrice', form.unitPrice.trim());
    payload.set('active', String(form.active));

    if (form.branchId.trim()) {
      payload.set('branchId', form.branchId.trim());
    }

    if (form.categoryId.trim()) {
      payload.set('categoryId', form.categoryId.trim());
    }

    if (form.productCode.trim()) {
      payload.set('productCode', form.productCode.trim());
    }

    if (form.description.trim()) {
      payload.set('description', form.description.trim());
    }

    if (form.imageFile) {
      payload.set('image', form.imageFile);
    }

    return payload;
  }

  private saveMerchantLogoAfterMerchantUpdate(merchantId: string): void {
    const storageKey = this.logoForm.storageKey.trim();

    if (this.merchantLogoSelectedFile) {
      this.merchantApi
        .createLogoUploadUrl(
          this.selectedEnvironment,
          this.apiVersion,
          merchantId,
          this.merchantLogoSelectedFile.type || 'application/octet-stream'
        )
        .pipe(
          switchMap((uploadTarget) => {
            this.logoForm.storageKey = uploadTarget.storageKey;
            return this.merchantApi.uploadMerchantLogo(uploadTarget.uploadUrl, this.merchantLogoSelectedFile!).pipe(
              switchMap(() =>
                this.merchantApi.updateLogo(this.selectedEnvironment, this.apiVersion, merchantId, {
                  storageKey: uploadTarget.storageKey
                })
              )
            );
          })
        )
        .subscribe({
          next: (merchant) => {
            this.loading = false;
            this.applySavedMerchantLogo(merchant);
            this.merchantDialogSuccess = 'Merchant and logo updated.';
          },
          error: (error) => {
            this.loading = false;
            this.merchantDialogError = this.toMessage(error, 'Merchant details were saved, but the logo upload failed.');
          }
        });
      return;
    }

    if (!storageKey) {
      this.loading = false;
      this.merchantDialogError = 'Merchant details were saved, but logo storage key is required to save the logo.';
      return;
    }

    this.merchantApi
      .updateLogo(this.selectedEnvironment, this.apiVersion, merchantId, {
        storageKey
      })
      .subscribe({
        next: (merchant) => {
          this.loading = false;
          this.applySavedMerchantLogo(merchant);
          this.merchantDialogSuccess = 'Merchant and logo updated.';
        },
        error: (error) => {
          this.loading = false;
          this.merchantDialogError = this.toMessage(error, 'Merchant details were saved, but the logo update failed.');
        }
      });
  }

  private applySavedMerchantLogo(merchant: Merchant): void {
    this.selectedMerchant = {
      ...this.selectedMerchant,
      ...merchant
    };
    this.clearMerchantLogoPreviewUrl();
    this.merchantLogoImageLoadFailed = false;
    this.merchantLogoSelectedFileName = '';
    this.merchantLogoSelectedFile = null;
    this.logoForm.storageKey = merchant.logoStorageKey ?? '';
    this.dirtyForms.logo = false;
  }

  private clearProductDialogPreviewUrl(): void {
    if (this.productDialogPreviewUrl) {
      URL.revokeObjectURL(this.productDialogPreviewUrl);
      this.productDialogPreviewUrl = null;
    }
  }

  private clearMerchantLogoPreviewUrl(): void {
    if (this.merchantLogoPreviewUrl) {
      URL.revokeObjectURL(this.merchantLogoPreviewUrl);
      this.merchantLogoPreviewUrl = null;
    }
  }

  private fileExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.trim().toLowerCase();
    return extension || 'png';
  }

  private resetDirtyForms(): void {
    this.dirtyForms = {
      location: false,
      merchant: false,
      branch: false,
      editProduct: false,
      logo: false,
      category: false
    };
  }

  private confirmDirty(message: string): boolean {
    return !this.hasUnsavedChanges || confirm(message);
  }

  private toMessage(error: unknown, fallback: string): string {
    const body = (error as { error?: { detail?: string; message?: string } })?.error;
    return body?.detail || body?.message || fallback;
  }
}
