import { CommonModule, DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { Component, HostListener, Input, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, Subscription, switchMap, map } from 'rxjs';
import { BackendEnvironment, Branch } from '../models/merchant-catalog.models';
import { BrandingResponse, BrandingSettings, EffectiveBranding } from '../models/merchant-branding.models';
import { MerchantApiService } from '../services/merchant-api.service';

const EMPTY: BrandingSettings = { enabled: null, displayName: null, logoStorageKey: null, primaryColor: null, accentColor: null };
const PRIMARY = '#00C2FF';
const ACCENT = '#5856D6';
type BrandField = 'displayName' | 'logoStorageKey' | 'primaryColor' | 'accentColor';

@Component({
  selector: 'app-merchant-branding', standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './merchant-branding.component.html',
  styleUrls: ['./merchant-branding.component.css'],
})
export class MerchantBrandingComponent implements OnDestroy {
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) merchantName = '';
  @Input() merchantLogo: string | null = null;
  @Input() branches: Branch[] = [];
  @Input({ required: true }) backendEnvironment!: BackendEnvironment;
  private readonly document = inject(DOCUMENT);
  visible = false;
  loading = false;
  loaded = false;
  saving = false;
  uploading = false;
  scope = '';
  draft: BrandingSettings = { ...EMPTY };
  parent: BrandingResponse | null = null;
  current: BrandingResponse | null = null;
  error = '';
  message = '';
  fieldErrors: Record<string, string[]> = {};
  readonly colorFields: Array<'primaryColor' | 'accentColor'> = ['primaryColor', 'accentColor'];
  readonly previewTabs: Array<'menu' | 'cart' | 'checkout'> = ['menu', 'cart', 'checkout'];
  previewTab: 'menu' | 'cart' | 'checkout' = 'menu';
  private initial = '';
  private request?: Subscription;
  private objectUrl: string | null = null;
  private previousOverflow = '';

  constructor(private readonly api: MerchantApiService) {}
  get busy(): boolean { return this.saving || this.uploading; }
  get dirty(): boolean { return this.loaded && JSON.stringify(this.payload()) !== this.initial; }
  get valid(): boolean {
    return (!this.draft.displayName || (!!this.draft.displayName.trim() && this.draft.displayName.length <= 120)) &&
      [this.draft.primaryColor, this.draft.accentColor].every(color => !color || /^#[0-9a-fA-F]{6}$/.test(color));
  }
  get parentDisabled(): boolean { return !!this.scope && this.parent?.settings.enabled !== true; }
  get resetLabel(): string { return this.scope ? 'Use merchant setting' : 'Use platform default'; }
  get scopeLabel(): string { return this.branches.find(branch => this.branchKey(branch) === this.scope)?.name || 'Merchant defaults'; }
  branchKey(branch: Branch): string { return branch.id || branch.branchId || ''; }
  open(): void {
    this.visible = true; this.error = ''; this.message = ''; this.scope = '';
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden'; this.load();
  }
  private load(): void {
    this.request?.unsubscribe(); this.releasePreview();
    this.loading = true; this.loaded = false; this.error = ''; this.message = ''; this.fieldErrors = {};
    this.request = forkJoin({
      parent: this.api.getBranding(this.backendEnvironment, 'v1', this.merchantId),
      branch: this.scope ? this.api.getBranding(this.backendEnvironment, 'v1', this.merchantId, this.scope) : of(null),
    }).subscribe({
      next: ({ parent, branch }) => { this.parent = parent; this.accept(branch ?? parent); this.loading = false; },
      error: error => { this.loading = false; this.showError(error, 'Could not load branding. Please try again.'); },
    });
  }
  retry(): void { if (!this.busy) this.load(); }
  selectScope(scope: string): boolean {
    if (this.busy || (this.dirty && !window.confirm('Discard unsaved branding changes?'))) return false;
    this.scope = scope; this.load(); return true;
  }
  selectScopeElement(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (!this.selectScope(select.value)) select.value = this.scope;
  }
  reset(field: BrandField): void {
    this.draft[field] = null;
    if (field === 'logoStorageKey') this.releasePreview();
    delete this.fieldErrors[field];
  }
  save(): void {
    if (!this.loaded || !this.valid || !this.dirty || this.busy) return;
    this.saving = true; this.error = ''; this.fieldErrors = {};
    this.request = this.api.saveBranding(this.backendEnvironment, 'v1', this.merchantId, this.payload(), this.scope || undefined).subscribe({
      next: response => {
        if (!this.scope) this.parent = response;
        this.accept(response); this.releasePreview(); this.saving = false;
        this.message = 'Branding published. Shoppers see the update when they next open this merchant or branch.';
      },
      error: error => { this.saving = false; this.showError(error, 'Could not publish branding. Your changes are still here.'); },
    });
  }
  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file || this.busy || !this.loaded) return;
    this.error = '';
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { this.error = 'Choose a PNG, JPG or WebP image.'; return; }
    if (file.size > 5 * 1024 * 1024) { this.error = 'Choose an image smaller than 5 MB.'; return; }
    this.uploading = true;
    this.request = this.api.createBrandingLogoUpload(this.backendEnvironment, 'v1', this.merchantId, file.type, this.scope || undefined).pipe(
      switchMap(upload => this.api.uploadMerchantLogo(upload.uploadUrl, file).pipe(map(() => upload)))
    ).subscribe({
      next: upload => {
        this.releasePreview(); this.objectUrl = URL.createObjectURL(file);
        this.draft.logoStorageKey = upload.storageKey; this.uploading = false;
      },
      error: error => { this.uploading = false; this.showError(error, 'Could not upload the logo. Your published logo is unchanged.'); },
    });
  }
  get preview(): EffectiveBranding {
    const parent = this.scope ? this.parent?.settings : this.draft;
    const child = this.scope ? this.draft : null;
    const enabled = parent?.enabled === true && child?.enabled !== false;
    const primary = enabled ? child?.primaryColor || parent?.primaryColor || PRIMARY : PRIMARY;
    const accent = enabled ? child?.accentColor || parent?.accentColor || ACCENT : ACCENT;
    const scopeLogo = this.draft.logoStorageKey ? this.objectUrl || this.current?.logoPreviewUrl ||
      (this.current?.effective.enabled ? this.current.effective.logoUrl : null) : null;
    const parentLogo = this.scope && parent?.logoStorageKey ? this.parent?.logoPreviewUrl ||
      (this.parent?.effective.enabled ? this.parent.effective.logoUrl : null) : null;
    return {
      platformName: 'Simpleio', enabled,
      displayName: enabled ? child?.displayName?.trim() || parent?.displayName?.trim() || this.merchantName : this.merchantName,
      logoUrl: enabled ? scopeLogo || parentLogo || this.merchantLogo : this.merchantLogo,
      primaryColor: this.colorValid(primary) ? primary : PRIMARY, primaryTextColor: this.foreground(primary),
      accentColor: this.colorValid(accent) ? accent : ACCENT, accentTextColor: this.foreground(accent),
    };
  }
  inheritedColor(field: 'primaryColor' | 'accentColor'): string {
    return (this.scope ? this.parent?.settings[field] : null) || (field === 'primaryColor' ? PRIMARY : ACCENT);
  }
  colorValid(value: string | null): boolean { return !!value && /^#[0-9a-fA-F]{6}$/.test(value); }
  foreground(color: string): string {
    if (!this.colorValid(color)) return '#000000';
    const channels = [1, 3, 5].map(offset => {
      const value = parseInt(color.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000000' : '#FFFFFF';
  }
  canLeave(): boolean {
    if (this.busy) return false;
    return !this.dirty || window.confirm('Discard unsaved branding changes?');
  }
  close(): void {
    if (!this.canLeave()) return;
    this.request?.unsubscribe(); this.visible = false; this.loaded = false;
    this.error = ''; this.fieldErrors = {}; this.releasePreview();
    this.document.body.style.overflow = this.previousOverflow;
  }
  @HostListener('document:keydown.escape', ['$event'])
  escape(event: Event): void { if (this.visible) { event.preventDefault(); this.close(); } }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty || this.busy) { event.preventDefault(); event.returnValue = ''; }
  }
  ngOnDestroy(): void {
    this.request?.unsubscribe(); this.releasePreview();
    if (this.visible) this.document.body.style.overflow = this.previousOverflow;
  }
  private payload(): BrandingSettings {
    return { enabled: this.draft.enabled ?? null, displayName: this.draft.displayName?.trim() || null,
      logoStorageKey: this.draft.logoStorageKey || null,
      primaryColor: this.draft.primaryColor?.toUpperCase() || null, accentColor: this.draft.accentColor?.toUpperCase() || null };
  }
  private accept(response: BrandingResponse): void {
    this.current = response; this.draft = { ...EMPTY, ...response.settings };
    this.initial = JSON.stringify(this.payload()); this.loaded = true;
  }
  private releasePreview(): void { if (this.objectUrl) URL.revokeObjectURL(this.objectUrl); this.objectUrl = null; }
  private showError(error: unknown, fallback: string): void {
    const body = error instanceof HttpErrorResponse ? error.error : null;
    this.error = body?.detail || body?.message || fallback;
    if (error instanceof HttpErrorResponse && error.status === 403 && !body?.detail && !body?.message) {
      this.error = 'Only platform administrators can publish branding.';
    }
    this.fieldErrors = body?.errors && typeof body.errors === 'object' ? body.errors : {};
  }
}
