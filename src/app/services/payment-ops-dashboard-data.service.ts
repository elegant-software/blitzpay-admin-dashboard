import { Injectable } from '@angular/core';
import {
  BranchOverview,
  ChannelSnapshot,
  DashboardSelectionState,
  DashboardSnapshot,
  MerchantOverview,
  PaymentChannel,
  PortfolioSummary,
  ProductOverview,
  TransactionRecord
} from '../payment-ops-dashboard/payment-ops-dashboard.models';

@Injectable({ providedIn: 'root' })
export class PaymentOpsDashboardDataService {
  private readonly baseMerchants: MerchantOverview[] = [
    {
      merchantId: 'mrc-101',
      reference: 'BP-DE-10012',
      name: 'Herman Post',
      status: 'ACTIVE',
      country: 'Germany',
      branchCount: 0,
      productCount: 0,
      transactionCount: 0,
      onlineUserCount: 0,
      mobileUserCount: 0,
      paymentVolume: 0,
      lastActivityAt: '2026-04-29T08:41:00Z',
      riskFlag: 'Low',
      branches: [
        {
          branchId: 'br-101-a',
          merchantId: 'mrc-101',
          name: 'Bremen Mitte',
          status: 'ACTIVE',
          city: 'Bremen',
          address: 'Obernstrasse 32',
          productCount: 0,
          transactionCount: 0,
          paymentVolume: 0,
          onlineUserCount: 0,
          mobileUserCount: 0,
          lastTransactionAt: '2026-04-29T08:41:00Z',
          products: [
            {
              productId: 'prd-101-a',
              merchantId: 'mrc-101',
              branchId: 'br-101-a',
              name: 'Brunch Box',
              status: 'ACTIVE',
              category: 'Food Bundle',
              unitPrice: 18.9,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: '2026-04-29T08:15:00Z'
            },
            {
              productId: 'prd-101-b',
              merchantId: 'mrc-101',
              branchId: 'br-101-a',
              name: 'Cappuccino Large',
              status: 'INACTIVE',
              category: 'Beverage',
              unitPrice: 4.8,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: '2026-04-28T14:05:00Z'
            }
          ]
        },
        {
          branchId: 'br-101-b',
          merchantId: 'mrc-101',
          name: 'Bremen Viertel',
          status: 'INACTIVE',
          city: 'Bremen',
          address: 'Sielwall 19',
          productCount: 0,
          transactionCount: 0,
          paymentVolume: 0,
          onlineUserCount: 0,
          mobileUserCount: 0,
          lastTransactionAt: '2026-04-27T19:10:00Z',
          products: [
            {
              productId: 'prd-101-c',
              merchantId: 'mrc-101',
              branchId: 'br-101-b',
              name: 'Evening Combo',
              status: 'ACTIVE',
              category: 'Meal',
              unitPrice: 24.5,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: '2026-04-27T19:10:00Z'
            }
          ]
        }
      ]
    },
    {
      merchantId: 'mrc-102',
      reference: 'BP-UK-88314',
      name: 'Northwind Grocer',
      status: 'REVIEW',
      country: 'United Kingdom',
      branchCount: 0,
      productCount: 0,
      transactionCount: 0,
      onlineUserCount: 0,
      mobileUserCount: 0,
      paymentVolume: 0,
      lastActivityAt: '2026-04-29T07:22:00Z',
      riskFlag: 'Medium',
      branches: [
        {
          branchId: 'br-102-a',
          merchantId: 'mrc-102',
          name: 'Manchester Central',
          status: 'ACTIVE',
          city: 'Manchester',
          address: 'Exchange Square 7',
          productCount: 0,
          transactionCount: 0,
          paymentVolume: 0,
          onlineUserCount: 0,
          mobileUserCount: 0,
          lastTransactionAt: '2026-04-29T07:22:00Z',
          products: [
            {
              productId: 'prd-102-a',
              merchantId: 'mrc-102',
              branchId: 'br-102-a',
              name: 'Weekly Produce Crate',
              status: 'ACTIVE',
              category: 'Subscription',
              unitPrice: 31,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: '2026-04-29T07:15:00Z'
            },
            {
              productId: 'prd-102-b',
              merchantId: 'mrc-102',
              branchId: 'br-102-a',
              name: 'Family Snack Pack',
              status: 'ACTIVE',
              category: 'Bundle',
              unitPrice: 12.4,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: '2026-04-29T06:58:00Z'
            },
            {
              productId: 'prd-102-c',
              merchantId: 'mrc-102',
              branchId: 'br-102-a',
              name: 'Seasonal Fruit Box',
              status: 'SETUP',
              category: 'Fresh Goods',
              unitPrice: 16.2,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: null
            }
          ]
        }
      ]
    },
    {
      merchantId: 'mrc-103',
      reference: 'BP-US-77120',
      name: 'Velvet Ride Mobility',
      status: 'ACTIVE',
      country: 'United States',
      branchCount: 0,
      productCount: 0,
      transactionCount: 0,
      onlineUserCount: 0,
      mobileUserCount: 0,
      paymentVolume: 0,
      lastActivityAt: '2026-04-29T06:10:00Z',
      riskFlag: 'Watch',
      branches: [
        {
          branchId: 'br-103-a',
          merchantId: 'mrc-103',
          name: 'Austin Hub',
          status: 'ACTIVE',
          city: 'Austin',
          address: 'Congress Ave 400',
          productCount: 0,
          transactionCount: 0,
          paymentVolume: 0,
          onlineUserCount: 0,
          mobileUserCount: 0,
          lastTransactionAt: '2026-04-29T06:10:00Z',
          products: [
            {
              productId: 'prd-103-a',
              merchantId: 'mrc-103',
              branchId: 'br-103-a',
              name: 'City Pass 24h',
              status: 'ACTIVE',
              category: 'Mobility',
              unitPrice: 9.99,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: '2026-04-29T06:10:00Z'
            },
            {
              productId: 'prd-103-b',
              merchantId: 'mrc-103',
              branchId: 'br-103-a',
              name: 'Corporate Commute Pack',
              status: 'INACTIVE',
              category: 'Enterprise',
              unitPrice: 120,
              transactionCount: 0,
              paymentVolume: 0,
              lastPurchasedAt: '2026-04-25T13:10:00Z'
            }
          ]
        }
      ]
    },
    {
      merchantId: 'mrc-104',
      reference: 'BP-FR-30220',
      name: 'Maison Riviera',
      status: 'SETUP',
      country: 'France',
      branchCount: 0,
      productCount: 0,
      transactionCount: 0,
      onlineUserCount: 0,
      mobileUserCount: 0,
      paymentVolume: 0,
      lastActivityAt: null,
      riskFlag: 'Pending',
      branches: []
    }
  ];

