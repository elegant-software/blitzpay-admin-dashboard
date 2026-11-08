import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { PreparationConfiguration, ProductCategory } from '../models/merchant-catalog.models';
import { NotificationService } from '../notifications/notification.service';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { BranchPreparationComponent } from './branch-preparation.component';

/**
 * Kitchen station per Product Category for one Branch, shown under the Branch selected on the
 * merchant's Branches & products tab. Categories belong to the Merchant but routing is stored per
 * Branch (one kitchen screen shows one station). Each change is saved immediately.
 */
@Component({
  selector: 'app-branch-kitchen-routing',
  standalone: true,
  imports: [CommonModule, FormsModule, BranchPreparationComponent],
  templateUrl: './branch-kitchen-routing.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class BranchKitchenRoutingComponent implements OnChanges, OnDestroy {
  private readonly api = inject(MerchantApiService);
  private readonly notifications = inject(NotificationService);
  private readonly environment = getEnvironmentByKey(environment.defaultEnvironmentKey);

  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) branchId = '';
  @Input() categories: ProductCategory[] = [];

  configuration: PreparationConfiguration | null = null;
  saving = false;
  private request?: Subscription;

  get unassignedCount(): number {
    const defaults = this.configuration?.categoryDefaults ?? {};
    return this.categories.filter(c => !defaults[c.id]).length;
  }

  ngOnChanges(): void {
    this.load();
  }

  private load(): void {
    this.request?.unsubscribe();
    this.configuration = null;
    this.saving = false;
    if (!this.branchId) return;
    this.request = this.api.getPreparationConfiguration(this.environment, 'v1', this.merchantId, this.branchId).subscribe({
      next: configuration => (this.configuration = configuration),
      error: error => this.notifications.apiError(error, 'Unable to load kitchen stations.')
    });
  }

  stationFor(categoryId: string): string {
    return this.configuration?.categoryDefaults[categoryId] ?? '';
  }

  assign(categoryId: string, stationId: string): void {
    if (!this.configuration || this.saving) return;
    const categoryDefaults = { ...this.configuration.categoryDefaults };
    if (stationId) categoryDefaults[categoryId] = stationId;
    else delete categoryDefaults[categoryId];
    this.saving = true;
    // ponytail: last write wins (the API has no version check); fine for one admin editing a Branch at a time.
    this.request = this.api.savePreparationConfiguration(this.environment, 'v1', this.merchantId, this.branchId,
      { ...this.configuration, categoryDefaults }).subscribe({
      next: configuration => {
        this.saving = false;
        this.configuration = configuration;
        this.notifications.success('Kitchen station saved.');
      },
      error: error => {
        this.notifications.apiError(error, 'Unable to save the kitchen station.');
        this.load();
      }
    });
  }

  ngOnDestroy(): void { this.request?.unsubscribe(); }
}
