import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import {
  BranchOverview,
  ChannelSnapshot,
  DashboardSelectionState,
  MerchantOverview,
  PaymentChannel,
  PaymentMethod,
  PaymentMethodBucket,
  ProductOverview,
  TimeRangePreset,
  TransactionRecord
} from './payment-ops-dashboard.models';
import { PaymentOpsDashboardDataService } from '../services/payment-ops-dashboard-data.service';

@Component({
  selector: 'app-payment-ops-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe],
  templateUrl: './payment-ops-dashboard.component.html',
  styleUrl: './payment-ops-dashboard.component.css'
})
export class PaymentOpsDashboardComponent {
  readonly snapshot;
  readonly basePortfolioSummary;
  selection: DashboardSelectionState;
  readonly timeRangeOptions: Array<{ key: TimeRangePreset; label: string }> = [
    { key: '1h', label: '1 hour' },
    { key: '2h', label: '2 hours' },
    { key: 'lastWeek', label: 'Last week' },
    { key: 'lastMonth', label: 'Last month' },
    { key: 'custom', label: 'Custom' }
  ];
  selectedTimeRange: TimeRangePreset = 'lastWeek';
  customStart = '';
  customEnd = '';

  constructor(private readonly dashboardData: PaymentOpsDashboardDataService) {
    this.snapshot = this.dashboardData.getSnapshot();
    this.basePortfolioSummary = this.dashboardData.getPortfolioSummary();
    this.selection = { ...this.dashboardData.selectionDefaults };
    this.seedCustomRange();
  }

  get portfolioSummary() {
    const filteredTransactions = this.transactions;
    return {
      ...this.basePortfolioSummary,
      transactionCount: filteredTransactions.length,
      onlineUserCount: this.estimateUsers(filteredTransactions, 'online'),
      mobileUserCount: this.estimateUsers(filteredTransactions, 'mobile'),
      paymentVolume: this.sumTransactions(filteredTransactions),
      approvalRate: this.calculateApprovalRate(filteredTransactions)
    };
  }

  get merchants(): MerchantOverview[] {
    return this.dashboardData.getMerchants();
  }

  get selectedMerchant(): MerchantOverview | null {
    return this.dashboardData.getMerchant(this.selection.selectedMerchantId);
  }

  get branches(): BranchOverview[] {
    return this.dashboardData.getBranches(this.selection.selectedMerchantId);
  }

  get selectedBranch(): BranchOverview | null {
    return this.dashboardData.getBranch(this.selection.selectedMerchantId, this.selection.selectedBranchId);
  }

  get products(): ProductOverview[] {
    return this.dashboardData.getProducts(this.selection.selectedMerchantId, this.selection.selectedBranchId);
  }

  get transactions(): TransactionRecord[] {
    return this.dashboardData
      .getTransactions(this.selection.selectedMerchantId, this.selection.selectedBranchId)
      .filter((transaction) => this.isWithinSelectedRange(transaction.createdAt));
  }

  get channelSnapshots(): ChannelSnapshot[] {
    return this.dashboardData
      .getChannelSnapshots(this.selection.selectedMerchantId, this.selection.selectedBranchId)
      .map((snapshot) => ({
        ...snapshot,
        userCount: this.estimateUsers(
          this.transactions.filter((transaction) => transaction.channel === snapshot.channel),
          snapshot.channel
        ),
        transactionCount: this.transactions.filter((transaction) => transaction.channel === snapshot.channel).length,
        paymentVolume: this.sumTransactions(this.transactions.filter((transaction) => transaction.channel === snapshot.channel)),
        conversionRate: this.calculateApprovalRate(this.transactions.filter((transaction) => transaction.channel === snapshot.channel)),
        lastActivityAt: this.latestDate(
          this.transactions
            .filter((transaction) => transaction.channel === snapshot.channel)
            .map((transaction) => transaction.createdAt)
        )
      }));
  }

