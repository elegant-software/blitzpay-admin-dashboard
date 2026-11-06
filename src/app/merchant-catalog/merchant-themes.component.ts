import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { MerchantTheme, MerchantThemeRequest, ThemeApp } from '../models/merchant-theme.models';
import { MerchantApiService } from '../services/merchant-api.service';

@Component({
  selector: 'app-merchant-themes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-themes.component.html',
  styleUrls: ['./merchant-catalog.component.css', './merchant-themes.component.css']
})
export class MerchantThemesComponent implements OnDestroy {
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) environment!: BackendEnvironment;
  @Input() apiVersion = 'v1';
  @Input() app: ThemeApp = 'SHOPPER';
  get appLabel(): string { return this.app === 'MERCHANT' ? 'Merchant app' : 'Shopper app'; }
  get idPrefix(): string { return `theme-${this.app.toLowerCase()}`; }
  private readonly api = inject(MerchantApiService);
  private readonly subscriptions = new Subscription();
  themes: MerchantTheme[] = [];
  dialogOpen = false;
  loading = false;
  loaded = false;
  saving = false;
  selectedId = '';
  error = '';
  message = '';
  form = this.emptyForm();
  private original = JSON.stringify(this.form);

  get dirty(): boolean { return this.original !== JSON.stringify(this.form); }
  get valid(): boolean {
    return this.form.name.trim().length > 0 && this.form.name.length <= 120 &&
      /^#[0-9a-f]{6}$/i.test(this.form.primaryColor) && /^#[0-9a-f]{6}$/i.test(this.form.accentColor);
  }

  open(): void {
    this.dialogOpen = true;
    this.error = '';
    this.message = '';
    this.loading = true;
    this.loaded = false;
    this.selectedId = '';
    this.resetForm(this.emptyForm());
    this.subscriptions.add(this.api.getMerchantThemes(this.environment, this.apiVersion, this.merchantId, this.app).subscribe({
      next: themes => { this.themes = themes; this.loading = false; this.loaded = true; },
      error: error => { this.error = this.toMessage(error, 'Could not load themes. Please try again.'); this.loading = false; }
    }));
  }

  selectTheme(id: string): void {
    if (this.saving || (this.dirty && !confirm('Discard unsaved theme changes?'))) return;
    const theme = this.themes.find(item => item.id === id);
    this.selectedId = theme?.id ?? '';
    this.error = '';
    this.resetForm(theme ? { name: theme.name, primaryColor: theme.primaryColor, accentColor: theme.accentColor } : this.emptyForm());
  }

  close(): void {
    if (this.saving || (this.dirty && !confirm('Discard unsaved theme changes?'))) return;
    this.dialogOpen = false;
    this.error = '';
  }

  save(): void {
    if (!this.loaded || this.saving) return;
    if (!this.valid) { this.error = 'Enter a theme name (up to 120 characters) and two six-digit hex colors.'; return; }
    this.saving = true;
    this.error = '';
    const payload = { name: this.form.name.trim(), primaryColor: this.form.primaryColor.toUpperCase(), accentColor: this.form.accentColor.toUpperCase() };
    const request = this.selectedId
      ? this.api.updateMerchantTheme(this.environment, this.apiVersion, this.merchantId, this.selectedId, payload, this.app)
      : this.api.createMerchantTheme(this.environment, this.apiVersion, this.merchantId, payload, this.app);
    this.subscriptions.add(request.subscribe({
      next: theme => {
        this.themes = [...this.themes.filter(item => item.id !== theme.id), theme];
        this.saving = false;
        this.dialogOpen = false;
        this.message = `Theme "${theme.name}" saved.`;
        this.original = JSON.stringify(this.form);
      },
      error: error => { this.saving = false; this.error = this.toMessage(error, 'Could not save theme. Please try again.'); }
    }));
  }

  foreground(color: string): string {
    if (!/^#[0-9a-f]{6}$/i.test(color)) return '#000000';
    const rgb = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.1791287847 ? '#000000' : '#FFFFFF';
  }

  canLeave(): boolean {
    return !this.saving && (!this.dialogOpen || !this.dirty || confirm('Discard unsaved theme changes?'));
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.saving || (this.dialogOpen && this.dirty)) { event.preventDefault(); event.returnValue = ''; }
  }

  ngOnDestroy(): void { this.subscriptions.unsubscribe(); }
  private emptyForm(): MerchantThemeRequest { return { name: '', primaryColor: '#00C2FF', accentColor: '#5856D6' }; }
  private resetForm(form: MerchantThemeRequest): void { this.form = form; this.original = JSON.stringify(form); }
  private toMessage(error: any, fallback: string): string {
    const detail = error?.error?.detail || error?.error?.message || fallback;
    const fields = error?.error?.errors;
    return fields ? `${detail} ${Object.entries(fields).map(([key, values]) => `${key}: ${values}`).join('; ')}` : detail;
  }
}
