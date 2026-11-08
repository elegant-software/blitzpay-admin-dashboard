import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  Branch,
  CreateMerchantRequest,
  EnvironmentKey,
  MenuLanguage,
  Merchant,
  MerchantVerticalResponse,
  StorefrontTheme,
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
  private readonly notifications = inject(NotificationService);
  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  merchantId = '';
  isCreateMode = false;
  merchant: Merchant | null = null;
  location: MerchantLocation | null = null;
  verticals: MerchantVerticalResponse[] = [];
  menuLanguages: MenuLanguage[] = [];
  languageToAdd = '';

  loading = false;
  saving = false;
  errorMessage = '';


  /** All storefront themes, drafts included; maintained in the backend `storefront_themes` table. */
  storefrontThemes: StorefrontTheme[] = [];
  /** Theme shown by the storefront preview link; may be a draft. */
  previewThemeCode = '';
  /** First branch of the merchant: the storefront needs a branch to show the menu. */
  previewBranchId = '';

  /** Merchants can only be given published themes; keep the current one listed even if it is not. */
  get selectableThemes(): StorefrontTheme[] {
    return this.storefrontThemes.filter((t) => t.status === 'PUBLISHED' || t.code === this.form.storefrontTheme);
  }

  get themePreviewUrl(): string {
    if (!this.merchantId || !this.previewBranchId || !this.previewThemeCode) return '';
    return `${this.selectedEnvironment.storefrontUrl}/m/${encodeURIComponent(this.merchantId)}/b/${encodeURIComponent(this.previewBranchId)}`
      + `?previewTheme=${encodeURIComponent(this.previewThemeCode)}`;
  }

  form = {
    merchantName: '',
    website: '',
    contactEmail: '',
    contactPhoneNumber: '',
    xHandle: '',
    instagramHandle: '',
    businessType: '',
    merchantMobility: '',
    storefrontTheme: 'DEFAULT',
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
    this.isCreateMode = !this.merchantId;
    this.load();
  }

  private load(): void {
    this.loading = true;
    forkJoin({
      verticals: this.merchantApi.getVerticals(this.selectedEnvironment, this.apiVersion),
      menuLanguages: this.merchantApi.getMenuLanguages(this.selectedEnvironment, this.apiVersion).pipe(catchError(() => of([] as MenuLanguage[]))),
      themes: this.merchantApi.getStorefrontThemes(this.selectedEnvironment, this.apiVersion).pipe(catchError(() => of([] as StorefrontTheme[]))),
    }).subscribe({
      next: ({ verticals, menuLanguages, themes }) => {
        this.verticals = verticals;
        this.storefrontThemes = themes;
        this.menuLanguages = menuLanguages;
        if (this.isCreateMode) {
          this.loading = false;
          return;
        }
        this.loadMerchant();
      },
      error: (error) => { this.loading = false; this.notifications.apiError(error, 'Failed to load merchant form.'); }
    });
  }

  private loadMerchant(): void {
    forkJoin({
      merchant: this.merchantApi.getMerchant(this.selectedEnvironment, this.apiVersion, this.merchantId),
      location: this.merchantApi.getLocation(this.selectedEnvironment, this.apiVersion, this.merchantId).pipe(catchError(() => of(null))),
      branches: this.merchantApi.getBranches(this.selectedEnvironment, this.apiVersion, this.merchantId).pipe(catchError(() => of([] as Branch[]))),
    }).subscribe({
      next: ({ merchant, location, branches }) => {
        this.merchant = merchant;
        this.previewBranchId = branches[0]?.branchId ?? branches[0]?.id ?? '';
        this.location = location;
        this.populateForm(merchant, location);
        this.previewThemeCode = this.form.storefrontTheme;
        this.loading = false;
      },
      error: (error) => { this.loading = false; this.notifications.apiError(error, 'Failed to load merchant.'); }
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
      storefrontTheme: merchant.storefrontTheme ?? 'DEFAULT',
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
    if (!this.logoUploadFile || this.logoUploading || !this.merchantId) return;
    this.logoUploading = true;

    this.uploadLogoForMerchant(this.merchantId, this.logoUploadFile).subscribe({
      next: (updated) => {
        this.logoPreviewUrl = updated.logoUrl ?? this.logoPreviewUrl;
        this.logoUploading = false;
        this.logoUploadFile = null;
      },
      error: (err) => { this.logoUploading = false; this.notifications.apiError(err, 'Logo upload failed.'); }
    });
  }

  save(): void {
    if (this.saving) return;
    if (!this.form.merchantName.trim()) {
      this.errorMessage = 'Enter a trading name.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';


    if (!this.form.originalMenuLanguage && (this.isOfferingSelected(INTERNATIONAL_MENU) || this.form.supportedMenuLanguages.length)) {
      this.saving = false;
      this.errorMessage = 'Choose the Original Menu Language before enabling International Menu or adding languages.';
      return;
    }

    const commonPayload: UpdateMerchantRequest = {
      merchantName: this.form.merchantName.trim(),
      website: this.form.website || undefined,
      offerings: this.form.offerings,
      businessType: this.form.businessType || undefined,
      merchantMobility: this.form.merchantMobility || undefined,
      storefrontTheme: this.form.storefrontTheme,
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

    const wasCreating = this.isCreateMode;
    const createPayload: CreateMerchantRequest = { ...commonPayload, merchantName: this.form.merchantName.trim() };
    const save$ = wasCreating
      ? this.merchantApi.createMerchant(this.selectedEnvironment, this.apiVersion, createPayload)
      : this.merchantApi.updateMerchant(this.selectedEnvironment, this.apiVersion, this.merchantId, commonPayload);
    save$.subscribe({
      next: (savedMerchant) => {
        this.merchant = savedMerchant;
        this.merchantId = savedMerchant.merchantId;
        this.isCreateMode = false;
        this.form.merchantName = savedMerchant.merchantName;
        this.saveRelatedData(savedMerchant);
      },
      error: (error) => {
        this.saving = false;
        this.notifications.apiError(error, wasCreating ? 'Failed to create merchant.' : 'Failed to save merchant.');
      }
    });
  }

  private saveRelatedData(savedMerchant: Merchant): void {
    const loc = this.buildLocationPayload();
    const location$: Observable<MerchantLocation | null> = loc
      ? this.merchantApi.saveLocation(this.selectedEnvironment, this.apiVersion, savedMerchant.merchantId, loc)
      : of(null);
    const logo$: Observable<Merchant | null> = this.logoUploadFile
      ? this.uploadLogoForMerchant(savedMerchant.merchantId, this.logoUploadFile)
      : of(null);
    location$.pipe(switchMap(() => logo$)).subscribe({
      next: (logo) => {
        if (logo) this.logoPreviewUrl = logo.logoUrl ?? this.logoPreviewUrl;
        if (logo) this.logoUploadFile = null;
        this.saving = false;
        this.router.navigate(['/merchants', savedMerchant.merchantId]);
      },
      error: (error) => {
        this.saving = false;
        this.notifications.apiError(error, 'Merchant saved, but location or logo could not be saved. Review the form and try again.');
      }
    });
  }

  private uploadLogoForMerchant(merchantId: string, file: File): Observable<Merchant> {
    return this.merchantApi.createLogoUploadUrl(this.selectedEnvironment, this.apiVersion, merchantId, file.type || 'image/jpeg').pipe(
      switchMap((response) => this.merchantApi.uploadMerchantLogo(response.uploadUrl, file).pipe(
        switchMap(() => this.merchantApi.updateLogo(this.selectedEnvironment, this.apiVersion, merchantId, { storageKey: response.storageKey })),
        map((updated) => {
          this.logoStorageKey = response.storageKey;
          return updated;
        })
      ))
    );
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

  cancel(): void {
    this.router.navigate(this.isCreateMode ? ['/merchants'] : ['/merchants', this.merchantId]);
  }

}