  get paymentMethodBuckets(): PaymentMethodBucket[] {
    const buckets = this.buildTimeBuckets();

    return buckets.map((bucket) => {
      const transactions = this.transactions.filter((transaction) => this.transactionInBucket(transaction, bucket.start, bucket.end));
      const paypalCount = transactions.filter((transaction) => transaction.paymentMethod === 'paypal').length;
      const bankCount = transactions.filter((transaction) => transaction.paymentMethod === 'bank').length;
      const cardCount = transactions.filter((transaction) => transaction.paymentMethod === 'card').length;

      return {
        label: bucket.label,
        paypalCount,
        bankCount,
        cardCount,
        totalCount: paypalCount + bankCount + cardCount
      };
    });
  }

  get maxBucketValue(): number {
    return Math.max(1, ...this.paymentMethodBuckets.map((bucket) => bucket.totalCount));
  }

  selectMerchant(merchantId: string): void {
    this.selection.selectedMerchantId = this.selection.selectedMerchantId === merchantId ? null : merchantId;
    this.selection.selectedBranchId = null;
  }

  selectBranch(branchId: string): void {
    this.selection.selectedBranchId = this.selection.selectedBranchId === branchId ? null : branchId;
  }

  setTimeRange(range: TimeRangePreset): void {
    this.selectedTimeRange = range;
    if (range !== 'custom') {
      this.seedCustomRange();
    }
  }

  merchantStatusTone(status: string): string {
    return this.statusTone(status);
  }

  entityStatusTone(status: string): string {
    return this.statusTone(status);
  }

  transactionStatusTone(status: string): string {
    return this.statusTone(status);
  }

  channelTone(channel: PaymentChannel): string {
    return channel === 'online' ? 'channel-chip-online' : 'channel-chip-mobile';
  }

  channelLabel(channel: PaymentChannel): string {
    return channel === 'online' ? 'Online' : 'Mobile';
  }

  paymentMethodLabel(method: PaymentMethod): string {
    if (method === 'paypal') {
      return 'PayPal';
    }
    if (method === 'bank') {
      return 'Bank';
    }
    return 'Card';
  }

  paymentMethodBarHeight(value: number): number {
    return Math.max(8, Math.round((value / this.maxBucketValue) * 100));
  }

  get activeTimeRangeLabel(): string {
    return this.timeRangeOptions.find((option) => option.key === this.selectedTimeRange)?.label ?? 'Last week';
  }

  formatAmount(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  }

  relatedBranchName(transaction: TransactionRecord): string {
    if (!transaction.branchId) {
      return 'Merchant-level';
    }

    return this.selectedMerchant?.branches.find((branch) => branch.branchId === transaction.branchId)?.name
      ?? `Branch ${transaction.branchId}`;
  }

  relatedProductName(transaction: TransactionRecord): string {
    if (!transaction.productId) {
      return 'Unlinked product';
    }

    return this.products.find((product) => product.productId === transaction.productId)?.name
      ?? this.selectedMerchant?.branches
        .flatMap((branch) => branch.products)
        .find((product) => product.productId === transaction.productId)?.name
      ?? `Product ${transaction.productId}`;
  }

  trackByMerchant(_: number, merchant: MerchantOverview): string {
    return merchant.merchantId;
  }

  trackByBranch(_: number, branch: BranchOverview): string {
    return branch.branchId;
  }

  trackByProduct(_: number, product: ProductOverview): string {
    return product.productId;
  }

  trackByTransaction(_: number, transaction: TransactionRecord): string {
    return transaction.transactionId;
  }

  trackByChannel(_: number, snapshot: ChannelSnapshot): string {
    return `${snapshot.scopeType}-${snapshot.scopeId ?? 'global'}-${snapshot.channel}`;
  }

  trackByBucket(_: number, bucket: PaymentMethodBucket): string {
    return bucket.label;
  }

