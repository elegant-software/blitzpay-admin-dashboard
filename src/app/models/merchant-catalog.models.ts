export type EnvironmentKey = 'local' | 'staging';
export type CatalogSearchMode = 'merchantId' | 'branchId' | 'productId' | 'productName';

export interface BackendEnvironment {
  key: EnvironmentKey;
  label: string;
  baseUrl: string;
}

export interface Merchant {
  applicationId: string;
  applicationReference: string;
  merchantCode: string;
  merchantName: string;
  registrationNumber: string;
  businessType?: string | null;
  merchantMobility?: string | null;
  operatingCountry?: string | null;
  legalBusinessName?: string | null;
  primaryBusinessAddress?: string | null;
  website?: string | null;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhoneNumber?: string | null;
  offerings: string[];
  status: string;
  submittedAt?: string | null;
  lastUpdatedAt: string;
  logoStorageKey?: string | null;
  logoUrl?: string | null;
}

export interface MerchantLocation {
  merchantId: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  googlePlaceId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  placeFormattedAddress?: string | null;
  placeRating?: number | null;
  placeReviewCount?: number | null;
  placeEnrichmentStatus?: string | null;
  placeEnrichedAt?: string | null;
}

export interface NearbyMerchantResult {
  merchantId: string;
  legalBusinessName: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  googlePlaceId?: string | null;
  distanceMeters: number;
}

export interface Branch {
  id?: string;
  branchId?: string;
  merchantId: string;
  branchCode: string;
  name: string;
  active?: boolean | null;
  status: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  website?: string | null;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhoneNumber?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number | null;
  googlePlaceId?: string | null;
  placeFormattedAddress?: string | null;
  placeRating?: number | null;
  placeReviewCount?: number | null;
  placeEnrichmentStatus?: string | null;
  placeEnrichedAt?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryRequest {
  name: string;
}

export interface RenameProductCategoryRequest {
  name: string;
}

export interface Product {
  productId: string;
  merchantId: string;
  branchId?: string | null;
  name: string;
  description?: string | null;
  unitPrice: number;
  imageUrl?: string | null;
  active: boolean;
  status: string;
  categoryId?: string | null;
  categoryName?: string | null;
  productCode?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  merchantId: string;
  products: Product[];
}

export interface ProductBranchGroup {
  branchId: string | null;
  branchLabel: string;
  branch: Branch | null;
  products: Product[];
}

export interface UpdateMerchantLocationRequest {
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  googlePlaceId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateBranchRequest {
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  contactFullName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  googlePlaceId?: string;
}

export interface UpdateMerchantRequest {
  merchantName?: string;
  legalBusinessName: string;
  primaryBusinessAddress: string;
  website?: string;
  contactFullName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  offerings?: string[];
  status?: string;
  businessType?: string;
  merchantMobility?: string;
}

export interface UpdateBranchRequest {
  name: string;
  active: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  contactFullName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  googlePlaceId?: string;
}

export interface UpdateMerchantLogoRequest {
  storageKey: string;
}

export interface MerchantLogoUploadRequest {
  contentType: string;
}

export interface MerchantVerticalResponse {
  code: string;
  displayName: string;
}

export interface MerchantLogoUploadResponse {
  storageKey: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface ImageAssetReference {
  kind: 'merchant-logo' | 'product-image';
  storageKey?: string;
  file?: File | null;
  imageUrl?: string | null;
  previewState: 'available' | 'unavailable' | 'loading' | 'failed';
}

export interface LocationFormModel {
  latitude: string;
  longitude: string;
  geofenceRadiusMeters: string;
  googlePlaceId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface BranchFormModel {
  name: string;
  active: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  contactFullName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  latitude: string;
  longitude: string;
  geofenceRadiusMeters: string;
  googlePlaceId: string;
}

export interface MerchantFormModel {
  merchantName: string;
  legalBusinessName: string;
  primaryBusinessAddress: string;
  website: string;
  contactFullName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  businessType: string;
  merchantMobility: string;
  services: string[];
  status: string;
}

export interface ProductFormModel {
  name: string;
  active: boolean;
  unitPrice: string;
  branchId: string;
  categoryId: string;
  productCode: string;
  description: string;
  imageFile: File | null;
}

export interface LogoFormModel {
  storageKey: string;
}

export interface TableFilterState {
  query: string;
}

export type TableSortDirection = 'asc' | 'desc';

export interface TableSortState<TField extends string = string> {
  field: TField | null;
  direction: TableSortDirection | null;
}

export interface TablePaginationState {
  first: number;
  rows: number;
  rowsPerPageOptions: number[];
  totalRecords: number;
}

export type BranchSortField = 'name' | 'status';

export interface BranchTableState {
  filter: TableFilterState;
  sort: TableSortState<BranchSortField>;
  pagination: TablePaginationState;
  visibleRows: Branch[];
  emptyStateKind: 'no-data' | 'no-filter-results';
}

export type CategorySortField = 'name';

export interface CategoryTableState {
  filter: TableFilterState;
  sort: TableSortState<CategorySortField>;
  pagination: TablePaginationState;
  visibleRows: ProductCategory[];
  emptyStateKind: 'no-data' | 'no-filter-results';
}

export type ProductSortField = 'name' | 'productCode' | 'categoryName' | 'status';

export interface ProductTableState {
  branchId: string | null;
  filter: TableFilterState;
  sort: TableSortState<ProductSortField>;
  pagination: TablePaginationState;
  visibleRows: Product[];
  emptyStateKind: 'no-branch-selected' | 'no-data' | 'no-filter-results';
}

export interface StripeConnectStatusResponse {
  connected: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
}

export type PaymentAccountStatus = 'loading' | 'not_connected' | 'verifying' | 'connected' | 'error';

export interface StartStripeConnectRequest {
  returnUrl: string;
  refreshUrl: string;
}

export interface MerchantSearchRequest {
  q?: string;
  businessTypes?: string[];
  merchantMobilities?: string[];
  statuses?: string[];
  page?: number;
  size?: number;
}

export interface MerchantSearchResultItem {
  applicationId: string;
  merchantName: string;
  legalBusinessName: string;
  merchantCode: string;
  city: string | null;
  country: string | null;
  businessType: string;
  merchantMobility: string;
  status: string;
  lastUpdatedAt: string;
}

export interface MerchantSearchResponse {
  results: MerchantSearchResultItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ProviderAccountResponse {
  id: string;
  pspCode: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdyenConnectStatusResponse {
  legalEntityId: string | null;
  balanceAccountId: string | null;
  receivePaymentsEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface StartAdyenOnboardingRequest {
  returnUrl: string;
  redirectUrl: string;
}
