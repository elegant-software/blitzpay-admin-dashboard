import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MerchantSearchResultItem } from '../models/merchant-catalog.models';

export type MerchantSearchVariant =
  | 'orders'
  | 'appointment'
  | 'compact'
  | 'dashboard'
  | 'settlement'
  | 'assignment'
  | 'catalog';
export type MerchantLocationMode = 'city' | 'city-country' | 'best-effort';

@Component({
  selector: 'app-merchant-search',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule],
  template: `
    <div class="merchant-search" [ngClass]="'merchant-search--' + variant">
      <div class="merchant-search-control">
        <svg *ngIf="variant === 'orders' || variant === 'appointment' || variant === 'catalog'" class="merchant-search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8"></circle>
          <path d="m16 16 5 5"></path>
        </svg>
        <div class="input-group">
          <input
            [id]="inputId"
            [type]="variant === 'orders' || variant === 'appointment' || variant === 'assignment' ? 'search' : 'text'"
            class="form-control"
            [placeholder]="(placeholder | adminTranslate)"
            [ngModel]="query"
            (ngModelChange)="queryChange.emit($event)"
            (keyup.enter)="search.emit()"
            [attr.aria-label]="(ariaLabel | adminTranslate)"
            [attr.aria-describedby]="describedBy"
            [attr.aria-controls]="results.length ? inputId + '-results' : null"
            [attr.aria-expanded]="results.length > 0"
            [disabled]="disabled"
            autocomplete="off"
          />
          <button
            *ngIf="showSearchButton"
            class="btn"
            [class.btn-primary]="variant === 'catalog'"
            [class.btn-outline-secondary]="variant !== 'catalog'"
            type="button"
            [disabled]="disabled || searching || searchDisabled"
            (click)="search.emit()"
          >
            <span *ngIf="searching" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <svg *ngIf="variant === 'catalog' && !searching" class="merchant-search-button-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8"></circle>
              <path d="m16 16 5 5"></path>
            </svg>
            <span>{{ searching ? ((searchingLabel | adminTranslate)) : ((searchLabel | adminTranslate)) }}</span>
          </button>
        </div>
      </div>

      <div
        *ngIf="results.length"
        class="merchant-search-results"
        role="listbox"
        [id]="inputId + '-results'"
        [attr.aria-label]="(resultsLabel | adminTranslate)"
      >
        <button
          *ngFor="let merchant of results"
          class="merchant-search-result"
          type="button"
          role="option"
          [class.merchant-search-result-selected]="merchant.merchantId === selectedMerchantId"
          [attr.aria-selected]="merchant.merchantId === selectedMerchantId"
          (click)="merchantSelected.emit(merchant)"
        >
          <span *ngIf="variant === 'orders' || variant === 'appointment' || variant === 'assignment'" class="merchant-search-result-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M3 10h18M5 10v10h14V10M4 10l1.5-6h13L20 10M9 20v-6h6v6" /></svg>
          </span>
          <span class="merchant-search-result-copy">
            <strong>{{ merchant.merchantName }}</strong>
            <small>
              {{ merchant.merchantCode }}
              <ng-container *ngIf="showLocation"> · </ng-container>
              <ng-container *ngIf="showLocation && locationMode === 'city'">{{ merchant.city || (locationFallback | adminTranslate) }}</ng-container>
              <ng-container *ngIf="showLocation && locationMode === 'best-effort'">{{ merchant.city || merchant.country || (locationFallback | adminTranslate) }}</ng-container>
              <ng-container *ngIf="showLocation && locationMode === 'city-country'">
                {{ merchant.city || (locationFallback | adminTranslate) }}{{ merchant.country ? (', ' + merchant.country) : ('') }}
              </ng-container>
            </small>
          </span>
          <span *ngIf="showMerchantStatus" class="merchant-search-status">{{ (merchant.merchantStatus | adminTranslate) }}</span>
          <span *ngIf="variant === 'orders' || variant === 'appointment'" class="merchant-search-result-arrow" aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  `,
  styleUrl: './merchant-search.component.css',
})
export class MerchantSearchComponent {
  @Input() query = '';
  @Output() queryChange = new EventEmitter<string>();

  @Input() results: MerchantSearchResultItem[] = [];
  @Input() selectedMerchantId: string | null = null;
  @Output() merchantSelected = new EventEmitter<MerchantSearchResultItem>();
  @Output() search = new EventEmitter<void>();

  @Input() inputId = 'merchant-search';
  @Input() ariaLabel = 'Search merchants';
  @Input() describedBy: string | null = null;
  @Input() resultsLabel = 'Merchant search results';
  @Input() placeholder = 'Search by merchant name or code';
  @Input() variant: MerchantSearchVariant = 'settlement';
  @Input() locationMode: MerchantLocationMode = 'best-effort';
  @Input() searchLabel = 'Search';
  @Input() searchingLabel = 'Searching';
  @Input() locationFallback = 'Location not set';
  @Input() searching = false;
  @Input() searchDisabled = false;
  @Input() disabled = false;
  @Input() showSearchButton = true;
  @Input() showLocation = true;
  @Input() showMerchantStatus = false;
}
