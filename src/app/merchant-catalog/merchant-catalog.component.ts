import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import * as L from 'leaflet';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  Branch,
  BranchSortField,
  BranchTableState,
  BranchFormModel,
  LogoFormModel,
  LocationFormModel,
  Merchant,
  MerchantFormModel,
  MerchantLocation,
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

@Component({
  selector: 'app-merchant-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe, InputTextModule, PaginatorModule],
  templateUrl: './merchant-catalog.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class MerchantCatalogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('leafletBranchMap') private leafletBranchMapElement?: ElementRef<HTMLDivElement>;

  selectedEnvironmentKey: 'local' | 'staging' = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  catalogSearchTerm = '';
  catalogSearchSummary = '';

  selectedMerchant: Merchant | null = null;
  merchantLocation: MerchantLocation | null = null;
  branches: Branch[] = [];
  categories: ProductCategory[] = [];
  selectedBranch: Branch | null = null;
  products: Product[] = [];
  branchTableState: BranchTableState = this.createBranchTableState();
  productTableState: ProductTableState = this.createProductTableState();

  selectedProduct: Product | null = null;
  productDialogOpen = false;
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

  statusMessage = '';
  errorMessage = '';
  loading = false;

  dirtyForms = {
    location: false,
    merchant: false,
    branch: false,
    editProduct: false,
    logo: false
  };

  readonly paymentChannelOptions = ['PAYPAL', 'STRIPE', 'TRUELAYER'];
  readonly branchFilterHint = 'Filter by branch name, country, city, or zipcode.';
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

  private leafletMap: L.Map | null = null;
  private leafletMarker: L.CircleMarker | null = null;
  private leafletCircle: L.Circle | null = null;
  private leafletRenderTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly merchantApi: MerchantApiService
  ) {}

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

  get activeSearchHint(): string {
    return 'Search by merchant ID.';
  }

  get hasLocalCatalogQuery(): boolean {
    return false;
  }

  get visibleBranchRows(): Branch[] {
    return this.branchTableState.visibleRows;
  }

  get visibleProductRows(): Product[] {
    return this.productTableState.visibleRows;
  }

  get branchVisibleCount(): number {
    return this.branchTableState.pagination.totalRecords;
  }

  get productVisibleCount(): number {
    return this.productTableState.pagination.totalRecords;
  }

  get branchFilterActive(): boolean {
    return hasActiveQuery(this.branchTableState.filter.query);
  }

  get productFilterActive(): boolean {
    return hasActiveQuery(this.productTableState.filter.query);
  }

  get branchPaginatorVisible(): boolean {
    return this.branchVisibleCount > this.branchTableState.pagination.rows;
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

  hasChannel(selected: string[], channel: string): boolean {
    return selected.includes(channel);
  }

  toggleMerchantChannel(channel: string, checked: boolean): void {
    this.merchantForm.activePaymentChannels = checked
      ? [...new Set([...this.merchantForm.activePaymentChannels, channel])]
      : this.merchantForm.activePaymentChannels.filter((value) => value !== channel);
    this.dirtyForms.merchant = true;
  }

  toggleBranchChannel(channel: string, checked: boolean): void {
    this.branchForm.activePaymentChannels = checked
      ? [...new Set([...this.branchForm.activePaymentChannels, channel])]
      : this.branchForm.activePaymentChannels.filter((value) => value !== channel);
    this.dirtyForms.branch = true;
  }

  onBranchFilterChange(): void {
    this.branchTableState.pagination.first = 0;
    this.syncBranchTableState();
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

  runCatalogSearch(): void {
    this.errorMessage = '';
    this.statusMessage = '';

    const searchTerm = this.catalogSearchTerm.trim();
    if (!searchTerm) {
      this.errorMessage = 'Enter a search value before searching.';
      return;
    }

    this.loadMerchantById(searchTerm, 'Unable to find merchant by ID.');
  }

  clearCatalogSearch(): void {
    this.catalogSearchTerm = '';
    this.catalogSearchSummary = '';
    this.errorMessage = '';
    this.statusMessage = '';
    this.selectedMerchant = null;
    this.merchantLocation = null;
    this.branches = [];
    this.categories = [];
    this.products = [];
    this.selectedBranch = null;
    this.branchTableState = this.createBranchTableState();
    this.productTableState = this.createProductTableState();
    this.merchantForm = this.emptyMerchantForm();
    this.branchForm = this.emptyBranchForm();
    this.closeMerchantDialog();
    this.closeBranchDialog();
    this.closeProductDialog(true);
  }

  openMerchantDialog(): void {
    if (!this.selectedMerchant) {
      return;
    }
    this.clearMerchantLogoPreviewUrl();
    this.merchantLogoImageLoadFailed = false;
    this.merchantLogoSelectedFileName = '';
    this.merchantLogoSelectedFile = null;
    this.merchantForm = this.merchantFormFromEntity(this.selectedMerchant);
    this.logoForm.storageKey = this.selectedMerchant.logoStorageKey ?? '';
    this.merchantDialogOpen = true;
    this.dirtyForms.merchant = false;
    this.dirtyForms.logo = false;
  }

  closeMerchantDialog(): void {
    this.clearMerchantLogoPreviewUrl();
    this.merchantLogoImageLoadFailed = false;
    this.merchantLogoSelectedFileName = '';
    this.merchantLogoSelectedFile = null;
    this.merchantDialogOpen = false;
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
      this.errorMessage = 'Merchant name, address, contact name, email, and phone are required.';
      return;
    }

    const payload: UpdateMerchantRequest = {
      legalBusinessName: this.merchantForm.legalBusinessName.trim(),
      primaryBusinessAddress: this.merchantForm.primaryBusinessAddress.trim(),
      contactFullName: this.merchantForm.contactFullName.trim(),
      contactEmail: this.merchantForm.contactEmail.trim(),
      contactPhoneNumber: this.merchantForm.contactPhoneNumber.trim(),
      activePaymentChannels: [...this.merchantForm.activePaymentChannels],
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
          this.statusMessage = 'Merchant updated.';
          this.closeMerchantDialog();
          return;
        }

        this.saveMerchantLogoAfterMerchantUpdate(merchantId);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Unable to update merchant.');
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
      this.errorMessage = 'Valid latitude, longitude, and positive geofence radius are required.';
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
          this.statusMessage = 'Merchant location saved.';
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.toMessage(error, 'Unable to save merchant location.');
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
        this.statusMessage = 'Merchant location removed.';
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Unable to remove merchant location.');
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
    this.branchDialogOpen = false;
    this.destroyLeafletMap();
  }

  saveBranch(): void {
    if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
      return;
    }
    if (!this.branchForm.name.trim()) {
      this.errorMessage = 'Branch name is required.';
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
      activePaymentChannels: [...this.branchForm.activePaymentChannels],
      latitude: this.toOptionalNumber(this.branchForm.latitude),
      longitude: this.toOptionalNumber(this.branchForm.longitude),
      geofenceRadiusMeters: this.toOptionalNumber(this.branchForm.geofenceRadiusMeters),
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
          this.statusMessage = 'Branch updated.';
          this.closeBranchDialog();
          this.syncBranchTableState();
          this.syncCatalogSearchSummary();
          this.loadProductsForSelectedBranch();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.toMessage(error, 'Unable to update branch.');
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
      this.errorMessage = 'Product name and unit price are required.';
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
          this.products = this.products.map((item) =>
            item.productId === result.productId ? result : item
          );
          this.selectedProduct = result;
          this.syncCatalogSearchSummary();
          this.statusMessage = 'Product updated.';
          this.closeProductDialog(true);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.toMessage(error, 'Unable to update product.');
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
    this.selectedMerchant = merchant;
    this.merchantForm = this.merchantFormFromEntity(merchant);
    this.logoForm.storageKey = merchant.logoStorageKey ?? '';
    this.selectedBranch = null;
    this.merchantTableLogoFailed = false;
    this.failedProductImages.clear();
    this.closeMerchantDialog();
    this.closeBranchDialog();
    this.closeProductDialog(true);

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
        this.branchTableState = this.createBranchTableState();
        this.productTableState = this.createProductTableState();
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

  private openBranchDialogWithData(branch: Branch): void {
    this.loading = false;
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
    if (!this.selectedMerchant) {
      this.catalogSearchSummary = '';
      return;
    }

    this.catalogSearchSummary = `Showing ${this.branches.length} branches and ${this.products.length} products for ${this.selectedMerchant.applicationReference}.`;
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
      activePaymentChannels: [],
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
      legalBusinessName: '',
      primaryBusinessAddress: '',
      contactFullName: '',
      contactEmail: '',
      contactPhoneNumber: '',
      activePaymentChannels: [],
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
      legalBusinessName: merchant.legalBusinessName ?? '',
      primaryBusinessAddress: merchant.primaryBusinessAddress ?? '',
      contactFullName: merchant.contactFullName ?? '',
      contactEmail: merchant.contactEmail ?? '',
      contactPhoneNumber: merchant.contactPhoneNumber ?? '',
      activePaymentChannels: [...(merchant.activePaymentChannels ?? [])],
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
      activePaymentChannels: [...(branch.activePaymentChannels ?? [])],
      latitude: branch.latitude != null ? String(branch.latitude) : '',
      longitude: branch.longitude != null ? String(branch.longitude) : '',
      geofenceRadiusMeters: branch.geofenceRadiusMeters != null ? String(branch.geofenceRadiusMeters) : '',
      googlePlaceId: branch.googlePlaceId ?? ''
    };
  }

  private normalizeBranch(branch: Branch): Branch {
    return {
      ...branch,
      branchId: branch.branchId ?? branch.id
    };
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
            this.statusMessage = 'Merchant and logo updated.';
            this.closeMerchantDialog();
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = this.toMessage(error, 'Merchant details were saved, but the logo upload failed.');
          }
        });
      return;
    }

    if (!storageKey) {
      this.loading = false;
      this.errorMessage = 'Merchant details were saved, but logo storage key is required to save the logo.';
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
          this.statusMessage = 'Merchant and logo updated.';
          this.closeMerchantDialog();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.toMessage(error, 'Merchant details were saved, but the logo update failed.');
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
      logo: false
    };
  }

  private confirmDirty(message: string): boolean {
    return !this.hasUnsavedChanges || confirm(message);
  }

  private toMessage(error: unknown, fallback: string): string {
    const maybeMessage = (error as { error?: { message?: string } })?.error?.message;
    return maybeMessage || fallback;
  }
}