  private readonly baseTransactions: TransactionRecord[] = [
    { transactionId: 'txn-2001', merchantId: 'mrc-101', branchId: 'br-101-a', productId: 'prd-101-a', channel: 'online', paymentMethod: 'paypal', status: 'CAPTURED', amount: 18.9, currency: 'EUR', customerRegion: 'DE-NI', createdAt: '2026-04-29T08:15:00Z' },
    { transactionId: 'txn-2002', merchantId: 'mrc-101', branchId: 'br-101-a', productId: 'prd-101-b', channel: 'mobile', paymentMethod: 'card', status: 'FAILED', amount: 4.8, currency: 'EUR', customerRegion: 'DE-HH', createdAt: '2026-04-28T14:05:00Z' },
    { transactionId: 'txn-2003', merchantId: 'mrc-101', branchId: 'br-101-b', productId: 'prd-101-c', channel: 'online', paymentMethod: 'bank', status: 'CAPTURED', amount: 24.5, currency: 'EUR', customerRegion: 'DE-HB', createdAt: '2026-04-27T19:10:00Z' },
    { transactionId: 'txn-2101', merchantId: 'mrc-102', branchId: 'br-102-a', productId: 'prd-102-a', channel: 'online', paymentMethod: 'paypal', status: 'CAPTURED', amount: 31, currency: 'GBP', customerRegion: 'UK-MAN', createdAt: '2026-04-29T07:15:00Z' },
    { transactionId: 'txn-2102', merchantId: 'mrc-102', branchId: 'br-102-a', productId: 'prd-102-b', channel: 'mobile', paymentMethod: 'card', status: 'CAPTURED', amount: 12.4, currency: 'GBP', customerRegion: 'UK-LIV', createdAt: '2026-04-29T06:58:00Z' },
    { transactionId: 'txn-2103', merchantId: 'mrc-102', branchId: 'br-102-a', productId: null, channel: 'mobile', paymentMethod: 'bank', status: 'REFUNDED', amount: 8.2, currency: 'GBP', customerRegion: 'UK-MAN', createdAt: '2026-04-28T17:32:00Z' },
    { transactionId: 'txn-2201', merchantId: 'mrc-103', branchId: 'br-103-a', productId: 'prd-103-a', channel: 'mobile', paymentMethod: 'card', status: 'CAPTURED', amount: 9.99, currency: 'USD', customerRegion: 'US-TX', createdAt: '2026-04-29T06:10:00Z' },
    { transactionId: 'txn-2202', merchantId: 'mrc-103', branchId: 'br-103-a', productId: 'prd-103-b', channel: 'online', paymentMethod: 'bank', status: 'PENDING', amount: 120, currency: 'USD', customerRegion: 'US-TX', createdAt: '2026-04-25T13:10:00Z' },
    { transactionId: 'txn-2203', merchantId: 'mrc-103', branchId: null, productId: null, channel: 'mobile', paymentMethod: 'paypal', status: 'CHARGEBACK_REVIEW', amount: 59.5, currency: 'USD', customerRegion: 'US-CA', createdAt: '2026-04-24T10:40:00Z' }
  ];

