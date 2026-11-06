import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { PreparationConfiguration, Product, ProductCategory } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';

@Component({
  selector: 'app-branch-preparation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-preparation.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class BranchPreparationComponent implements OnDestroy {
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) branchId = '';
  @Input() language = 'en';
  configuration: PreparationConfiguration = { stations: [], categoryDefaults: {}, productOverrides: {} };
  categories: ProductCategory[] = [];
  products: Product[] = [];
  visible = false;
  loading = false;
  saving = false;
  loaded = false;
  error = '';
  message = '';
  private initial = '';
  private request?: Subscription;
  private readonly environment = getEnvironmentByKey(environment.defaultEnvironmentKey);

  constructor(private readonly api: MerchantApiService) {}

  get dirty(): boolean { return this.loaded && JSON.stringify(this.configuration) !== this.initial; }
  get valid(): boolean {
    const names = this.configuration.stations.map(station => station.name.trim().toLowerCase());
    return names.every(name => name.length > 0 && name.length <= 100) && new Set(names).size === names.length;
  }

  open(): void {
    if (this.visible) return;
    this.visible = true;
    this.loaded = false;
    this.loading = true;
    this.error = '';
    this.message = '';
    this.request = forkJoin({
      configuration: this.api.getPreparationConfiguration(this.environment, 'v1', this.merchantId, this.branchId),
      categories: this.api.getProductCategories(this.environment, 'v1', this.merchantId, this.language),
      products: this.api.getProducts(this.environment, 'v1', this.merchantId, this.branchId, true, this.language),
    }).subscribe({
      next: result => {
        this.configuration = result.configuration;
        this.categories = result.categories;
        this.products = result.products;
        this.initial = JSON.stringify(this.configuration);
        this.loaded = true;
        this.loading = false;
      },
      error: error => { this.loading = false; this.error = this.toMessage(error); }
    });
  }

  canLeave(): boolean {
    return !this.saving && (!this.dirty || confirm('Discard unsaved preparation settings?'));
  }

  close(): void {
    if (!this.canLeave()) return;
    this.request?.unsubscribe();
    this.visible = false;
    this.loaded = false;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty || this.saving) event.preventDefault();
  }

  addStation(): void {
    if (!this.loaded || this.saving || this.configuration.stations.length >= 50) return;
    this.configuration.stations.push({ id: crypto.randomUUID(), name: '' });
  }

  removeStation(id: string): void {
    if (this.saving) return;
    if (!confirm('Remove this station and its category and product assignments?')) return;
    this.configuration.stations = this.configuration.stations.filter(station => station.id !== id);
    for (const mappings of [this.configuration.categoryDefaults, this.configuration.productOverrides]) {
      for (const key of Object.keys(mappings)) if (mappings[key] === id) delete mappings[key];
    }
  }

  assign(kind: 'categoryDefaults' | 'productOverrides', id: string, stationId: string): void {
    if (stationId) this.configuration[kind][id] = stationId;
    else delete this.configuration[kind][id];
  }

  save(): void {
    if (!this.loaded || this.saving || !this.valid) return;
    this.saving = true;
    this.error = '';
    const payload = { ...this.configuration, stations: this.configuration.stations.map(station => ({ ...station, name: station.name.trim() })) };
    this.request = this.api.savePreparationConfiguration(this.environment, 'v1', this.merchantId, this.branchId, payload).subscribe({
      next: result => {
        this.configuration = result;
        this.initial = JSON.stringify(result);
        this.saving = false;
        this.visible = false;
        this.message = 'Preparation settings saved.';
      },
      error: error => { this.saving = false; this.error = this.toMessage(error); }
    });
  }

  ngOnDestroy(): void { this.request?.unsubscribe(); }

  private toMessage(error: HttpErrorResponse): string {
    return error.error?.detail || error.error?.message || error.error?.error ||
      (error.status === 0 ? 'Could not reach the server.' : 'Could not load or save preparation settings.');
  }
}
