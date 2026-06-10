export interface OrderTypeCount {
  orderType: string;
  count: number;
}

export interface RevenueKpi {
  currency: string;
  grossAmountMinor: number;
  processingFeeMinor: number;
  platformFeeMinor: number;
  netAmountMinor: number;
  settledTransactionCount: number;
}

export interface OrderKpi {
  paidCount: number;
  pendingCount: number;
  failedOrCancelledCount: number;
  byOrderType: OrderTypeCount[];
}

export interface AppointmentKpi {
  bookedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface PaymentMethodFrequency {
  paymentMethod: string;
  transactionCount: number;
  sharePercent: number;
}

export interface MerchantCountKpi {
  totalCount: number;
  activeCount: number;
  newInPeriodCount: number;
}

export interface BranchCountKpi {
  totalCount: number;
  activeCount: number;
  newInPeriodCount: number;
}

export interface PlatformKpiReport {
  from: string;
  to: string;
  merchantId: string | null;
  revenue: RevenueKpi;
  orders: OrderKpi;
  appointments: AppointmentKpi;
  paymentMethodFrequency: PaymentMethodFrequency[];
  merchantCounts: MerchantCountKpi | null;
  branchCounts: BranchCountKpi | null;
}
