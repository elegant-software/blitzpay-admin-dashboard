import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, Subscription, switchMap } from 'rxjs';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { BackendEnvironment, Branch, EnvironmentKey } from '../models/merchant-catalog.models';
import { environment } from '../../environments/environment';
import { defaultPalette, paletteErrors, ThemePalette, WhiteLabelApp, WhiteLabelResponse, WhiteLabelSettings, WhiteLabelTheme } from './white-label.models';

@Component({
  selector: 'app-white-label', standalone: true, imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './white-label.component.html', styleUrl: './white-label.component.css'
})
export class WhiteLabelComponent implements OnInit, OnDestroy {
  private readonly api = inject(MerchantApiService);
  private readonly route = inject(ActivatedRoute);
  private pending?: Subscription;
  private lightLogoDraft: string | null | undefined;
  private darkLogoDraft: string | null | undefined;
  private readonly subscriptions = new Subscription();
  readonly selfService = this.route.snapshot.data?.['merchantSelfService'] === true;
  readonly merchantId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly apiVersion = 'v1';
  readonly environment: BackendEnvironment = getEnvironmentByKey(
    (this.route.snapshot.queryParamMap.get('environment') as EnvironmentKey) || environment.defaultEnvironmentKey);
  readonly apps: {value: WhiteLabelApp; label: string}[] = [
    {value: 'SHOPPER', label: 'Shopper mobile'}, {value: 'MERCHANT', label: 'Merchant mobile'},
    {value: 'STOREFRONT', label: 'Web storefront / PWA'}, {value: 'KITCHEN', label: 'Kitchen screen'}];
  readonly roles: {key: keyof ThemePalette; label: string}[] = [
    {key: 'primary', label: 'Primary action'}, {key: 'onPrimary', label: 'Text on primary'},
    {key: 'accent', label: 'Accent'}, {key: 'onAccent', label: 'Text on accent'},
    {key: 'background', label: 'Page background'}, {key: 'onBackground', label: 'Page text'},
    {key: 'surface', label: 'Surface'}, {key: 'onSurface', label: 'Surface text'},
    {key: 'card', label: 'Card'}, {key: 'onCard', label: 'Card text'},
    {key: 'muted', label: 'Secondary text'}, {key: 'border', label: 'Controls / borders'},
    {key: 'error', label: 'Error'}, {key: 'onError', label: 'Text on error'},
    {key: 'success', label: 'Success'}, {key: 'onSuccess', label: 'Text on success'},
    {key: 'warning', label: 'Warning'}, {key: 'onWarning', label: 'Text on warning'}];
  app: WhiteLabelApp = 'SHOPPER';
  branchId = '';
  branches: Branch[] = [];
  merchantName = '';
  settings: WhiteLabelSettings = {hiddenFeatures: []};
  response?: WhiteLabelResponse;
  parent?: WhiteLabelResponse;
  revision = -1;
  mode: 'light' | 'dark' = 'light';
  themes: WhiteLabelTheme[] = [];
  themeName = '';
  themeId = '';
  dirty = false;
  loading = false;
  saving = false;
  uploading = false;
  librarySaving = false;
  error = '';
  notice = '';

