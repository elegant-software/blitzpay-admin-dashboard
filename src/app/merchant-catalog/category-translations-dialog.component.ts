import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { EnvironmentKey, MenuLanguage, ProductCategory } from '../models/merchant-catalog.models';
import { TranslationRow, isRightToLeft, languageLabel, toTranslationRow } from '../menu-language/menu-language';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';

/** Edits a Product Category's Category Translations, one row per Supported Menu Language. */
@Component({
  selector: 'app-category-translations-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './merchant-catalog.component.css',
  template: `
    <div class="product-dialog-backdrop">
      <div class="product-dialog card" role="dialog" aria-modal="true" aria-labelledby="category-translations-title">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 id="category-translations-title" class="mb-0">Translations — {{ category.name }}</h5>
          <button class="btn btn-sm btn-outline-secondary" type="button" (click)="close()">Close</button>
        </div>
        <div class="card-body">
          <p class="form-text mt-0">Original name: <strong>{{ category.name }}</strong>. Edits made here are kept when the menu is re-translated.</p>
          <div *ngIf="loading" class="text-muted">Loading…</div>
          <div class="border rounded p-3 mb-3" *ngFor="let row of rows">
            <div class="d-flex align-items-center gap-2 mb-2">
              <label class="form-label mb-0 fw-semibold" [for]="'cat-tr-' + row.language">{{ label(row.language) }}</label>
              <span class="status-tag status-tag-neutral" *ngIf="!row.exists">Not translated</span>
              <span class="status-tag status-tag-warning" *ngIf="row.stale">Needs re-translation</span>
              <span class="status-tag status-tag-success" *ngIf="row.origin === 'MERCHANT'">Merchant</span>
              <span class="status-tag status-tag-neutral" *ngIf="row.origin === 'MACHINE'">Machine</span>
            </div>
            <input class="form-control form-control-sm" [id]="'cat-tr-' + row.language" maxlength="100" [(ngModel)]="row.name"
                   [dir]="direction(row.language)" />
            <div class="alert alert-danger py-1 px-2 small mt-2 mb-0" *ngIf="row.error">{{ row.error }}</div>
            <div class="d-flex gap-2 mt-2">
              <button class="btn btn-sm btn-outline-primary" type="button" [disabled]="row.saving" (click)="save(row)">
                {{ row.saving ? 'Saving…' : 'Save' }}
              </button>
              <button class="btn btn-sm btn-outline-danger" type="button" *ngIf="row.exists" [disabled]="row.saving" (click)="delete(row)">Delete</button>
            </div>
          </div>
          <div class="alert alert-danger mb-3" *ngIf="dialogError">{{ dialogError }}</div>
          <div class="dialog-actions">
            <button class="btn btn-outline-secondary" type="button" (click)="close()">Done</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoryTranslationsDialogComponent implements OnInit {
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) category!: ProductCategory;
  @Input() supportedLanguages: string[] = [];
  @Input() menuLanguages: MenuLanguage[] = [];
  @Output() readonly closed = new EventEmitter<void>();

  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  rows: TranslationRow[] = [];
  loading = false;
  dialogError = '';

  constructor(private readonly merchantApi: MerchantApiService) {}

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.dialogError = '';
    this.merchantApi.getCategoryTranslations(this.selectedEnvironment, this.apiVersion, this.merchantId, this.category.id).subscribe({
      next: (translations) => {
        this.rows = this.supportedLanguages.map((language) => toTranslationRow(language, translations.find((t) => t.language === language)));
        this.loading = false;
      },
      error: (error) => { this.loading = false; this.dialogError = toMessage(error, 'Failed to load translations.'); }
    });
  }

  label(code: string): string { return languageLabel(code, this.menuLanguages); }

  direction(code: string): 'rtl' | 'ltr' { return isRightToLeft(code) ? 'rtl' : 'ltr'; }

  save(row: TranslationRow): void {
    if (row.saving) return;
    row.error = '';
    if (!row.name.trim()) { row.error = 'Enter the translated name.'; return; }
    row.saving = true;
    this.merchantApi.saveCategoryTranslation(this.selectedEnvironment, this.apiVersion, this.merchantId, this.category.id, row.language, {
      name: row.name.trim(),
    }).subscribe({
      next: (saved) => Object.assign(row, toTranslationRow(row.language, saved)),
      error: (error) => { row.saving = false; row.error = toMessage(error, 'Failed to save translation.'); }
    });
  }

  delete(row: TranslationRow): void {
    if (row.saving || !row.exists) return;
    if (!confirm(`Delete the ${this.label(row.language)} translation?`)) return;
    row.saving = true;
    row.error = '';
    this.merchantApi.deleteCategoryTranslation(this.selectedEnvironment, this.apiVersion, this.merchantId, this.category.id, row.language).subscribe({
      next: () => Object.assign(row, toTranslationRow(row.language)),
      error: (error) => { row.saving = false; row.error = toMessage(error, 'Failed to delete translation.'); }
    });
  }

  close(): void { this.closed.emit(); }
}

function toMessage(error: unknown, fallback: string): string {
  const body = (error as { error?: { detail?: string; message?: string; error?: unknown } })?.error;
  const apiError = typeof body?.error === 'string' ? body.error : undefined;
  return body?.detail || body?.message || apiError || fallback;
}
