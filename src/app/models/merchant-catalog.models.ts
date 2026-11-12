export type EnvironmentKey = 'local' | 'k8s-staging' | 'aws-staging';
export type CatalogSearchMode = 'merchantId' | 'branchId' | 'productId' | 'productName';

export interface BackendEnvironment {
  key: EnvironmentKey;
  label: string;
  baseUrl: string;
  storefrontUrl: string;
}

export interface MerchantContactInfo {
  website?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  xHandle?: string | null;
  instagramHandle?: string | null;
}

export interface Merchant {
  merchantId: string;
  merchantCode: string;
  merchantName: string;
  merchantStatus: string;
  businessType?: string | null;
  merchantMobility?: string | null;
  storefrontTheme?: string | null;
  operatingCountry?: string | null;
  website?: string | null;
  offerings: string[];
  lastUpdatedAt: string;
  logoStorageKey?: string | null;
  logoUrl?: string | null;
  defaultVatPercent?: number | null;
  contactInfo?: MerchantContactInfo | null;
  originalMenuLanguage?: string | null;
  supportedMenuLanguages?: string[];
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
  /** Branch Capacity: how many guests the Branch seats, set by the merchant. Never blocks ordering. */
  capacity?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  language?: string | null;
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
  thumbnailUrl?: string | null;
  active: boolean;
  status: string;
  categoryId?: string | null;
  categoryName?: string | null;
  productCode?: number | null;
  createdAt: string;
  updatedAt: string;
  language?: string | null;
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
  /** Branch Capacity; null clears it. */
  capacity?: number | null;
}

export interface UpdateMerchantRequest {
  merchantName?: string;
  website?: string;
  offerings?: string[];
  merchantStatus?: string;
  businessType?: string;
  merchantMobility?: string;
  storefrontTheme?: string;
  defaultVatPercent?: number | null;
  originalMenuLanguage?: string;
  supportedMenuLanguages?: string[];
  contactInfo?: {
    email?: string;
    phoneNumber?: string;
    xHandle?: string;
    instagramHandle?: string;
  };
}

export interface CreateMerchantRequest extends UpdateMerchantRequest {
  merchantName: string;
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
  /** Branch Capacity; null clears it. */
  capacity?: number | null;
}

export interface UpdateMerchantLogoRequest {
  storageKey: string;
}

export interface MerchantLogoUploadRequest {
  contentType: string;
}

