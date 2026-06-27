export type EnvironmentKey = 'local' | 'k8s-staging' | 'aws-staging';
export type CatalogSearchMode = 'merchantId' | 'branchId' | 'productId' | 'productName';

export interface BackendEnvironment {
  key: EnvironmentKey;
  label: string;
  baseUrl: string;
  storefrontUrl: string;
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
  defaultVatPercent?: number | null;
}

export type AppearanceHistoryStatus = 'COMPLETED' | 'CANCELLED';
export type OperationalAppearanceStatus = 'ACTIVE' | 'UPCOMING';

export interface OperationalAppearanceItem {
  id: string;
  branchId: string;
  branchName: string;
  merchantId: string;
  name: string;
  declaredLatitude: number;
  declaredLongitude: number;
  effectiveLatitude: number;
  effectiveLongitude: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  cancelledAt?: string | null;
  status: OperationalAppearanceStatus;
}

export interface AppearanceHistoryItem {
  id: string;
  branchId: string;
  branchName: string;
  merchantId: string;
  name: string;
  declaredLatitude: number;
  declaredLongitude: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  cancelledAt?: string | null;
  status: AppearanceHistoryStatus;
}

export interface AppearanceHistoryPage {
  content: AppearanceHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
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
  defaultVatPercent?: number | null;
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
  defaultVatPercent: string;
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

export type ConnectPaymentFlow = 'CARD' | 'PAY_BY_BANK' | 'TAP_TO_PAY';

export interface StripeConnectStatusResponse {
  connected: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  enabledPaymentFlows?: ConnectPaymentFlow[];
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

export type AppointmentStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED';
export type AppointmentContactType = 'SHOPPER_OWNED' | 'MERCHANT_CAPTURED';

export interface AppointmentResponse {
  id: string;
  merchantId: string;
  branchId: string;
  productId: string;
  productName: string;
  productCategoryId: string;
  employeeId: string | null;
  employeeName: string | null;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  contactType: AppointmentContactType;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  shopperAccountId: string | null;
  note: string | null;
  cancelledReason: string | null;
}

export interface MerchantBookAppointmentRequest {
  branchId: string;
  productId: string;
  productCategoryId: string;
  startTime: string;
  employeeId?: string | null;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  note?: string | null;
}

export interface RescheduleAppointmentRequest {
  newProductId: string;
  newProductCategoryId: string;
  newStartTime: string;
  newEmployeeId?: string | null;
}

export interface SupportOverrideAppointmentRequest {
  newProductId: string;
  newProductCategoryId: string;
  newStartTime: string;
  newEmployeeId?: string | null;
  reason: string;
}

export interface AppointmentFormModel {
  branchId: string;
  productId: string;
  productCategoryId: string;
  startTime: string;
  employeeId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  note: string;
}

export interface RescheduleFormModel {
  newProductId: string;
  newProductCategoryId: string;
  newStartTime: string;
  newEmployeeId: string;
}

export interface OverrideFormModel {
  newProductId: string;
  newProductCategoryId: string;
  newStartTime: string;
  newEmployeeId: string;
  reason: string;
}

export interface UpdateAppointmentNoteRequest {
  note?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface AppointmentPolicy {
  merchantId: string;
  bookingIntervalMinutes: number;
  leadTimeMinutes: number;
  bookingHorizonDays: number;
  reminderLeadTimeMinutes: number;
  updatedAt: string;
}

export interface UpdateAppointmentPolicyRequest {
  bookingIntervalMinutes: number;
  leadTimeMinutes: number;
  bookingHorizonDays: number;
  reminderLeadTimeMinutes: number;
}

export interface AppointmentPolicyFormModel {
  bookingIntervalMinutes: string;
  leadTimeMinutes: string;
  bookingHorizonDays: string;
  reminderLeadTimeMinutes: string;
}

export interface NoteEditFormModel {
  note: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderType = 'WALK_IN_ORDERING' | 'PRE_ORDER';
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export interface OrderItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  merchantId: string;
  branchId: string;
  branchName?: string | null;
  orderType: OrderType;
  status: OrderStatus;
  usesDeferredPayment: boolean;
  targetShopperId?: string | null;
  targetShopperName?: string | null;
  dueDate?: string | null;
  qrCode?: string | null;
  items: OrderItemResponse[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  merchantId: string;
  branchId: string;
  orderType: OrderType;
  usesDeferredPayment?: boolean;
  targetShopperId?: string;
  dueDate?: string;
  items: CreateOrderItemRequest[];
}

export interface BranchCustomer {
  shopperAccountId: string;
  name: string;
}

export interface ShopperSearchResult {
  shopperAccountId: string;
  name: string;
}

export interface OrderItemFormModel {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}
