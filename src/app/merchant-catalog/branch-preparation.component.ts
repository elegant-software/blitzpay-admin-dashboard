import { inject as injectAdminLocale } from '@angular/core';
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { PreparationConfiguration } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { apiErrorMessage } from '../notifications/notification.service';

@Component({
  selector: 'app-branch-preparation',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule],
  templateUrl: './branch-preparation.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class BranchPreparationComponent implements OnDestroy {
  readonly adminLocale = injectAdminLocale(AdminLocaleService);
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) branchId = '';
  configuration: PreparationConfiguration = { stations: [], categoryDefaults: {}, productOverrides: {} };
  visible = false;
  loading = false;
  saving = false;
  loaded = false;
  error = '';
  private initial = '';
  private request?: Subscription;
  private readonly environment = getEnvironmentByKey(environment.defaultEnvironmentKey);

  /** Emits the saved configuration so pages showing station assignments can refresh. */
  @Output() saved = new EventEmitter<PreparationConfiguration>();

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
    // Fresh load: the save sends the whole configuration, so stale assignments would be overwritten.
    this.request = this.api.getPreparationConfiguration(this.environment, 'v1', this.merchantId, this.branchId).subscribe({
      next: configuration => {
        this.configuration = configuration;
        this.initial = JSON.stringify(this.configuration);
        this.loaded = true;
        this.loading = false;
      },
      error: error => { this.loading = false; this.error = this.toMessage(error); }
    });
  }

  canLeave(): boolean {
    return !this.saving && (!this.dirty || confirm(this.adminLocale.text('Discard unsaved station changes?')));
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
    if (!confirm(this.adminLocale.text('Remove this station and its category and product assignments?'))) return;
    this.configuration.stations = this.configuration.stations.filter(station => station.id !== id);
    for (const mappings of [this.configuration.categoryDefaults, this.configuration.productOverrides]) {
      for (const key of Object.keys(mappings)) if (mappings[key] === id) delete mappings[key];
    }
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
        this.saved.emit(result);
      },
      error: error => { this.saving = false; this.error = this.toMessage(error); }
    });
  }

  ngOnDestroy(): void { this.request?.unsubscribe(); }

  private toMessage(error: HttpErrorResponse): string {
    return apiErrorMessage(error, 'Could not load or save preparation stations.');
  }
}
