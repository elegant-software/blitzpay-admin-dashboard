import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { Branch, PreparationConfiguration, ProductCategory } from '../models/merchant-catalog.models';
import { NotificationService } from '../notifications/notification.service';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { BranchPreparationComponent } from './branch-preparation.component';

/**
 * Kitchen station per Product Category, shown on the merchant Categories tab.
 * Categories belong to the Merchant but routing is stored per Branch (one screen shows one station),
 * so a Branch picker selects which Branch's routing is edited. Each change is saved immediately.
 */
@Component({
  selector: 'app-category-kitchen-routing',
  standalone: true,
  imports: [CommonModule, FormsModule, BranchPreparationComponent],
  templateUrl: './category-kitchen-routing.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class CategoryKitchenRoutingComponent implements OnChanges, OnDestroy {
  private readonly api = inject(MerchantApiService);
  private readonly notifications = inject(NotificationService);
  private readonly environment = getEnvironmentByKey(environment.defaultEnvironmentKey);

  @Input({ required: true }) merchantId = '';
  @Input() branches: Branch[] = [];
  @Input() categories: ProductCategory[] = [];

  branchId = '';
  configuration: PreparationConfiguration | null = null;
  saving = false;
  private request?: Subscription;

  get branchOptions(): { id: string; name: string }[] {
    return this.branches.flatMap(b => (b.branchId ?? b.id) ? [{ id: (b.branchId ?? b.id)!, name: b.name }] : []);
  }

  get unassignedCount(): number {
    const defaults = this.configuration?.categoryDefaults ?? {};
    return this.categories.filter(c => !defaults[c.id]).length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['branches'] && !changes['merchantId']) return;
    const options = this.branchOptions;
    if (!options.some(o => o.id === this.branchId)) this.selectBranch(options[0]?.id ?? '');
  }

  selectBranch(branchId: string): void {
    this.request?.unsubscribe();
    this.branchId = branchId;
    this.configuration = null;
    if (!branchId) return;
    this.request = this.api.getPreparationConfiguration(this.environment, 'v1', this.merchantId, branchId).subscribe({
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
    const branchId = this.branchId;
    this.saving = true;
    // ponytail: last write wins (the API has no version check); fine for one admin editing a Branch at a time.
    this.request = this.api.savePreparationConfiguration(this.environment, 'v1', this.merchantId, branchId,
      { ...this.configuration, categoryDefaults }).subscribe({
      next: configuration => { this.saving = false; this.configuration = configuration; },
      error: error => {
        this.saving = false;
        this.notifications.apiError(error, 'Unable to save the kitchen station.');
        this.selectBranch(branchId);
      }
    });
  }

  ngOnDestroy(): void { this.request?.unsubscribe(); }
}
