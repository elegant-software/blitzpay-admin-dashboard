import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import {
  MerchantSearchRequest,
  MerchantSearchResultItem,
  MerchantSearchResponse,
  MerchantVerticalResponse,
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-merchant-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PaginatorModule],
  templateUrl: './merchant-catalog.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class MerchantCatalogComponent implements OnInit {
  selectedEnvironmentKey: 'local' | 'staging' = environment.defaultEnvironmentKey;
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
  errorMessage = '';
  statusMessage = '';

  verticals: MerchantVerticalResponse[] = [];
  verticalsLoading = false;

  readonly merchantStatusOptions = [
    'DRAFT', 'SUBMITTED', 'VERIFICATION', 'SCREENING', 'RISK_REVIEW',
    'DECISION_PENDING', 'SETUP', 'ACTIVE', 'MONITORING', 'ACTION_REQUIRED', 'REJECTED'
  ];
  readonly merchantMobilityOptions = ['BRICK_AND_MORTAR', 'MOBILE'];

  get selectedEnvironment() {
    return getEnvironmentByKey(this.selectedEnvironmentKey);
  }

  get activeSearchHint(): string {
    return 'Search by name, code, city, product, or apply filters. Leave blank to list recently updated merchants.';
  }

  constructor(
    private readonly merchantApi: MerchantApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.verticalsLoading = true;
    this.merchantApi.getVerticals(this.selectedEnvironment, this.apiVersion).subscribe({
      next: (verticals) => { this.verticals = verticals; this.verticalsLoading = false; },
      error: () => { this.verticalsLoading = false; }
    });
  }

  runCatalogSearch(page = 0): void {
    this.errorMessage = '';
    this.statusMessage = '';
    this.searchLoading = true;
    this.searchPage = page;

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
        this.searchResults = response.results;
        this.searchPage = response.page;
        this.searchTotalPages = response.totalPages;
        this.searchTotalElements = response.totalElements;
        this.searchLoading = false;
      },
      error: (error) => {
        this.searchLoading = false;
        this.errorMessage = this.toMessage(error, 'Search failed. Please try again.');
      }
    });
  }

  selectSearchResult(item: MerchantSearchResultItem): void {
    this.router.navigate(['/merchants', item.applicationId]);
  }

  goToSearchPage(page: number): void {
    this.runCatalogSearch(page);
  }

  clearCatalogSearch(): void {
    this.searchQuery = '';
    this.searchFilterBusinessTypes = [];
    this.searchFilterMobilities = [];
    this.searchFilterStatuses = [];
    this.searchResults = [];
    this.searchPage = 0;
    this.searchTotalPages = 0;
    this.searchTotalElements = 0;
    this.errorMessage = '';
    this.statusMessage = '';
  }

  merchantStatusTone(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized === 'active') return 'status-tag-success';
    if (normalized.includes('review') || normalized.includes('pending') || normalized.includes('screening')) return 'status-tag-warning';
    if (normalized.includes('rejected') || normalized.includes('action_required')) return 'status-tag-danger';
    return 'status-tag-neutral';
  }

  verticalDisplayName(code: string): string {
    return this.verticals.find(v => v.code === code)?.displayName ?? code;
  }

  private toMessage(error: unknown, fallback: string): string {
    const body = (error as { error?: { detail?: string; message?: string } })?.error;
    return body?.detail || body?.message || fallback;
  }
}