  private statusTone(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized === 'active' || normalized === 'captured') {
      return 'status-tag-success';
    }
    if (normalized.includes('review') || normalized.includes('pending') || normalized.includes('setup')) {
      return 'status-tag-warning';
    }
    if (normalized.includes('failed') || normalized.includes('chargeback') || normalized.includes('rejected')) {
      return 'status-tag-danger';
    }
    return 'status-tag-neutral';
  }

  private seedCustomRange(): void {
    const end = new Date(this.snapshot.generatedAt);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    this.customStart = start.toISOString().slice(0, 10);
    this.customEnd = end.toISOString().slice(0, 10);
  }

  private isWithinSelectedRange(value: string): boolean {
    const transactionTime = new Date(value).getTime();
    const now = new Date(this.snapshot.generatedAt).getTime();

    if (this.selectedTimeRange === '1h') {
      return transactionTime >= now - 60 * 60 * 1000 && transactionTime <= now;
    }
    if (this.selectedTimeRange === '2h') {
      return transactionTime >= now - 2 * 60 * 60 * 1000 && transactionTime <= now;
    }
    if (this.selectedTimeRange === 'lastWeek') {
      return transactionTime >= now - 7 * 24 * 60 * 60 * 1000 && transactionTime <= now;
    }
    if (this.selectedTimeRange === 'lastMonth') {
      return transactionTime >= now - 30 * 24 * 60 * 60 * 1000 && transactionTime <= now;
    }

    const start = this.customStart ? new Date(`${this.customStart}T00:00:00Z`).getTime() : Number.NEGATIVE_INFINITY;
    const end = this.customEnd ? new Date(`${this.customEnd}T23:59:59Z`).getTime() : Number.POSITIVE_INFINITY;
    return transactionTime >= start && transactionTime <= end;
  }

  private buildTimeBuckets(): Array<{ label: string; start: number; end: number }> {
    const end = new Date(this.snapshot.generatedAt).getTime();

    if (this.selectedTimeRange === '1h') {
      return this.buildHourlyBuckets(4, 15, end);
    }
    if (this.selectedTimeRange === '2h') {
      return this.buildHourlyBuckets(4, 30, end);
    }
    if (this.selectedTimeRange === 'lastMonth') {
      return this.buildDailyBuckets(4, 7, end);
    }
    if (this.selectedTimeRange === 'custom') {
      const start = this.customStart ? new Date(`${this.customStart}T00:00:00Z`).getTime() : end - 7 * 24 * 60 * 60 * 1000;
      const finish = this.customEnd ? new Date(`${this.customEnd}T23:59:59Z`).getTime() : end;
      const totalDays = Math.max(1, Math.ceil((finish - start) / (24 * 60 * 60 * 1000)));
      const stepDays = Math.max(1, Math.ceil(totalDays / 4));
      return this.buildDailyBuckets(4, stepDays, finish);
    }

    return this.buildDailyBuckets(4, 2, end);
  }

  private buildHourlyBuckets(count: number, minutes: number, end: number): Array<{ label: string; start: number; end: number }> {
    const sizeMs = minutes * 60 * 1000;
    return Array.from({ length: count }).map((_, index) => {
      const bucketEnd = end - (count - index - 1) * sizeMs;
      const bucketStart = bucketEnd - sizeMs;
      return {
        label: `${minutes * index + minutes}m`,
        start: bucketStart,
        end: bucketEnd
      };
    });
  }

  private buildDailyBuckets(count: number, days: number, end: number): Array<{ label: string; start: number; end: number }> {
    const sizeMs = days * 24 * 60 * 60 * 1000;
    return Array.from({ length: count }).map((_, index) => {
      const bucketEnd = end - (count - index - 1) * sizeMs;
      const bucketStart = bucketEnd - sizeMs;
      return {
        label: `${days * (index + 1)}d`,
        start: bucketStart,
        end: bucketEnd
      };
    });
  }

  private transactionInBucket(transaction: TransactionRecord, start: number, end: number): boolean {
    const time = new Date(transaction.createdAt).getTime();
    return time >= start && time <= end;
  }

  private estimateUsers(transactions: TransactionRecord[], channel: PaymentChannel): number {
    const multiplier = channel === 'online' ? 17 : 11;
    return transactions.length * multiplier;
  }

  private sumTransactions(transactions: TransactionRecord[]): number {
    return Number(transactions.reduce((sum, transaction) => sum + transaction.amount, 0).toFixed(2));
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
