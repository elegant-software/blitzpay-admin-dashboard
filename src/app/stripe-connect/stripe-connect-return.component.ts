import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MerchantApiService } from '../services/merchant-api.service';
import { PaymentAccountStatus, StripeConnectStatusResponse } from '../models/merchant-catalog.models';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { EnvironmentKey } from '../models/merchant-catalog.models';
import { apiErrorMessage } from '../notifications/notification.service';

@Component({
  selector: 'app-stripe-connect-return',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5" style="max-width: 540px">
      <div class="card shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Payment Account — Stripe Connect</span>
          <ng-container [ngSwitch]="status">
            <span *ngSwitchCase="'connected'" class="status-tag status-tag-success">Connected</span>
            <span *ngSwitchCase="'verifying'" class="status-tag status-tag-warning">Verifying</span>
            <span *ngSwitchCase="'not_connected'" class="status-tag status-tag-neutral">Not Connected</span>
            <span *ngSwitchCase="'error'" class="status-tag status-tag-danger">Error</span>
            <span *ngSwitchCase="'loading'" class="status-tag status-tag-neutral">Loading…</span>
          </ng-container>
        </div>
        <div class="card-body d-flex flex-column gap-3">

          <p class="mb-0" *ngIf="redirecting">
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Refreshing onboarding link…
          </p>

          <ng-container *ngIf="!redirecting">
            <p class="mb-0 text-muted small" *ngIf="status === 'loading'">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Loading payment account status…
            </p>
            <p class="mb-0 text-muted small" *ngIf="status === 'connected'">
              The Stripe Express account is active and charges are enabled. You can close this tab and return to the admin dashboard.
            </p>
            <p class="mb-0 text-muted small" *ngIf="status === 'verifying'">
              Stripe account details have been submitted and are under review. No further action is needed right now.
            </p>
            <p class="mb-0 text-muted small" *ngIf="status === 'not_connected'">
              The Stripe onboarding was not completed. Return to the merchant catalog to try again.
            </p>
            <p class="mb-0 text-muted small text-danger" *ngIf="status === 'error'">
              Could not load payment account status. Please return to the merchant catalog and try again.
            </p>
            <div *ngIf="errorMessage" class="alert alert-danger py-1 px-2 mb-0 small">{{ errorMessage }}</div>
            <div *ngIf="status !== 'loading'">
              <a routerLink="/" class="btn btn-outline-secondary btn-sm">Back to Merchant Catalog</a>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class StripeConnectReturnComponent implements OnInit {
  status: PaymentAccountStatus = 'loading';
  redirecting = false;
  errorMessage: string | null = null;

  private merchantId = '';
  private envKey: EnvironmentKey = 'aws-staging';
  private apiVersion = 'v1';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly merchantApi: MerchantApiService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.merchantId = params.get('merchantId') ?? '';
    this.envKey = (params.get('env') ?? 'aws-staging') as EnvironmentKey;
    this.apiVersion = params.get('apiVersion') ?? 'v1';
    const isRefresh = params.get('refresh') === 'true';

    if (!this.merchantId) {
      this.status = 'error';
      this.errorMessage = 'Missing merchantId in return URL.';
      return;
    }

    if (isRefresh) {
      this.handleRefresh();
    } else {
      this.loadStatus();
    }
  }

  private loadStatus(): void {
    const env = getEnvironmentByKey(this.envKey);
    this.merchantApi.getStripeConnectStatus(env, this.apiVersion, this.merchantId).subscribe({
      next: (data: StripeConnectStatusResponse) => {
        if (data.connected && data.chargesEnabled) {
          this.status = 'connected';
        } else if (data.detailsSubmitted) {
          this.status = 'verifying';
        } else {
          this.status = 'not_connected';
        }
      },
      error: () => {
        this.status = 'error';
      }
    });
  }

  private handleRefresh(): void {
    this.redirecting = true;
    const env = getEnvironmentByKey(this.envKey);
    const origin = window.location.origin;
    const base = `${origin}/stripe-connect/return?merchantId=${this.merchantId}&env=${this.envKey}&apiVersion=${this.apiVersion}`;
    const returnUrl = base;
    const refreshUrl = `${base}&refresh=true`;

    this.merchantApi.refreshStripeConnect(env, this.apiVersion, this.merchantId, returnUrl, refreshUrl).subscribe({
      next: (res) => {
        window.location.href = res.onboardingUrl;
      },
      error: (err) => {
        this.redirecting = false;
        this.status = 'error';
        this.errorMessage = apiErrorMessage(err, 'Failed to refresh onboarding link.');
      }
    });
  }
}