/** A storefront look from `GET /v1/storefront/themes`; merchants can only be given PUBLISHED ones. */
export interface StorefrontTheme {
  code: string;
  displayName: string;
  style: 'STANDARD' | 'CLASSIC';
  status: 'DRAFT' | 'PUBLISHED';
  tokens: Record<string, Record<string, string>>;
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
  website: string;
  contactEmail: string;
  contactPhoneNumber: string;
  xHandle: string;
  instagramHandle: string;
  businessType: string;
  merchantMobility: string;
  services: string[];
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

/** A Stripe Terminal card reader registered to a branch's Terminal Location (read-only monitoring). */
export interface CardReader {
  id: string;
  branchId: string;
  branchName: string;
  label: string | null;
  deviceType: string | null;
  serialNumber: string | null;
  softwareVersion: string | null;
  status: 'online' | 'offline' | null;
  lastSeenAt: string | null;
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
  merchantId: string;
  merchantName: string;
  merchantCode: string;
  city: string | null;
  country: string | null;
  businessType: string;
  merchantMobility: string;
  merchantStatus: string;
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
  itemId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface OrderResponse {
  orderId: string;
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
  /** Amount in the currency's minor unit (e.g. cents). */
  totalAmountMinor: number;
  currency: string;
  createdAt: string;
  paidAt?: string | null;
  /** CASH: the shopper pays staff; the order stays PENDING until staff settle it. */
  checkoutPaymentMethod?: 'BANK_ACCOUNT' | 'CARD' | 'PAY_BY_BANK' | 'TERMINAL' | 'PAYPAL' | 'CASH' | null;
  paymentSource?: 'APP_PAYMENT' | 'MANUAL_SETTLEMENT' | null;
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

/** A Menu Language Catalogue entry: ISO 639-1 code with its English and native names. */
export interface MenuLanguage {
  code: string;
  displayName: string;
  nativeName: string;
}

export type TranslationOrigin = 'MACHINE' | 'MERCHANT';

export interface CatalogTranslation {
  language: string;
  name: string;
  description?: string | null;
  origin: TranslationOrigin;
  stale: boolean;
  updatedAt: string;
}

export interface UpsertCatalogTranslationRequest {
  name: string;
  description?: string;
}

export interface TranslationCoverage {
  language: string;
  productsTotal: number;
  productsTranslated: number;
  categoriesTotal: number;
  categoriesTranslated: number;
}

/** `GET`/`POST disable` of `/merchant/branches/{branchId}/kitchen`. `username` is null if no Kitchen Login was ever provisioned. */
export interface KitchenAccessStatus {
  enabled: boolean;
  username: string | null;
}

/**
 * The Kitchen Login returned once by `POST .../kitchen/enable`. The password exists only in this response:
 * keep it in component state, never in storage, the URL, logs or error reports.
 */
export interface KitchenLogin {
  username: string;
  password: string;
  keycloakUrl: string;
  realm: string;
  clientId: string;
  apiBaseUrl: string;
  branchId: string;
}

// ── Tables and Floor Plans (zack-pay#195) ─────────────────────────────────

/** Where a Table sits on a Floor Plan, as fractions 0..1 of the picture's width (x) and height (y). */
export interface TablePlacement {
  floorPlanId: string;
  x: number;
  y: number;
}

/** A seating place in a Branch. Shown by its Table Name; the Table Code is the stable short ID inside its Table Link. */
export interface BranchTable {
  id: string;
  code: string;
  name: string;
  active: boolean;
  /** The Table Link: the storefront URL `/t/{code}` that its QR code and NFC tag carry. */
  link: string;
  placement: TablePlacement | null;
  /** Seats at the Table (1–50), or null when not set. */
  seats?: number | null;
  /** When an NFC tag carrying the Table Link was last written (merchant app); null when none was. */
  nfcTagWrittenAt?: string | null;
}

export interface CreateTablesRequest {
  names: string[];
  /** Applied to every created Table. */
  seats?: number;
}

export interface UpdateTableRequest {
  name?: string;
  active?: boolean;
  /** null clears the seats. */
  seats?: number | null;
}

/** A named picture of a room or area of a Branch on which Tables are placed. */
/** A named rectangle traced over the Floor Plan picture; fractions 0..1 of the picture, like Table Placements. */
export interface FloorArea {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  imageUrl?: string | null;
  /** When non-empty the live floor draws these instead of the picture. */
  areas?: FloorArea[];
}

export interface FloorPlanImageUploadResponse {
  storageKey?: string;
  uploadUrl: string;
  expiresAt?: string;
}

/** RESERVED is part of the contract for the later Reservation feature; the backend does not return it yet. */
export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED';

export interface TableOrderSummary {
  orderId: string;
  pickupNumber: number | null;
  totalAmountMinor: number;
  currency: string;
  paymentStatus: string;
  preparationStatus: string | null;
  createdAt: string;
}

export interface TableLive {
  table: BranchTable;
  status: TableStatus;
  occupiedSince: string | null;
  orders: TableOrderSummary[];
  /** Guest Count: people at the Table right now; null when not known (or the Table is free). */
  guestCount?: number | null;
}

/** The live floor of a Branch: its Floor Plans and every active Table with its Table Status and open orders. */
export interface BranchFloor {
  floorPlans: FloorPlan[];
  tables: TableLive[];
  totalTables?: number;
  occupiedTables?: number;
  /** Sum of the seats of active Tables. */
  seatedCapacity?: number;
  /** Sum of the seats of Occupied Tables. */
  occupiedSeats?: number;
  branchCapacity?: number | null;
  /** Sum of the Guest Counts of Occupied Tables. */
  totalGuests?: number;
}


export interface PreparationStation {
  id: string;
  name: string;
}

export interface PreparationConfiguration {
  stations: PreparationStation[];
  categoryDefaults: Record<string, string>;
  productOverrides: Record<string, string>;
}

// ── Kiosk ─────────────────────────────────────────────────────────────────

export type KioskPaymentChoice = 'CARD' | 'CASH' | 'SCAN_TO_PAY';

/** What a Merchant Manager configures for one Branch's Kiosk. */
export interface KioskSettings {
  paymentChoices: KioskPaymentChoice[];
  resetSeconds: number;
  languages: string[];
  advertisedProductIds: string[];
}

/** `GET /merchant/branches/{branchId}/kiosk`. `login` is null if no Kiosk Login was ever provisioned. */
export interface KioskAccessStatus {
  enabled: boolean;
  login: string | null;
  settings: KioskSettings;
}

/**
 * The Kiosk Login returned once by `POST .../kiosk/enable`. The password exists only in this response:
 * keep it in component state, never in storage, the URL, logs or error reports.
 */
export interface KioskLogin {
  login: string;
  password: string;
}
