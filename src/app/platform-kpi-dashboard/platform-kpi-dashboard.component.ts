import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { environment as appEnv } from '../../environments/environment';
import { BackendEnvironment, MerchantSearchResultItem } from '../models/merchant-catalog.models';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { MerchantApiService } from '../services/merchant-api.service';
import { PlatformKpiService } from '../services/platform-kpi.service';
import { MerchantSearchComponent } from '../shared/merchant-search.component';
import {
  PlatformKpiReport,
  PaymentMethodFrequency,
  OrderTypeCount,
} from './platform-kpi-dashboard.models';

@Component({
  selector: 'app-platform-kpi-dashboard',
  standalone: true,
  imports: [DisplayDatePipe, AdminTranslatePipe, CommonModule, FormsModule, MerchantSearchComponent],
  templateUrl: './platform-kpi-dashboard.component.html',
  styleUrl: './platform-kpi-dashboard.component.css',
})
export class PlatformKpiDashboardComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  readonly environment: BackendEnvironment;
  readonly apiVersion = 'v1';

  from: string;
  to: string;
  merchantQuery = '';
  merchantResults: MerchantSearchResultItem[] = [];
  selectedMerchant: MerchantSearchResultItem | null = null;

  report: PlatformKpiReport | null = null;
  loading = false;


  constructor(
    private readonly kpiService: PlatformKpiService,
    private readonly merchantApiService: MerchantApiService,
  ) {
    this.environment = getEnvironmentByKey(appEnv.defaultEnvironmentKey);
    const now = new Date();
    this.to = this.toIsoDate(now);
    this.from = this.toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30));
  }

  ngOnInit(): void {
    this.load();
  }

  searchMerchants(): void {
    const q = this.merchantQuery.trim();
    if (!q) return;
    this.merchantApiService.searchMerchants(this.environment, this.apiVersion, { q, page: 0 }).subscribe({
      next: (response) => { this.merchantResults = response.results; },
    });
  }

  selectMerchant(m: MerchantSearchResultItem): void {
    this.selectedMerchant = m;
    this.merchantResults = [];
  }

  clearMerchant(): void {
    this.selectedMerchant = null;
    this.merchantQuery = '';
    this.merchantResults = [];
  }

  load(): void {
    this.loading = true;

    this.kpiService
      .getReport(
        this.environment,
        this.apiVersion,
        this.from,
        this.to,
        this.selectedMerchant?.merchantId || undefined,
      )
      .subscribe({
        next: (data) => {
          this.report = data;
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.notifications.apiError(err, 'Failed to load platform KPI data.');
          this.loading = false;
        },
      });
  }

  get isDrillDown(): boolean {
    return !!this.report?.merchantId;
  }

  get selectedMerchantName(): string {
    return this.selectedMerchant?.merchantName ?? '';
  }

  formatMinor(minor: number, currency: string): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(minor / 100);
  }

  trackByMethod(_: number, item: PaymentMethodFrequency): string {
    return item.paymentMethod;
  }

  trackByOrderType(_: number, item: OrderTypeCount): string {
    return item.orderType;
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

}
