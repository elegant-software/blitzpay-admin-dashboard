export type StorefrontPaymentMethod = 'STRIPE' | 'BRAINTREE';

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

export interface CreateStorefrontOrderRequest {
  branchId: string;
  orderType: 'PRE_ORDER';
  usesDeferredPayment: false;
  paymentMethod?: StorefrontPaymentMethod;
  items: StorefrontOrderItem[];
}

export interface StorefrontOrderLine {
  productId: string;
  name?: string;
  quantity: number;
  unitPriceMinor?: number;
  lineTotalMinor?: number;
}

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
