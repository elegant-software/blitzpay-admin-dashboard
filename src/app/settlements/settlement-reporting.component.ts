import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment as appEnv } from '../../environments/environment';
import { BackendEnvironment, Merchant, MerchantSearchResultItem } from '../models/merchant-catalog.models';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { MerchantApiService } from '../services/merchant-api.service';
import { SettlementReportingService } from '../services/settlement-reporting.service';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import {
  SettlementPageResponse,
  SettlementRow,
  SettlementSummaryResponse,
} from './settlement-reporting.models';

@Component({
  selector: 'app-settlement-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe],
  templateUrl: './settlement-reporting.component.html',
})
export class SettlementReportingComponent implements OnInit {
  readonly environment: BackendEnvironment;
  readonly apiVersion = 'v1';

  merchantId = '';
  merchantQuery = '';
  merchantResults: MerchantSearchResultItem[] = [];
  selectedMerchant: MerchantSearchResultItem | null = null;

  from: string;
  to: string;

  summary: SettlementSummaryResponse | null = null;
  page: SettlementPageResponse | null = null;
  currentPage = 0;
  pageSize = 20;

  loadingSummary = false;
  loadingList = false;
  errorSummary: string | null = null;
  errorList: string | null = null;

  refreshing = false;
  refreshMessage: string | null = null;
  refreshError: string | null = null;

  constructor(
    private readonly reportingService: SettlementReportingService,
    private readonly merchantApi: MerchantApiService,
    private readonly route: ActivatedRoute,
  ) {
    this.environment = getEnvironmentByKey(appEnv.defaultEnvironmentKey);
    const now = new Date();
    this.to = this.toIsoDate(now);
    this.from = this.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  ngOnInit(): void {
    const merchantId = this.route.snapshot.queryParamMap.get('merchantId');
    if (merchantId) {
      this.merchantApi.getMerchant(this.environment, this.apiVersion, merchantId).subscribe({
        next: (merchant) => {
          this.selectMerchant(this.merchantToSearchItem(merchant));
          this.load();
        },
      });
    }
  }

  get rows(): SettlementRow[] {
    return this.page?.content ?? [];
  }

  get totalPages(): number {
    return this.page?.totalPages ?? 0;
  }

  get totalElements(): number {
    return this.page?.totalElements ?? 0;
  }

  formatMinor(minor: number, currency: string): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(minor / 100);
  }

  get visibleStripeRows(): SettlementRow[] {
    return this.rows.filter(row => row.provider === 'STRIPE');
  }

  searchMerchants(): void {
    const q = this.merchantQuery.trim();
    if (!q) return;
    this.merchantApi.searchMerchants(this.environment, this.apiVersion, { q, page: 0 }).subscribe({
      next: response => { this.merchantResults = response.results; },
    });
  }

  selectMerchant(m: MerchantSearchResultItem): void {
    this.selectedMerchant = m;
    this.merchantId = m.applicationId;
    this.merchantResults = [];
  }

  clearMerchant(): void {
    this.selectedMerchant = null;
    this.merchantId = '';
    this.merchantQuery = '';
    this.merchantResults = [];
    this.summary = null;
    this.page = null;
  }

  load(): void {
    if (!this.merchantId.trim()) return;
    this.currentPage = 0;
    this.loadSummary();
    this.loadList();
  }

  refreshVisible(): void {
    const paymentRequestIds = this.visibleStripeRows.map(row => row.paymentRequestId);
    if (!this.merchantId.trim() || paymentRequestIds.length === 0) return;

    this.refreshing = true;
    this.refreshMessage = null;
    this.refreshError = null;
    this.reportingService
      .refreshVisible(
        this.environment,
        this.apiVersion,
        this.merchantId.trim(),
        paymentRequestIds,
      )
      .subscribe({
        next: result => {
          this.refreshing = false;
          this.refreshMessage =
            `Stripe refresh complete: ${result.refreshed} refreshed, ` +
            `${result.skipped} skipped, ${result.failed} failed.`;
          this.loadSummary();
          this.loadList();
        },
        error: (error: HttpErrorResponse) => {
          this.refreshing = false;
          this.refreshError = this.errorMessage(error, 'Failed to refresh settlements from Stripe.');
        },
      });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadList();
  }

  private loadSummary(): void {
    this.loadingSummary = true;
    this.errorSummary = null;
    this.reportingService
      .getSummary(this.environment, this.apiVersion, this.merchantId.trim(), this.from, this.to)
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.loadingSummary = false;
        },
        error: () => {
          this.errorSummary = 'Failed to load settlement summary.';
          this.loadingSummary = false;
        },
      });
  }

  private loadList(): void {
    this.loadingList = true;
    this.errorList = null;
    this.reportingService
      .getList(
        this.environment,
        this.apiVersion,
        this.merchantId.trim(),
        this.from,
        this.to,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (data) => {
          this.page = data;
          this.loadingList = false;
        },
        error: () => {
          this.errorList = 'Failed to load settlement list.';
          this.loadingList = false;
        },
      });
  }

  private merchantToSearchItem(merchant: Merchant): MerchantSearchResultItem {
    return {
      applicationId: merchant.applicationId,
      merchantName: merchant.merchantName,
      legalBusinessName: merchant.legalBusinessName ?? '',
      merchantCode: merchant.merchantCode,
      city: null,
      country: null,
      businessType: merchant.businessType ?? '',
      merchantMobility: merchant.merchantMobility ?? '',
      status: merchant.status,
      lastUpdatedAt: merchant.lastUpdatedAt,
    };
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private errorMessage(error: HttpErrorResponse, fallback: string): string {
    return error.error?.error?.detail
      ?? error.error?.detail
      ?? error.error?.error?.message
      ?? error.error?.message
      ?? fallback;
  }
}