  readonly selectionDefaults: DashboardSelectionState = {
    selectedMerchantId: null,
    selectedBranchId: null,
    selectedTransactionStatus: null,
    selectedChannel: null
  };

  private readonly snapshot = this.buildSnapshot();

  getSnapshot(): DashboardSnapshot {
    return this.snapshot;
  }

  getPortfolioSummary(): PortfolioSummary {
    return this.snapshot.portfolioSummary;
  }

  getMerchants(): MerchantOverview[] {
    return this.snapshot.merchants;
  }

  getMerchant(merchantId: string | null): MerchantOverview | null {
    return this.snapshot.merchants.find((merchant) => merchant.merchantId === merchantId) ?? null;
  }

  getBranches(merchantId: string | null): BranchOverview[] {
    return this.getMerchant(merchantId)?.branches ?? [];
  }

  getBranch(merchantId: string | null, branchId: string | null): BranchOverview | null {
    return this.getBranches(merchantId).find((branch) => branch.branchId === branchId) ?? null;
  }

  getProducts(merchantId: string | null, branchId: string | null): ProductOverview[] {
    if (branchId) {
      return this.getBranch(merchantId, branchId)?.products ?? [];
    }

    const merchant = this.getMerchant(merchantId);
    if (!merchant) {
      return [];
    }

    return merchant.branches.flatMap((branch) => branch.products);
  }

  getTransactions(merchantId: string | null, branchId: string | null): TransactionRecord[] {
    return this.snapshot.transactions.filter((transaction) => {
      if (branchId) {
        return transaction.branchId === branchId;
      }
      if (merchantId) {
        return transaction.merchantId === merchantId;
      }
      return true;
    });
  }

  getChannelSnapshots(merchantId: string | null, branchId: string | null): ChannelSnapshot[] {
    return this.snapshot.channelSnapshots.filter((snapshot) => {
      if (branchId) {
        return snapshot.scopeType === 'branch' && snapshot.scopeId === branchId;
      }
      if (merchantId) {
        return snapshot.scopeType === 'merchant' && snapshot.scopeId === merchantId;
      }
      return snapshot.scopeType === 'global';
    });
  }

  private buildSnapshot(): DashboardSnapshot {
    const merchants = this.baseMerchants.map((merchant) => this.decorateMerchant(merchant));
    const globalChannels = this.buildScopeChannels(this.baseTransactions, 'global', null);
    const merchantChannels = merchants.flatMap((merchant) =>
      this.buildScopeChannels(
        this.baseTransactions.filter((transaction) => transaction.merchantId === merchant.merchantId),
        'merchant',
        merchant.merchantId
      )
    );
    const branchChannels = merchants.flatMap((merchant) =>
      merchant.branches.flatMap((branch) =>
        this.buildScopeChannels(
          this.baseTransactions.filter((transaction) => transaction.branchId === branch.branchId),
          'branch',
          branch.branchId
        )
      )
    );

    return {
      generatedAt: '2026-04-29T09:00:00Z',
      dataMode: 'mock',
      portfolioSummary: this.buildPortfolioSummary(merchants, this.baseTransactions),
      merchants,
      transactions: this.baseTransactions,
      channelSnapshots: [...globalChannels, ...merchantChannels, ...branchChannels]
    };
  }

