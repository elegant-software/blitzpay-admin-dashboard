import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Branch, EnvironmentKey, UpdateBranchRequest } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import { BranchKitchenScreenComponent } from './branch-kitchen-screen.component';

@Component({
  selector: 'app-branch-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BranchKitchenScreenComponent],
  templateUrl: './branch-edit.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class BranchEditComponent implements OnInit {
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
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Failed to load branch.');
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
    };
  }

  save(): void {
    if (this.saving) return;
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
    };

    this.merchantApi.updateBranch(this.selectedEnvironment, this.apiVersion, this.merchantId, this.branchId, payload).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/merchants', this.merchantId]); },
      error: (error) => { this.saving = false; this.errorMessage = this.toMessage(error, 'Failed to save branch.'); }
    });
  }

  cancel(): void { this.router.navigate(['/merchants', this.merchantId]); }

  private toMessage(error: unknown, fallback: string): string {
    const body = (error as { error?: { detail?: string; message?: string } })?.error;
    return body?.detail || body?.message || fallback;
  }
}
