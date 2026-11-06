import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import {
  AppointmentResponse,
  AppointmentStatus,
  Branch,
  EnvironmentKey,
  MerchantSearchResultItem,
  OverrideFormModel,
  SupportOverrideAppointmentRequest
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import { MerchantSearchComponent } from '../shared/merchant-search.component';

type BranchCalendarDialog = 'detail' | 'override' | null;

@Component({
  selector: 'app-branch-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe, MerchantSearchComponent],
  templateUrl: './branch-calendar.component.html',
  styleUrl: './branch-calendar.component.css'
})
export class BranchCalendarComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  branchIdInput = '';
  branchId = '';

  merchantQuery = '';
  merchantResults: MerchantSearchResultItem[] = [];
  selectedMerchantItem: MerchantSearchResultItem | null = null;
  branches: Branch[] = [];
  branchQuery = '';
  selectedBranch: Branch | null = null;
  loadingBranches = false;

  fromDate = '';
  toDate = '';

  appointments: AppointmentResponse[] = [];
  filteredAppointments: AppointmentResponse[] = [];
  statusFilter: AppointmentStatus | '' = '';

  loading = false;
  errorMessage = '';


  selectedAppointment: AppointmentResponse | null = null;
  activeDialog: BranchCalendarDialog = null;

  dialogError = '';
  overrideForm: OverrideFormModel = this.emptyOverrideForm();

  ngOnInit(): void {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    this.fromDate = this.toDateInputValue(weekAgo);
    this.toDate = this.toDateInputValue(nextWeek);
  }

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
    this.merchantResults = [];
    this.selectedBranch = null;
    this.branchIdInput = '';
    this.branches = [];
    this.branchQuery = '';
    this.loadingBranches = true;
    this.merchantApi.getBranches(this.selectedEnvironment, this.apiVersion, m.merchantId).subscribe({
      next: branches => {
        this.branches = branches.filter(b => b.active !== false);
        this.loadingBranches = false;
      },
      error: () => { this.loadingBranches = false; }
    });
  }

  get filteredBranches(): Branch[] {
    const q = this.branchQuery.trim().toLowerCase();
    if (!q) return this.branches;
    return this.branches.filter(b =>
      b.name.toLowerCase().includes(q) || (b.branchCode ?? '').toLowerCase().includes(q)
    );
  }

  selectBranch(b: Branch): void {
    this.selectedBranch = b;
    this.branchIdInput = b.branchId ?? b.id ?? '';
  }

  clearMerchantFilter(): void {
    this.selectedMerchantItem = null;
    this.merchantQuery = '';
    this.merchantResults = [];
    this.branches = [];
    this.branchQuery = '';
    this.selectedBranch = null;
    this.branchIdInput = '';
    this.branchId = '';
  }

  get canSearch(): boolean {
    return !!this.selectedBranch && this.fromDate.length > 0 && this.toDate.length > 0;
  }

  loadAppointments(): void {
    const branchId = this.branchIdInput.trim();
    if (!branchId) {
      this.errorMessage = 'Select a branch before loading the calendar.';
      return;
    }
    if (!this.fromDate || !this.toDate) {
      this.errorMessage = 'Both From and To dates are required.';
      return;
    }

    this.branchId = branchId;
    this.errorMessage = '';

    this.loading = true;
    this.appointments = [];
    this.filteredAppointments = [];

    const from = this.toIsoInstant(this.fromDate, 'start');
    const to = this.toIsoInstant(this.toDate, 'end');

    this.merchantApi
      .getBranchCalendarAppointments(this.selectedEnvironment, this.apiVersion, branchId, from, to)
      .subscribe({
        next: (appointments) => {
          this.loading = false;
          this.appointments = appointments;
          this.applyStatusFilter();

        },
        error: (error) => {
          this.loading = false;
          this.notifications.apiError(error, 'Unable to load appointments.');
        }
      });
  }

  clearSearch(): void {
    this.branchIdInput = '';
    this.branchId = '';
    this.merchantQuery = '';
    this.merchantResults = [];
    this.selectedMerchantItem = null;
    this.branches = [];
    this.branchQuery = '';
    this.selectedBranch = null;
    this.statusFilter = '';
    this.appointments = [];
    this.filteredAppointments = [];
    this.errorMessage = '';

    this.closeDialog();
  }

  onStatusFilterChange(): void {
    this.applyStatusFilter();
  }

  openDetailDialog(appointment: AppointmentResponse): void {
    this.selectedAppointment = appointment;
    this.dialogError = '';
    this.activeDialog = 'detail';
  }

  openOverrideDialog(appointment: AppointmentResponse): void {
    this.selectedAppointment = appointment;
    this.overrideForm = {
      newProductId: appointment.productId,
      newProductCategoryId: appointment.productCategoryId,
      newStartTime: this.toDatetimeLocalValue(appointment.startTime),
      newEmployeeId: appointment.employeeId ?? '',
      reason: ''
    };
    this.dialogError = '';
    this.activeDialog = 'override';
  }

  closeDialog(): void {
    this.activeDialog = null;
    this.selectedAppointment = null;
    this.dialogError = '';
    this.overrideForm = this.emptyOverrideForm();
  }

  cancelAppointment(appointment: AppointmentResponse): void {
    if (!confirm(`Cancel appointment for ${appointment.contactName} on ${new Date(appointment.startTime).toLocaleString()}?`)) {
      return;
    }

    const merchantId = appointment.merchantId;
    this.loading = true;
    this.errorMessage = '';
    this.merchantApi.cancelAppointment(this.selectedEnvironment, this.apiVersion, merchantId, appointment.id).subscribe({
      next: () => {
        this.loading = false;
        this.updateAppointmentInList({ ...appointment, status: 'CANCELLED' });
        if (this.selectedAppointment?.id === appointment.id) {
          this.selectedAppointment = { ...appointment, status: 'CANCELLED' };
        }
        this.notifications.success('Appointment cancelled.');
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Unable to cancel appointment.');
      }
    });
  }

  overrideAppointment(): void {
    if (!this.selectedAppointment) return;
    this.dialogError = '';

    if (!this.overrideForm.newProductId.trim()) {
      this.dialogError = 'Product ID is required.';
      return;
    }
    if (!this.overrideForm.newProductCategoryId.trim()) {
      this.dialogError = 'Product Category ID is required.';
      return;
    }
    if (!this.overrideForm.newStartTime.trim()) {
      this.dialogError = 'New start time is required.';
      return;
    }
    if (!this.overrideForm.reason.trim()) {
      this.dialogError = 'Override reason is required.';
      return;
    }

    const payload: SupportOverrideAppointmentRequest = {
      newProductId: this.overrideForm.newProductId.trim(),
      newProductCategoryId: this.overrideForm.newProductCategoryId.trim(),
      newStartTime: new Date(this.overrideForm.newStartTime).toISOString(),
      newEmployeeId: this.overrideForm.newEmployeeId.trim() || null,
      reason: this.overrideForm.reason.trim()
    };

    this.loading = true;
    this.merchantApi
      .overrideAppointment(
        this.selectedEnvironment,
        this.apiVersion,
        this.selectedAppointment.merchantId,
        this.selectedAppointment.id,
        payload
      )
      .subscribe({
        next: (updated) => {
          this.loading = false;
          this.updateAppointmentInList(updated);
          this.closeDialog();
          this.notifications.success('Appointment override applied.');
        },
        error: (error) => {
          this.loading = false;
          this.notifications.apiError(error, 'Unable to apply override.');
        }
      });
  }

  get overrideSubmitDisabled(): boolean {
    return this.loading || !this.overrideForm.reason.trim();
  }

  appointmentStatusTone(status: AppointmentStatus): string {
    switch (status) {
      case 'BOOKED': return 'status-tag-warning';
      case 'COMPLETED': return 'status-tag-success';
      case 'CANCELLED': return 'status-tag-neutral';
    }
  }

  appointmentStatusLabel(status: AppointmentStatus): string {
    switch (status) {
      case 'BOOKED': return 'Booked';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
    }
  }

  private applyStatusFilter(): void {
    if (!this.statusFilter) {
      this.filteredAppointments = [...this.appointments];
    } else {
      this.filteredAppointments = this.appointments.filter(a => a.status === this.statusFilter);
    }
  }

  private updateAppointmentInList(updated: AppointmentResponse): void {
    this.appointments = this.appointments.map(a => a.id === updated.id ? updated : a);
    this.applyStatusFilter();
  }

  private emptyOverrideForm(): OverrideFormModel {
    return { newProductId: '', newProductCategoryId: '', newStartTime: '', newEmployeeId: '', reason: '' };
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toIsoInstant(dateStr: string, boundary: 'start' | 'end'): string {
    const d = new Date(dateStr);
    if (boundary === 'start') {
      d.setHours(0, 0, 0, 0);
    } else {
      d.setHours(23, 59, 59, 999);
    }
    return d.toISOString();
  }

  private toDatetimeLocalValue(isoString: string): string {
    const d = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

}
