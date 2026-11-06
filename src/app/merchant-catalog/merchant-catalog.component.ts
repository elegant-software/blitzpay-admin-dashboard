import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  EnvironmentKey,
  MerchantSearchRequest,
  MerchantSearchResultItem,
  MerchantSearchResponse,
  MerchantVerticalResponse,
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { MerchantSearchComponent } from '../shared/merchant-search.component';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-merchant-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DisplayDatePipe, MultiSelectModule, MerchantSearchComponent],
  templateUrl: './merchant-catalog.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class MerchantCatalogComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private searchRequestId = 0;

  selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  searchQuery = '';
  searchFilterBusinessTypes: string[] = [];
  searchFilterMobilities: string[] = [];
  searchFilterStatuses: string[] = [];
  searchResults: MerchantSearchResultItem[] = [];
  searchPage = 0;
  searchTotalPages = 0;
  searchTotalElements = 0;
  searchLoading = false;
  searchAttempted = false;
  searchFailed = false;
  statusMessage = '';

  verticals: MerchantVerticalResponse[] = [];
  verticalsLoading = false;
  verticalsError = '';

  readonly merchantStatusOptions = [
    'DRAFT', 'SUBMITTED', 'VERIFICATION', 'SCREENING', 'RISK_REVIEW',
    'DECISION_PENDING', 'SETUP', 'ACTIVE', 'MONITORING', 'ACTION_REQUIRED', 'REJECTED'
  ];
  readonly merchantStatusFilterOptions = this.merchantStatusOptions.map((value) => ({
    value,
    label: this.merchantStatusLabel(value),
  }));
  readonly merchantMobilityFilterOptions = [
    { value: 'BRICK_AND_MORTAR', label: 'Brick & Mortar' },
    { value: 'MOBILE', label: 'Mobile' },
  ];
  get selectedEnvironment() {
    return getEnvironmentByKey(this.selectedEnvironmentKey);
  }

  get activeFilterCount(): number {
    return this.searchFilterBusinessTypes.length +
      this.searchFilterMobilities.length +
      this.searchFilterStatuses.length;
  }

  constructor(private readonly merchantApi: MerchantApiService) {}

  ngOnInit(): void {
    this.verticalsLoading = true;
    this.merchantApi.getVerticals(this.selectedEnvironment, this.apiVersion).subscribe({
      next: (verticals) => { this.verticals = verticals; this.verticalsLoading = false; },
      error: () => {
        this.verticalsLoading = false;
        this.verticalsError = 'Business type filters could not be loaded.';
      }
    });
    this.runCatalogSearch();
  }

  runCatalogSearch(page = 0): void {
    const requestId = ++this.searchRequestId;
    this.searchFailed = false;
    this.statusMessage = '';
    this.searchLoading = true;
    this.searchAttempted = true;
    this.searchPage = page;
    this.searchResults = [];
    this.searchTotalElements = 0;
    this.searchTotalPages = 0;

    const request: MerchantSearchRequest = {
      q: this.searchQuery.trim() || undefined,
      businessTypes: this.searchFilterBusinessTypes.length ? [...this.searchFilterBusinessTypes] : undefined,
      merchantMobilities: this.searchFilterMobilities.length ? [...this.searchFilterMobilities] : undefined,
      statuses: this.searchFilterStatuses.length ? [...this.searchFilterStatuses] : undefined,
      page,
      size: 50,
    };

    this.merchantApi.searchMerchants(this.selectedEnvironment, this.apiVersion, request).subscribe({
      next: (response: MerchantSearchResponse) => {
        if (requestId !== this.searchRequestId) return;
        this.searchResults = response.results;
        this.searchPage = response.page;
        this.searchTotalPages = response.totalPages;
        this.searchTotalElements = response.totalElements;
        this.searchLoading = false;
        this.statusMessage = response.totalElements === 0
          ? 'No merchants found.'
          : `Showing ${response.results.length} of ${response.totalElements} merchants.`;
      },
      error: (error) => {
        if (requestId !== this.searchRequestId) return;
        this.searchLoading = false;
        this.searchFailed = true; this.notifications.apiError(error, 'Search failed. Please try again.');
      }
    });
  }

  goToSearchPage(page: number): void {
    this.runCatalogSearch(page);
  }

  clearCatalogSearch(): void {
    this.searchQuery = '';
    this.searchFilterBusinessTypes = [];
    this.searchFilterMobilities = [];
    this.searchFilterStatuses = [];
    this.searchPage = 0;
    this.runCatalogSearch();
  }

  merchantStatusTone(status: string): string {
    const normalized = status.toLowerCase().replace(/[\s-]+/g, '_');
    if (normalized === 'active') return 'status-tag-success';
    if (normalized.includes('review') || normalized.includes('pending') || normalized.includes('screening')) return 'status-tag-warning';
    if (normalized.includes('rejected') || normalized.includes('action_required')) return 'status-tag-danger';
    return 'status-tag-neutral';
  }

  merchantStatusLabel(status: string): string {
    return status
      .toLowerCase()
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  merchantMobilityLabel(mobility: string): string {
    const normalized = mobility.toUpperCase();
    if (normalized === 'BRICK_AND_MORTAR') return 'Brick & Mortar';
    if (normalized === 'MOBILE') return 'Mobile';
    return mobility || '—';
  }

  verticalDisplayName(code: string): string {
    return this.verticals.find(v => v.code === code)?.displayName ?? code;
  }

}
