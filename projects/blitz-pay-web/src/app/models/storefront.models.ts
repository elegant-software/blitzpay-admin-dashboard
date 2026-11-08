export type StorefrontPaymentMethod = 'CARD' | 'PAY_BY_BANK';

export interface StorefrontMerchant {
  applicationId: string;
  merchantName: string;
  logoUrl?: string | null;
  /** Named look chosen in the admin dashboard; maps to a `data-storefront-theme` CSS preset. */
  storefrontTheme?: 'DEFAULT' | 'HERITAGE' | null;
  offerings?: string[];
  originalMenuLanguage?: string | null;
  originalLanguage?: string | null;
  supportedMenuLanguages?: string[];
}

export interface StorefrontBranch {
  id: string;
  merchantId: string;
  name: string;
  active?: boolean;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  activePaymentChannels?: string[];
}

export interface StorefrontProduct {
  productId: string;
  branchId: string;
  name: string;
  description?: string | null;
  unitPrice: number;
  imageUrl?: string | null;
  active: boolean;
  categoryName?: string | null;
  /** Language the name and description are in; the Original Menu Language when untranslated. */
  language?: string | null;
}

export interface StorefrontOrderItem {
  productId: string;
  quantity: number;
}

/** Where the guest's browser says they are; required for an order at a Table (Walk-In). */
export interface StorefrontCustomerLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  /** ISO 8601 time the position was taken. */
  capturedAt: string;
}

/** CASH: the guest pays staff; the Order stays unpaid until staff confirm it. Online methods are chosen later, when paying. */
export type StorefrontCheckoutPaymentMethod = 'CASH';

/** Guest order: the server prices it from the catalog and sets the HttpOnly guest_token session cookie. */
export interface CreateStorefrontOrderRequest {
  branchId: string;
  items: StorefrontOrderItem[];
  /** Set when ordering at a Table; the order becomes Walk-In and needs [customerLocation]. */
  tableCode?: string;
  customerLocation?: StorefrontCustomerLocation;
  checkoutPaymentMethod?: StorefrontCheckoutPaymentMethod;
  /** Guest Count (1–50), asked when the Table was free; the backend ignores it once the Table has one. */
  guestCount?: number;
}

/** Shopper-facing view of a Branch's Table Status: counts only, never orders. */
export interface StorefrontTableAvailability {
  total: number;
  free: number;
  freeSeats?: number | null;
}

/** What a Table Link resolves to. A deactivated Table has active=false and no tableId: order at the counter instead. */
export interface StorefrontTableResolution {
  merchantId: string;
  merchantName: string;
  branchId: string;
  branchName: string;
  tableId: string | null;
  tableName: string | null;
  active: boolean;
  /** Whether someone is already seated or has ordered at the Table; no other occupancy detail. */
  occupied?: boolean;
}

/** CARD: Payment Element credentials (direct charge on the connected account). PAY_BY_BANK: hosted checkout URL. */
export interface StorefrontPayment {
  method: StorefrontPaymentMethod;
  connectedAccountId: string;
  clientSecret?: string;
  publishableKey?: string;
  checkoutUrl?: string;
}

export interface StorefrontOrderLine {
  productId: string;
  name?: string;
  quantity: number;
  unitPriceMinor?: number;
  lineTotalMinor?: number;
}

export type StorefrontPreparationStatus = 'RECEIVED' | 'PREPARING' | 'READY';

export interface StorefrontOrder {
  orderId: string;
  /** Merchant-facing reference, when provided by the Order API. */
  reference?: string;
  merchantId?: string;
  branchId?: string | null;
  status?: string;
  currency?: string;
  totalAmountMinor?: number;
  items?: StorefrontOrderLine[];
  preparationStatus?: StorefrontPreparationStatus;
  /** Null for legacy orders and orders without a Branch. */
  pickupNumber?: number | null;
  /** Table Name at the time of ordering; null for counter orders. */
  tableName?: string | null;
}

export interface StorefrontPaymentCapabilities {
  connected?: boolean;
  chargesEnabled?: boolean;
  enabledPaymentFlows: string[];
}

export interface CreatePayByBankCheckoutRequest {
  orderId: string;
  merchantId: string;
  branchId: string;
  productId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PayByBankCheckout {
  paymentRequestId: string;
  checkoutUrl: string;
}
