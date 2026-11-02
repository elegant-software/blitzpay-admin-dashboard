import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  EnvironmentKey,
  MenuLanguage,
  Merchant,
  MerchantVerticalResponse,
  UpdateMerchantRequest,
  MerchantLocation,
  UpdateMerchantLocationRequest,
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import { INTERNATIONAL_MENU, languageLabel } from '../menu-language/menu-language';

@Component({
  selector: 'app-merchant-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './merchant-edit.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class MerchantEditComponent implements OnInit {
  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  merchantId = '';
  merchant: Merchant | null = null;
  location: MerchantLocation | null = null;
  verticals: MerchantVerticalResponse[] = [];
  menuLanguages: MenuLanguage[] = [];
  languageToAdd = '';

  loading = false;
  saving = false;
  errorMessage = '';
  statusMessage = '';

  form = {
    merchantName: '',
    website: '',
    contactEmail: '',
    contactPhoneNumber: '',
    xHandle: '',
    instagramHandle: '',
    businessType: '',
    merchantMobility: '',
    offerings: [] as string[],
    defaultVatPercent: '',
    originalMenuLanguage: '',
    supportedMenuLanguages: [] as string[],
  };

  locationForm = {
    latitude: '',
    longitude: '',
    geofenceRadiusMeters: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: '',
  };

  logoStorageKey = '';
  logoUploadFile: File | null = null;
  logoUploading = false;
  logoError = '';
  logoPreviewUrl = '';

  readonly serviceOptions = [
    { code: 'PRE_ORDER', label: 'Pre-Order' },
    { code: 'WALK_IN_ORDERING', label: 'Walk-In Ordering' },
    { code: 'DEFERRED_PAYMENT', label: 'Deferred Payment' },
    { code: 'APPOINTMENT_BOOKING', label: 'Appointment' },
    { code: INTERNATIONAL_MENU, label: 'International Menu' },
  ];

  readonly mobilityOptions = [
    { code: 'BRICK_AND_MORTAR', label: 'Brick & Mortar' },
    { code: 'MOBILE', label: 'Mobile' },
  ];

  constructor(
    private readonly merchantApi: MerchantApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.merchantId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.merchantId) { this.errorMessage = 'No merchant ID in route.'; return; }
    this.load();
  }

  private load(): void {
    this.loading = true;
    forkJoin({
      merchant: this.merchantApi.getMerchant(this.selectedEnvironment, this.apiVersion, this.merchantId),
      verticals: this.merchantApi.getVerticals(this.selectedEnvironment, this.apiVersion),
      location: this.merchantApi.getLocation(this.selectedEnvironment, this.apiVersion, this.merchantId).pipe(catchError(() => of(null))),
      menuLanguages: this.merchantApi.getMenuLanguages(this.selectedEnvironment, this.apiVersion).pipe(catchError(() => of([] as MenuLanguage[]))),
    }).subscribe({
      next: ({ merchant, verticals, location, menuLanguages }) => {
        this.merchant = merchant;
        this.verticals = verticals;
        this.menuLanguages = menuLanguages;
        this.location = location;
        this.populateForm(merchant, location);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Failed to load merchant.');
      }
    });
  }

  private populateForm(merchant: Merchant, location: MerchantLocation | null): void {
    this.form = {
      merchantName: merchant.merchantName ?? '',
      website: merchant.website ?? '',
      contactEmail: merchant.contactInfo?.email ?? '',
      contactPhoneNumber: merchant.contactInfo?.phoneNumber ?? '',
      xHandle: merchant.contactInfo?.xHandle ?? '',
      instagramHandle: merchant.contactInfo?.instagramHandle ?? '',
      businessType: merchant.businessType ?? '',
      merchantMobility: merchant.merchantMobility ?? '',
      offerings: [...(merchant.offerings ?? [])],
      defaultVatPercent: merchant.defaultVatPercent != null ? merchant.defaultVatPercent.toString() : '',
      originalMenuLanguage: merchant.originalMenuLanguage ?? '',
      supportedMenuLanguages: [...(merchant.supportedMenuLanguages ?? [])],
    };
    this.logoStorageKey = merchant.logoStorageKey ?? '';
    this.logoPreviewUrl = merchant.logoUrl ?? '';
    if (location) {
      this.locationForm = {
        latitude: location.latitude?.toString() ?? '',
        longitude: location.longitude?.toString() ?? '',
        geofenceRadiusMeters: location.geofenceRadiusMeters?.toString() ?? '',
        addressLine1: location.addressLine1 ?? '',
        addressLine2: location.addressLine2 ?? '',
        city: location.city ?? '',
        postalCode: location.postalCode ?? '',
        country: location.country ?? '',
      };
    }
  }

  toggleOffering(code: string): void {
    const idx = this.form.offerings.indexOf(code);
    if (idx === -1) this.form.offerings = [...this.form.offerings, code];
    else this.form.offerings = this.form.offerings.filter(o => o !== code);
  }

  isOfferingSelected(code: string): boolean { return this.form.offerings.includes(code); }

  languageLabel(code: string): string { return languageLabel(code, this.menuLanguages); }

  /** Catalogue languages that can still be added as Supported Menu Languages. */
  get addableMenuLanguages(): MenuLanguage[] {
    return this.menuLanguages.filter(l => l.code !== this.form.originalMenuLanguage && !this.form.supportedMenuLanguages.includes(l.code));
  }

  onOriginalMenuLanguageChange(code: string): void {
    this.form.originalMenuLanguage = code;
    this.form.supportedMenuLanguages = this.form.supportedMenuLanguages.filter(l => l !== code);
  }

  addSupportedMenuLanguage(): void {
    const code = this.languageToAdd;
    if (code && !this.form.supportedMenuLanguages.includes(code) && code !== this.form.originalMenuLanguage) {
      this.form.supportedMenuLanguages = [...this.form.supportedMenuLanguages, code];
    }
    this.languageToAdd = '';
  }

  removeSupportedMenuLanguage(code: string): void {
    this.form.supportedMenuLanguages = this.form.supportedMenuLanguages.filter(l => l !== code);
  }

  onLogoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.logoUploadFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => { this.logoPreviewUrl = (e.target as FileReader).result as string; };
      reader.readAsDataURL(file);
    }
  }

  uploadLogo(): void {
    if (!this.logoUploadFile || this.logoUploading) return;
    this.logoUploading = true;
    this.logoError = '';
    const file = this.logoUploadFile;
    this.merchantApi.createLogoUploadUrl(this.selectedEnvironment, this.apiVersion, this.merchantId, file.type || 'image/jpeg').subscribe({
      next: (resp) => {
        this.merchantApi.uploadMerchantLogo(resp.uploadUrl, file).subscribe({
          next: () => {
            this.logoStorageKey = resp.storageKey;
            this.logoUploading = false;
            this.merchantApi.updateLogo(this.selectedEnvironment, this.apiVersion, this.merchantId, { storageKey: resp.storageKey }).subscribe({
              next: (updated) => { this.logoPreviewUrl = updated.logoUrl ?? this.logoPreviewUrl; },
            });
          },
          error: (err) => { this.logoUploading = false; this.logoError = this.toMessage(err, 'Logo upload failed.'); }
        });
      },
      error: (err) => { this.logoUploading = false; this.logoError = this.toMessage(err, 'Failed to get upload URL.'); }
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.statusMessage = '';

    if (!this.form.originalMenuLanguage && (this.isOfferingSelected(INTERNATIONAL_MENU) || this.form.supportedMenuLanguages.length)) {
      this.saving = false;
      this.errorMessage = 'Choose the Original Menu Language before enabling International Menu or adding languages.';
      return;
    }

    const payload: UpdateMerchantRequest = {
      merchantName: this.form.merchantName,
      website: this.form.website || undefined,
      offerings: this.form.offerings,
      businessType: this.form.businessType || undefined,
      merchantMobility: this.form.merchantMobility || undefined,
      defaultVatPercent: this.form.defaultVatPercent !== '' ? parseFloat(this.form.defaultVatPercent) : undefined,
      originalMenuLanguage: this.form.originalMenuLanguage || undefined,
      supportedMenuLanguages: this.form.originalMenuLanguage ? this.form.supportedMenuLanguages : undefined,
      contactInfo: {
        email: this.form.contactEmail || undefined,
        phoneNumber: this.form.contactPhoneNumber || undefined,
        xHandle: this.form.xHandle || undefined,
        instagramHandle: this.form.instagramHandle || undefined,
      },
    };

    const save$ = this.merchantApi.updateMerchant(this.selectedEnvironment, this.apiVersion, this.merchantId, payload);
    const loc = this.buildLocationPayload();
    const location$ = loc
      ? this.merchantApi.saveLocation(this.selectedEnvironment, this.apiVersion, this.merchantId, loc).pipe(catchError(() => of(null)))
      : of(null);

    forkJoin({ merchant: save$, location: location$ }).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/merchants', this.merchantId]); },
      error: (error) => { this.saving = false; this.errorMessage = this.toMessage(error, 'Failed to save merchant.'); }
    });
  }

  private buildLocationPayload(): UpdateMerchantLocationRequest | null {
    const lat = parseFloat(this.locationForm.latitude);
    const lng = parseFloat(this.locationForm.longitude);
    const radius = parseFloat(this.locationForm.geofenceRadiusMeters);
    if (isNaN(lat) || isNaN(lng)) return null;
    return {
      latitude: lat,
      longitude: lng,
      geofenceRadiusMeters: isNaN(radius) ? 50 : radius,
      addressLine1: this.locationForm.addressLine1 || undefined,
      addressLine2: this.locationForm.addressLine2 || undefined,
      city: this.locationForm.city || undefined,
      postalCode: this.locationForm.postalCode || undefined,
      country: this.locationForm.country || undefined,
    };
  }

  cancel(): void { this.router.navigate(['/merchants', this.merchantId]); }

  private toMessage(error: unknown, fallback: string): string {
    const body = (error as { error?: { detail?: string; message?: string } })?.error;
    return body?.detail || body?.message || fallback;
  }
}
