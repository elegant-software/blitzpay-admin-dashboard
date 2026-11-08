import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Branch, EnvironmentKey, UpdateBranchRequest } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import { exceedsCapacity, seatedCapacity } from '../tables/floor-plan';

@Component({
  selector: 'app-branch-edit',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule, RouterModule],
  templateUrl: './branch-edit.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class BranchEditComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';

  get selectedEnvironment() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  merchantId = '';
  branchId = '';
  branch: Branch | null = null;

  loading = false;
  saving = false;
  errorMessage = '';

  form = {
    name: '',
    active: true,
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: '',
    contactFullName: '',
    contactEmail: '',
    contactPhoneNumber: '',
    website: '',
    latitude: '',
    longitude: '',
    geofenceRadiusMeters: '',
    capacity: '',
  };

  constructor(
    private readonly merchantApi: MerchantApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.merchantId = this.route.snapshot.paramMap.get('id') ?? '';
    this.branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
    if (!this.merchantId || !this.branchId) { this.errorMessage = 'Missing route parameters.'; return; }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.merchantApi.getBranch(this.selectedEnvironment, this.apiVersion, this.merchantId, this.branchId).subscribe({
      next: (branch) => {
        this.branch = branch;
        this.populateForm(branch);
        this.loading = false;
        this.loadSeatedCapacity();
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Failed to load branch.');
      }
    });
  }

  private populateForm(branch: Branch): void {
    this.form = {
      name: branch.name ?? '',
      active: branch.active !== false,
      addressLine1: branch.addressLine1 ?? '',
      addressLine2: branch.addressLine2 ?? '',
      city: branch.city ?? '',
      postalCode: branch.postalCode ?? '',
      country: branch.country ?? '',
      contactFullName: branch.contactFullName ?? '',
      contactEmail: branch.contactEmail ?? '',
      contactPhoneNumber: branch.contactPhoneNumber ?? '',
      website: branch.website ?? '',
      latitude: branch.latitude?.toString() ?? '',
      longitude: branch.longitude?.toString() ?? '',
      geofenceRadiusMeters: branch.geofenceRadiusMeters?.toString() ?? '',
      capacity: branch.capacity?.toString() ?? '',
    };
  }

  /** Branch Capacity from the form; null when empty. */
  get capacityValue(): number | null {
    const value = String(this.form.capacity ?? '').trim();
    return value === '' ? null : Math.max(0, Math.round(Number(value)));
  }

  /** Seats of the Branch's active Tables, for the capacity warning; null until loaded or when it cannot be loaded. */
  seatedCapacity: number | null = null;

  /** Warn, never block, when the Tables seat more guests than the Branch Capacity. */
  get overCapacity(): boolean {
    return this.seatedCapacity != null && exceedsCapacity(this.seatedCapacity, this.capacityValue);
  }

  save(): void {
    if (this.saving) return;
    if (this.capacityValue != null && !Number.isFinite(this.capacityValue)) {
      this.errorMessage = 'Branch Capacity must be a whole number.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';

    const payload: UpdateBranchRequest = {
      name: this.form.name,
      active: this.form.active,
      addressLine1: this.form.addressLine1 || undefined,
      addressLine2: this.form.addressLine2 || undefined,
      city: this.form.city || undefined,
      postalCode: this.form.postalCode || undefined,
      country: this.form.country || undefined,
      contactFullName: this.form.contactFullName || undefined,
      contactEmail: this.form.contactEmail || undefined,
      contactPhoneNumber: this.form.contactPhoneNumber || undefined,
      latitude: this.form.latitude ? parseFloat(this.form.latitude) : undefined,
      longitude: this.form.longitude ? parseFloat(this.form.longitude) : undefined,
      geofenceRadiusMeters: this.form.geofenceRadiusMeters ? parseFloat(this.form.geofenceRadiusMeters) : undefined,
      // Empty clears the Branch Capacity.
      capacity: this.capacityValue,
    };

    this.merchantApi.updateBranch(this.selectedEnvironment, this.apiVersion, this.merchantId, this.branchId, payload).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/merchants', this.merchantId]); },
      error: (error) => { this.saving = false; this.notifications.apiError(error, 'Failed to save branch.'); }
    });
  }

  private loadSeatedCapacity(): void {
    this.merchantApi.getTables(this.selectedEnvironment, this.apiVersion, this.merchantId, this.branchId).subscribe({
      next: (tables) => this.seatedCapacity = seatedCapacity(tables),
      error: () => this.seatedCapacity = null
    });
  }

  cancel(): void { this.router.navigate(['/merchants', this.merchantId]); }

}
