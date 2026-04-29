export type DashboardDataMode = 'mock';
export type PaymentChannel = 'online' | 'mobile';
export type PaymentMethod = 'paypal' | 'bank' | 'card';
export type TimeRangePreset = '1h' | '2h' | 'lastWeek' | 'lastMonth' | 'custom';

export interface PortfolioSummary {
  merchantCount: number;
  branchCount: number;
  productCount: number;
  transactionCount: number;
  onlineUserCount: number;
  mobileUserCount: number;
  activeMerchantCount: number;
  inactiveMerchantCount: number;
  paymentVolume: number;
  approvalRate: number;
}

export interface ProductOverview {
  productId: string;
  merchantId: string;
  branchId?: string | null;
  name: string;
  status: string;
  category?: string | null;
  unitPrice: number;
  transactionCount: number;
  paymentVolume: number;
  lastPurchasedAt?: string | null;
}

export interface BranchOverview {
  branchId: string;
  merchantId: string;
  name: string;
  status: string;
  city?: string | null;
  address?: string | null;
  productCount: number;
  transactionCount: number;
  paymentVolume: number;
  onlineUserCount: number;
  mobileUserCount: number;
  lastTransactionAt?: string | null;
  products: ProductOverview[];
}

export interface MerchantOverview {
  merchantId: string;
  reference: string;
  name: string;
  status: string;
  country?: string | null;
  branchCount: number;
  productCount: number;
  transactionCount: number;
  onlineUserCount: number;
  mobileUserCount: number;
  paymentVolume: number;
  lastActivityAt?: string | null;
  riskFlag?: string | null;
  branches: BranchOverview[];
}

export interface TransactionRecord {
  transactionId: string;
  merchantId: string;
  branchId?: string | null;
  productId?: string | null;
  channel: PaymentChannel;
  paymentMethod: PaymentMethod;
  status: string;
  amount: number;
  currency: string;
  customerRegion?: string | null;
  createdAt: string;
}

export interface ChannelSnapshot {
  scopeType: 'global' | 'merchant' | 'branch';
  scopeId?: string | null;
  channel: PaymentChannel;
  userCount: number;
  transactionCount: number;
  paymentVolume: number;
  conversionRate?: number | null;
  lastActivityAt?: string | null;
}

export interface DashboardSnapshot {
  generatedAt: string;
  dataMode: DashboardDataMode;
  portfolioSummary: PortfolioSummary;
  merchants: MerchantOverview[];
  transactions: TransactionRecord[];
  channelSnapshots: ChannelSnapshot[];
}

export interface DashboardSelectionState {
  selectedMerchantId: string | null;
  selectedBranchId: string | null;
  selectedTransactionStatus: string | null;
  selectedChannel: PaymentChannel | null;
}

export interface PaymentMethodBucket {
  label: string;
  paypalCount: number;
  bankCount: number;
  cardCount: number;
  totalCount: number;
}
