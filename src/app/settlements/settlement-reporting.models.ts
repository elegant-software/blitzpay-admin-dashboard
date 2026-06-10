export interface PaymentMethodBreakdown {
  paymentMethod: string;
  transactionCount: number;
  grossAmountMinor: number;
  netAmountMinor: number;
}

export interface SettlementSummaryResponse {
  merchantId: string;
  from: string;
  to: string;
  currency: string;
  transactionCount: number;
  grossAmountMinor: number;
  processingFeeMinor: number;
  platformFeeMinor: number;
  netAmountMinor: number;
  byPaymentMethod: PaymentMethodBreakdown[];
}

export interface SettlementRow {
  paymentRequestId: string;
  orderId: string;
  settledAt: string;
  provider: string;
  currency: string;
  grossAmountMinor: number;
  processingFeeMinor: number;
  platformFeeMinor: number;
  netAmountMinor: number;
  paymentMethod: string;
  paymentMethodDetail: string | null;
  fundsAvailableAt: string | null;
  providerPaymentReference: string | null;
  providerChargeReference: string | null;
  providerDashboardUrl: string | null;
}

export interface SettlementPageResponse {
  content: SettlementRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SettlementRefreshResult {
  requested: number;
  refreshed: number;
  skipped: number;
  failed: number;
  results: SettlementRefreshItem[];
}

export interface SettlementRefreshItem {
  paymentRequestId: string;
  status: 'REFRESHED' | 'SKIPPED' | 'FAILED';
  message: string | null;
}
