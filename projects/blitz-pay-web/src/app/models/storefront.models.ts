export type StorefrontPaymentMethod = 'CARD' | 'PAY_BY_BANK';

export interface StorefrontMerchant {
  applicationId: string;
  merchantName: string;
  logoUrl?: string | null;
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

/** Guest order: the server prices it from the catalog and sets the HttpOnly guest_token session cookie. */
export interface CreateStorefrontOrderRequest {
  branchId: string;
  items: StorefrontOrderItem[];
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
