import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import {
  AppointmentPolicy,
  AppointmentPolicyFormModel,
  EnvironmentKey,
  MerchantSearchResultItem,
  UpdateAppointmentPolicyRequest
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import { MerchantSearchComponent } from '../shared/merchant-search.component';

@Component({
  selector: 'app-appointment-policy',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe, MerchantSearchComponent],
  templateUrl: './appointment-policy.component.html',
  styleUrl: './appointment-policy.component.css'
})
export class AppointmentPolicyComponent {
  private readonly notifications = inject(NotificationService);
  selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  merchantIdInput = '';
  merchantId = '';
  merchantQuery = '';
  merchantResults: MerchantSearchResultItem[] = [];
  selectedMerchantItem: MerchantSearchResultItem | null = null;

  policy: AppointmentPolicy | null = null;
  form: AppointmentPolicyFormModel = this.emptyForm();

  loading = false;
  saving = false;
  editMode = false;

  errorMessage = '';

  formError = '';

  constructor(private readonly merchantApi: MerchantApiService) {}

  get selectedEnvironment() {
    return getEnvironmentByKey(this.selectedEnvironmentKey);
  }

  searchMerchantsForFilter(): void {
    const q = this.merchantQuery.trim();
    if (!q) return;
    this.merchantApi.searchMerchants(this.selectedEnvironment, this.apiVersion, { q, page: 0 }).subscribe({
      next: response => { this.merchantResults = response.results; },
    });
  }

  selectMerchantForFilter(m: MerchantSearchResultItem): void {
    this.selectedMerchantItem = m;
    this.merchantIdInput = m.merchantId;
    this.merchantResults = [];
  }

  clearMerchantFilter(): void {
    this.selectedMerchantItem = null;
    this.merchantIdInput = '';
    this.merchantId = '';
    this.merchantQuery = '';
    this.merchantResults = [];
    this.policy = null;
    this.editMode = false;
  }

  get canLoad(): boolean {
    return !!this.selectedMerchantItem;
  }

  loadPolicy(): void {
    const merchantId = this.merchantIdInput.trim();
    if (!merchantId) {
      this.errorMessage = 'Select a merchant before loading.';
      return;
    }

    this.merchantId = merchantId;
    this.errorMessage = '';

    this.loading = true;
    this.policy = null;
    this.editMode = false;

    this.merchantApi.getAppointmentPolicy(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: (policy) => {
        this.loading = false;
        this.policy = policy;
        this.form = this.policyToForm(policy);
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Unable to load appointment policy.');
      }
    });
  }

  clearSearch(): void {
    this.merchantIdInput = '';
    this.merchantId = '';
    this.merchantQuery = '';
    this.merchantResults = [];
    this.selectedMerchantItem = null;
    this.policy = null;
    this.editMode = false;
    this.form = this.emptyForm();
    this.errorMessage = '';

    this.formError = '';
  }

  startEdit(): void {
    if (!this.policy) return;
    this.form = this.policyToForm(this.policy);
    this.formError = '';
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.formError = '';
    if (this.policy) {
      this.form = this.policyToForm(this.policy);
    }
  }

  savePolicy(): void {
    this.formError = '';

    const bookingIntervalMinutes = parseInt(this.form.bookingIntervalMinutes, 10);
    const leadTimeMinutes = parseInt(this.form.leadTimeMinutes, 10);
    const bookingHorizonDays = parseInt(this.form.bookingHorizonDays, 10);
    const reminderLeadTimeMinutes = parseInt(this.form.reminderLeadTimeMinutes, 10);

    if (isNaN(bookingIntervalMinutes) || bookingIntervalMinutes < 1) {
      this.formError = 'Booking interval must be a positive integer (minutes).';
      return;
    }
    if (isNaN(leadTimeMinutes) || leadTimeMinutes < 0) {
      this.formError = 'Lead time must be zero or a positive integer (minutes).';
      return;
    }
    if (isNaN(bookingHorizonDays) || bookingHorizonDays < 1) {
      this.formError = 'Booking horizon must be a positive integer (days).';
      return;
    }
    if (isNaN(reminderLeadTimeMinutes) || reminderLeadTimeMinutes < 0) {
      this.formError = 'Reminder lead time must be zero or a positive integer (minutes).';
      return;
    }

    const payload: UpdateAppointmentPolicyRequest = {
      bookingIntervalMinutes,
      leadTimeMinutes,
      bookingHorizonDays,
      reminderLeadTimeMinutes
    };

    this.saving = true;
    this.merchantApi.updateAppointmentPolicy(this.selectedEnvironment, this.apiVersion, this.merchantId, payload).subscribe({
      next: (updated) => {
        this.saving = false;
        this.policy = updated;
        this.editMode = false;
        this.notifications.success('Appointment policy updated.');
      },
      error: (error) => {
        this.saving = false;
        this.notifications.apiError(error, 'Unable to update appointment policy.');
      }
    });
  }

  private policyToForm(policy: AppointmentPolicy): AppointmentPolicyFormModel {
    return {
      bookingIntervalMinutes: String(policy.bookingIntervalMinutes),
      leadTimeMinutes: String(policy.leadTimeMinutes),
      bookingHorizonDays: String(policy.bookingHorizonDays),
      reminderLeadTimeMinutes: String(policy.reminderLeadTimeMinutes)
    };
  }

  private emptyForm(): AppointmentPolicyFormModel {
    return { bookingIntervalMinutes: '', leadTimeMinutes: '', bookingHorizonDays: '', reminderLeadTimeMinutes: '' };
  }

}