  ngOnInit(): void {
    this.subscriptions.add(forkJoin({branches: this.api.getBranches(this.environment, this.apiVersion, this.merchantId),
      merchant: this.api.getMerchant(this.environment, this.apiVersion, this.merchantId)}).subscribe({
      next: value => { this.branches = value.branches; this.merchantName = value.merchant.merchantName; },
      error: error => this.error = this.toMessage(error, 'Could not load merchant and branches.')
    }));
    this.load();
  }
  ngOnDestroy(): void { this.pending?.unsubscribe(); this.subscriptions.unsubscribe(); }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void { if (this.dirty || this.saving || this.uploading) { event.preventDefault(); event.returnValue = ''; } }
  canLeave(): boolean {
    if (this.saving || this.uploading || this.librarySaving) return false;
    return !this.dirty || window.confirm('Discard unsaved white-label changes?');
  }
  scrollToSection(event: Event, sectionId: string): void {
    // A native fragment resolves against <base href="/"> and can reload the app.
    event.preventDefault();
    const page = (event.currentTarget as HTMLElement | null)?.closest('.white-label-page');
    const section = page?.querySelector<HTMLElement>('#' + sectionId);
    if (!section) return;
    section.focus({preventScroll: true});
    section.scrollIntoView({block: 'start'});
  }
  markDirty(): void { this.dirty = true; this.notice = ''; }
  changeScope(app: WhiteLabelApp, branchId: string): void {
    if (!this.canLeave()) return;
    this.app = app; this.branchId = branchId; this.dirty = false; this.load();
  }
  load(): void {
    this.pending?.unsubscribe();
    this.loading = true; this.error = ''; this.notice = ''; this.response = undefined; this.parent = undefined;
    this.themeId = ''; this.themeName = ''; this.themes = [];
    const request = this.api.getWhiteLabel(this.environment, this.apiVersion, this.merchantId, this.branchId, this.app);
    this.pending = forkJoin({profile: request,
      parent: this.api.getWhiteLabel(this.environment, this.apiVersion, this.merchantId, '', this.app),
      themes: this.api.listWhiteLabelThemes(this.environment, this.apiVersion, this.merchantId, this.app)}).subscribe({
      next: value => { this.parent = value.parent; this.themes = value.themes; this.accept(value.profile); this.loading = false; },
      error: error => { this.error = this.toMessage(error, 'Could not load white-label settings.'); this.loading = false; }
    });
  }
  private accept(value: WhiteLabelResponse): void {
    this.lightLogoDraft = undefined; this.darkLogoDraft = undefined;
    this.response = value; this.settings = structuredClone(value.settings); this.revision = value.revision; this.dirty = false;
  }
  get inheritedPalette(): ThemePalette {
    return this.response?.inheritedConfiguration?.[this.mode] ?? (this.branchId ? this.parent?.effective[this.mode] : undefined) ?? defaultPalette(this.mode === 'dark');
  }
  get previewPalette(): ThemePalette {
    return this.settings[this.mode] ?? this.inheritedPalette;
  }
  get validationErrors(): string[] {
    return [...(this.settings.light ? paletteErrors(this.settings.light).map(e => 'Light: ' + e) : []),
      ...(this.settings.dark ? paletteErrors(this.settings.dark).map(e => 'Dark: ' + e) : [])];
  }
  get previewName(): string {
    return this.settings.displayName?.trim() || this.response?.inheritedConfiguration?.displayName || (this.branchId ? this.parent?.effective.displayName : undefined) || this.merchantName;
  }
  get previewTitle(): string {
    return this.settings.title?.trim() || this.response?.inheritedConfiguration?.title || this.previewName;
  }
  get previewLogo(): string | null {
    const inherited = this.response?.inheritedConfiguration;
    const light = this.lightLogoDraft !== undefined
      ? this.lightLogoDraft ?? inherited?.logoUrl ?? null
      : this.response?.logoPreviewUrl ?? inherited?.logoUrl ?? this.parent?.effective.logoUrl ?? null;
    if (this.mode !== 'dark') return light;
    if (this.darkLogoDraft !== undefined) return this.darkLogoDraft ?? inherited?.darkLogoUrl ?? light;
    return this.response?.darkLogoPreviewUrl ?? inherited?.darkLogoUrl ?? light;
  }
  setColor(key: keyof ThemePalette, value: string): void {
    this.settings[this.mode] = {...this.previewPalette, [key]: value}; this.markDirty();
  }
  inheritPalette(): void { this.settings[this.mode] = null; this.markDirty(); }
  toggleFeature(code: string, visible: boolean): void {
    this.settings.hiddenFeatures = visible ? this.settings.hiddenFeatures.filter(v => v !== code)
      : [...new Set([...this.settings.hiddenFeatures, code])]; this.markDirty();
  }
  featureVisible(code: string): boolean {
    return !this.settings.hiddenFeatures.includes(code) && (!this.branchId || !!this.parent?.effective.features.includes(code));
  }
  featureLocked(code: string): boolean { return !!this.branchId && !this.parent?.effective.features.includes(code); }
  featureLabel(code: string): string {
    const labels: Record<string, string> = {PRE_ORDER: 'Pre-orders', WALK_IN_ORDERING: 'Walk-in ordering',
      DEFERRED_PAYMENT: 'Deferred payment', APPOINTMENT_BOOKING: 'Appointment booking', INTERNATIONAL_MENU: 'International menu'};
    return labels[code] || code.replaceAll('_', ' ').toLowerCase();
  }
  save(): void {
    if (this.loading || this.saving || this.uploading || !this.response || this.validationErrors.length) return;
    this.saving = true; this.error = '';
    this.subscriptions.add(this.api.saveWhiteLabel(this.environment, this.apiVersion, this.merchantId, this.branchId, this.app,
      {settings: {...this.settings, displayName: this.settings.displayName?.trim() || null,
        title: this.settings.title?.trim() || null}, revision: this.revision}).subscribe({
      next: value => { this.accept(value); if (!this.branchId) this.parent = value; this.saving = false; this.notice = 'White-label settings published.'; },
      error: error => { this.error = this.toMessage(error, 'Could not publish settings.'); this.saving = false; }
    }));
  }
  cancel(): void {
    if (!this.canLeave()) return;
    if (this.response) this.accept(this.response);
    this.error = ''; this.notice = '';
  }
  reset(): void { this.settings = {hiddenFeatures: []}; this.lightLogoDraft = null; this.darkLogoDraft = null; this.markDirty(); }
  applyTheme(): void {
    const theme = this.themes.find(t => t.id === this.themeId);
    if (!theme) return;
    this.settings.light = structuredClone(theme.light); this.settings.dark = structuredClone(theme.dark); this.markDirty();
  }
  saveTheme(): void {
    if (!this.themeName.trim() || this.librarySaving || this.validationErrors.length) return;
    const light = this.settings.light ?? this.response?.inheritedConfiguration?.light ?? (this.branchId ? this.parent?.effective.light : undefined) ?? defaultPalette(false);
    const dark = this.settings.dark ?? this.response?.inheritedConfiguration?.dark ?? (this.branchId ? this.parent?.effective.dark : undefined) ?? defaultPalette(true);
    this.librarySaving = true; this.error = '';
    this.subscriptions.add(this.api.createWhiteLabelTheme(this.environment, this.apiVersion, this.merchantId, this.app,
      {name: this.themeName.trim(), primaryColor: light.primary, accentColor: light.accent, light, dark}).subscribe({
      next: theme => { this.themes = [...this.themes, theme]; this.themeId = theme.id; this.themeName = ''; this.librarySaving = false;
        this.notice = 'Palette saved to library. Publish to apply it to this app.'; },
      error: error => { this.error = this.toMessage(error, 'Could not save palette.'); this.librarySaving = false; }
    }));
  }
  upload(event: Event, dark: boolean): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || this.uploading || this.saving) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error = 'Choose a PNG, JPEG or WebP logo up to 5 MB.'; return;
    }
    this.uploading = true; this.error = '';
    let key = '';
    this.subscriptions.add(this.api.createWhiteLabelLogoUpload(this.environment, this.apiVersion, this.merchantId, this.branchId, file.type)
      .pipe(switchMap(value => { key = value.storageKey; return this.api.uploadMerchantLogo(value.uploadUrl, file); })).subscribe({
        next: () => {
          if (dark) this.settings.darkLogoStorageKey = key; else this.settings.logoStorageKey = key;
          this.markDirty(); this.uploading = false; this.notice = 'Logo uploaded. Publish to apply it.';
          const reader = new FileReader();
          reader.onload = () => { if (dark) this.darkLogoDraft = reader.result as string; else this.lightLogoDraft = reader.result as string; };
          reader.readAsDataURL(file);
        },
        error: error => { this.error = this.toMessage(error, 'Could not upload logo.'); this.uploading = false; }
      }));
  }
  clearLogo(dark: boolean): void {
    if (dark) { this.settings.darkLogoStorageKey = null; this.darkLogoDraft = null; }
    else { this.settings.logoStorageKey = null; this.lightLogoDraft = null; }
    this.markDirty();
  }
  private toMessage(error: any, fallback: string): string { return error?.error?.detail || error?.error?.message || fallback; }
}