  private decorateMerchant(merchant: MerchantOverview): MerchantOverview {
    const branches = merchant.branches.map((branch) => this.decorateBranch(branch));
    const merchantTransactions = this.baseTransactions.filter((transaction) => transaction.merchantId === merchant.merchantId);
    const products = branches.flatMap((branch) => branch.products);

    return {
      ...merchant,
      branches,
      branchCount: branches.length,
      productCount: products.length,
      transactionCount: merchantTransactions.length,
      onlineUserCount: this.estimateUsers(merchantTransactions, 'online'),
      mobileUserCount: this.estimateUsers(merchantTransactions, 'mobile'),
      paymentVolume: this.sumTransactions(merchantTransactions),
      lastActivityAt: this.latestDate(merchantTransactions.map((transaction) => transaction.createdAt)) ?? merchant.lastActivityAt
    };
  }

  private decorateBranch(branch: BranchOverview): BranchOverview {
    const transactions = this.baseTransactions.filter((transaction) => transaction.branchId === branch.branchId);
    const products = branch.products.map((product) => this.decorateProduct(product));

    return {
      ...branch,
      products,
      productCount: products.length,
      transactionCount: transactions.length,
      paymentVolume: this.sumTransactions(transactions),
      onlineUserCount: this.estimateUsers(transactions, 'online'),
      mobileUserCount: this.estimateUsers(transactions, 'mobile'),
      lastTransactionAt: this.latestDate(transactions.map((transaction) => transaction.createdAt)) ?? branch.lastTransactionAt
    };
  }

  private decorateProduct(product: ProductOverview): ProductOverview {
    const transactions = this.baseTransactions.filter((transaction) => transaction.productId === product.productId);

    return {
      ...product,
      transactionCount: transactions.length,
      paymentVolume: this.sumTransactions(transactions),
      lastPurchasedAt: this.latestDate(transactions.map((transaction) => transaction.createdAt)) ?? product.lastPurchasedAt
    };
  }

  private buildPortfolioSummary(merchants: MerchantOverview[], transactions: TransactionRecord[]): PortfolioSummary {
    const allBranches = merchants.flatMap((merchant) => merchant.branches);
    const merchantStatuses = merchants.filter((merchant) => merchant.status === 'ACTIVE');

    return {
      merchantCount: merchants.length,
      branchCount: allBranches.length,
      productCount: allBranches.flatMap((branch) => branch.products).length,
      transactionCount: transactions.length,
      onlineUserCount: this.estimateUsers(transactions, 'online'),
      mobileUserCount: this.estimateUsers(transactions, 'mobile'),
      activeMerchantCount: merchantStatuses.length,
      inactiveMerchantCount: merchants.length - merchantStatuses.length,
      paymentVolume: this.sumTransactions(transactions),
      approvalRate: this.calculateApprovalRate(transactions)
    };
  }

  private buildScopeChannels(
    transactions: TransactionRecord[],
    scopeType: 'global' | 'merchant' | 'branch',
    scopeId: string | null
  ): ChannelSnapshot[] {
    return (['online', 'mobile'] as PaymentChannel[]).map((channel) => {
      const channelTransactions = transactions.filter((transaction) => transaction.channel === channel);
      return {
        scopeType,
        scopeId,
        channel,
        userCount: this.estimateUsers(channelTransactions, channel),
        transactionCount: channelTransactions.length,
        paymentVolume: this.sumTransactions(channelTransactions),
        conversionRate: channelTransactions.length ? Math.round(this.calculateApprovalRate(channelTransactions)) : 0,
        lastActivityAt: this.latestDate(channelTransactions.map((transaction) => transaction.createdAt))
      };
    });
  }

  private estimateUsers(transactions: TransactionRecord[], channel: PaymentChannel): number {
    const multiplier = channel === 'online' ? 17 : 11;
    return transactions.length * multiplier;
  }

  private sumTransactions(transactions: TransactionRecord[]): number {
    return Number(
      transactions.reduce((sum, transaction) => sum + transaction.amount, 0).toFixed(2)
    );
  }

  private calculateApprovalRate(transactions: TransactionRecord[]): number {
    if (!transactions.length) {
      return 0;
    }

    const approvedCount = transactions.filter((transaction) => transaction.status === 'CAPTURED').length;
    return Math.round((approvedCount / transactions.length) * 100);
  }

  private latestDate(values: Array<string | null | undefined>): string | null {
    const available = values.filter((value): value is string => typeof value === 'string' && value.length > 0);
    if (!available.length) {
      return null;
    }

    return [...available].sort().at(-1) ?? null;
  }
}
