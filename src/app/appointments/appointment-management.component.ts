import { inject as injectAdminLocale } from '@angular/core';
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import {
  AppointmentFormModel,
  AppointmentResponse,
  AppointmentStatus,
  Branch,
  MerchantBookAppointmentRequest,
  MerchantSearchResultItem,
  NoteEditFormModel,
  OverrideFormModel,
  Product,
  ProductCategory,
  RescheduleAppointmentRequest,
  RescheduleFormModel,
  SupportOverrideAppointmentRequest,
  UpdateAppointmentNoteRequest
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import { MerchantSearchComponent } from '../shared/merchant-search.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnvironmentKey } from '../models/merchant-catalog.models';

type AppointmentDialog = 'create' | 'detail' | 'reschedule' | 'override' | 'editNote' | null;

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule, DisplayDatePipe, MerchantSearchComponent],
  templateUrl: './appointment-management.component.html',
  styleUrl: './appointment-management.component.css'
})
export class AppointmentManagementComponent implements OnInit {
  readonly adminLocale = injectAdminLocale(AdminLocaleService);
  private readonly notifications = inject(NotificationService);
  selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  merchantIdInput = '';
  merchantId = '';
  merchantQuery = '';
  merchantResults: MerchantSearchResultItem[] = [];
  selectedMerchantItem: MerchantSearchResultItem | null = null;
  employeeIdFilter = '';

  fromDate = '';
  toDate = '';

  appointments: AppointmentResponse[] = [];
  filteredAppointments: AppointmentResponse[] = [];
  statusFilter: AppointmentStatus | '' = '';

  loading = false;
  errorMessage = '';


  selectedAppointment: AppointmentResponse | null = null;
  activeDialog: AppointmentDialog = null;

  dialogError = '';
  dialogSuccess = '';

  // Supporting data (branches, categories, products) loaded for the merchant
  branches: Branch[] = [];
  categories: ProductCategory[] = [];
  products: Product[] = [];
  supportDataLoading = false;

  // Create form
  createForm: AppointmentFormModel = this.emptyCreateForm();

  // Reschedule form
  rescheduleForm: RescheduleFormModel = this.emptyRescheduleForm();

  // Override form
  overrideForm: OverrideFormModel = this.emptyOverrideForm();

  // Note/contact edit form
  noteEditForm: NoteEditFormModel = this.emptyNoteEditForm();

  ngOnInit(): void {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    this.fromDate = this.toDateInputValue(weekAgo);
    this.toDate = this.toDateInputValue(nextWeek);

    const merchantId = this.route.snapshot.queryParamMap.get('merchantId');
    if (merchantId) {
      this.merchantApi.getMerchant(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
        next: (merchant) => {
          const item: MerchantSearchResultItem = {
            merchantId: merchant.merchantId,
            merchantName: merchant.merchantName,
            merchantCode: merchant.merchantCode,
            city: null,
            country: null,
            businessType: merchant.businessType ?? '',
            merchantMobility: merchant.merchantMobility ?? '',
            merchantStatus: merchant.merchantStatus,
            lastUpdatedAt: merchant.lastUpdatedAt,
          };
          this.selectMerchantForFilter(item);
          this.loadAppointments();
        },
      });
    }
  }

  constructor(
    private readonly merchantApi: MerchantApiService,
    private readonly route: ActivatedRoute,
  ) {}

  get selectedEnvironment() {
    return getEnvironmentByKey(this.selectedEnvironmentKey);
  }

  get bookedCount(): number {
    return this.appointments.filter(appointment => appointment.status === 'BOOKED').length;
  }

  get completedCount(): number {
    return this.appointments.filter(appointment => appointment.status === 'COMPLETED').length;
  }

  get cancelledCount(): number {
    return this.appointments.filter(appointment => appointment.status === 'CANCELLED').length;
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
  }

  get canSearch(): boolean {
    return !!this.selectedMerchantItem && this.fromDate.length > 0 && this.toDate.length > 0;
  }

  loadAppointments(): void {
    const merchantId = this.merchantIdInput.trim();
    if (!merchantId) {
      this.errorMessage = 'Select a merchant before searching.';
      return;
    }
    if (!this.fromDate || !this.toDate) {
      this.errorMessage = 'Both From and To dates are required.';
      return;
    }

    this.merchantId = merchantId;
    this.errorMessage = '';

    this.loading = true;
    this.appointments = [];
    this.filteredAppointments = [];

    const from = this.toIsoInstant(this.fromDate, 'start');
    const to = this.toIsoInstant(this.toDate, 'end');

    const load$ = this.employeeIdFilter.trim()
      ? this.merchantApi.listAppointmentsByEmployee(
          this.selectedEnvironment,
          this.apiVersion,
          merchantId,
          this.employeeIdFilter.trim(),
          from,
          to
        )
      : this.merchantApi.listAppointments(this.selectedEnvironment, this.apiVersion, merchantId, from, to);

    load$.subscribe({
      next: (appointments) => {
        this.loading = false;
        this.appointments = appointments;
        this.applyStatusFilter();


        if (this.branches.length === 0 && this.categories.length === 0 && this.products.length === 0) {
          this.loadSupportData(merchantId);
        }
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Unable to load appointments.');
      }
    });
  }

  clearSearch(): void {
    this.merchantIdInput = '';
    this.merchantId = '';
    this.merchantQuery = '';
    this.merchantResults = [];
    this.selectedMerchantItem = null;
    this.employeeIdFilter = '';
    this.statusFilter = '';
    this.appointments = [];
    this.filteredAppointments = [];
    this.branches = [];
    this.categories = [];
    this.products = [];
    this.errorMessage = '';

    this.closeDialog(true);
  }

  onStatusFilterChange(): void {
    this.applyStatusFilter();
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

  openCreateDialog(): void {
    if (!this.merchantId) {
      this.errorMessage = 'Load appointments for a merchant first.';
      return;
    }
    this.createForm = this.emptyCreateForm();
    this.dialogError = '';
    this.dialogSuccess = '';
    this.activeDialog = 'create';
  }

  openRescheduleDialog(appointment: AppointmentResponse): void {
    this.selectedAppointment = appointment;
    this.rescheduleForm = {
      newProductId: appointment.productId,
      newProductCategoryId: appointment.productCategoryId,
      newStartTime: this.toDatetimeLocalValue(appointment.startTime),
      newEmployeeId: appointment.employeeId ?? ''
    };
    this.dialogError = '';
    this.dialogSuccess = '';
    this.activeDialog = 'reschedule';
  }

  openDetailDialog(appointment: AppointmentResponse): void {
    this.selectedAppointment = appointment;
    this.dialogError = '';
    this.dialogSuccess = '';
    this.activeDialog = 'detail';
  }

  openNoteEditDialog(appointment: AppointmentResponse): void {
    this.selectedAppointment = appointment;
    this.noteEditForm = {
      note: appointment.note ?? '',
      contactName: appointment.contactType === 'MERCHANT_CAPTURED' ? appointment.contactName : '',
      contactEmail: appointment.contactType === 'MERCHANT_CAPTURED' ? (appointment.contactEmail ?? '') : '',
      contactPhone: appointment.contactType === 'MERCHANT_CAPTURED' ? (appointment.contactPhone ?? '') : ''
    };
    this.dialogError = '';
    this.dialogSuccess = '';
    this.activeDialog = 'editNote';
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
    this.dialogSuccess = '';
    this.activeDialog = 'override';
  }

  closeDialog(force = false): void {
    this.activeDialog = null;
    this.selectedAppointment = null;
    this.dialogError = '';
    this.dialogSuccess = '';
    this.createForm = this.emptyCreateForm();
    this.rescheduleForm = this.emptyRescheduleForm();
    this.overrideForm = this.emptyOverrideForm();
    this.noteEditForm = this.emptyNoteEditForm();
  }

  saveNoteEdit(): void {
    if (!this.selectedAppointment) return;
    this.dialogError = '';

    const isMerchantCaptured = this.selectedAppointment.contactType === 'MERCHANT_CAPTURED';
    const payload: UpdateAppointmentNoteRequest = {
      note: this.noteEditForm.note.trim() || null
    };

    if (isMerchantCaptured) {
      if (!this.noteEditForm.contactName.trim()) {
        this.dialogError = 'Contact name is required for Merchant Captured contacts.';
        return;
      }
      payload.contactName = this.noteEditForm.contactName.trim();
      payload.contactEmail = this.noteEditForm.contactEmail.trim() || null;
      payload.contactPhone = this.noteEditForm.contactPhone.trim() || null;
    }

    this.loading = true;
    this.merchantApi
      .patchAppointment(this.selectedEnvironment, this.apiVersion, this.merchantId, this.selectedAppointment.id, payload)
      .subscribe({
        next: (updated) => {
          this.loading = false;
          this.updateAppointmentInList(updated);
          this.closeDialog(true);
          this.notifications.success('Appointment updated.');
        },
        error: (error) => {
          this.loading = false;
          this.notifications.apiError(error, 'Unable to update appointment.');
        }
      });
  }

  createAppointment(): void {
    this.dialogError = '';

    if (!this.createForm.branchId.trim()) {
      this.dialogError = 'Branch is required.';
      return;
    }
    if (!this.createForm.productId.trim()) {
      this.dialogError = 'Product is required.';
      return;
    }
    if (!this.createForm.productCategoryId.trim()) {
      this.dialogError = 'Product category is required.';
      return;
    }
    if (!this.createForm.startTime.trim()) {
      this.dialogError = 'Start time is required.';
      return;
    }
    if (!this.createForm.contactName.trim()) {
      this.dialogError = 'Contact name is required.';
      return;
    }

    const payload: MerchantBookAppointmentRequest = {
      branchId: this.createForm.branchId.trim(),
      productId: this.createForm.productId.trim(),
      productCategoryId: this.createForm.productCategoryId.trim(),
      startTime: new Date(this.createForm.startTime).toISOString(),
      employeeId: this.createForm.employeeId.trim() || null,
      contactName: this.createForm.contactName.trim(),
      contactEmail: this.createForm.contactEmail.trim() || null,
      contactPhone: this.createForm.contactPhone.trim() || null,
      note: this.createForm.note.trim() || null
    };

    this.loading = true;
    this.merchantApi.createAppointment(this.selectedEnvironment, this.apiVersion, this.merchantId, payload).subscribe({
      next: (appointment) => {
        this.loading = false;
        this.appointments = [appointment, ...this.appointments];
        this.applyStatusFilter();
        this.closeDialog(true);
        this.notifications.success('Appointment created.');
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Unable to create appointment.');
      }
    });
  }

  cancelAppointment(appointment: AppointmentResponse): void {
    if (!confirm(this.adminLocale.text(`Cancel appointment for ${appointment.contactName} on ${new DisplayDatePipe().transform(appointment.startTime)}?`))) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.merchantApi.cancelAppointment(this.selectedEnvironment, this.apiVersion, this.merchantId, appointment.id).subscribe({
      next: () => {
        this.loading = false;
        this.updateAppointmentInList({ ...appointment, status: 'CANCELLED' });
        this.notifications.success('Appointment cancelled.');
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Unable to cancel appointment.');
      }
    });
  }

  completeAppointment(appointment: AppointmentResponse): void {
    if (!confirm(this.adminLocale.text(`Mark appointment for ${appointment.contactName} as complete?`))) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.merchantApi.completeAppointment(this.selectedEnvironment, this.apiVersion, this.merchantId, appointment.id).subscribe({
      next: (updated) => {
        this.loading = false;
        this.updateAppointmentInList(updated);
        this.notifications.success('Appointment marked as complete.');
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Unable to complete appointment.');
      }
    });
  }

  rescheduleAppointment(): void {
    if (!this.selectedAppointment) return;
    this.dialogError = '';

    if (!this.rescheduleForm.newProductId.trim()) {
      this.dialogError = 'Product is required.';
      return;
    }
    if (!this.rescheduleForm.newProductCategoryId.trim()) {
      this.dialogError = 'Product category is required.';
      return;
    }
    if (!this.rescheduleForm.newStartTime.trim()) {
      this.dialogError = 'New start time is required.';
      return;
    }

    const payload: RescheduleAppointmentRequest = {
      newProductId: this.rescheduleForm.newProductId.trim(),
      newProductCategoryId: this.rescheduleForm.newProductCategoryId.trim(),
      newStartTime: new Date(this.rescheduleForm.newStartTime).toISOString(),
      newEmployeeId: this.rescheduleForm.newEmployeeId.trim() || null
    };

    this.loading = true;
    this.merchantApi
      .rescheduleAppointment(this.selectedEnvironment, this.apiVersion, this.merchantId, this.selectedAppointment.id, payload)
      .subscribe({
        next: (updated) => {
          this.loading = false;
          this.updateAppointmentInList(updated);
          this.closeDialog(true);
          this.notifications.success('Appointment rescheduled.');
        },
        error: (error) => {
          this.loading = false;
          this.notifications.apiError(error, 'Unable to reschedule appointment.');
        }
      });
  }

  overrideAppointment(): void {
    if (!this.selectedAppointment) return;
    this.dialogError = '';

    if (!this.overrideForm.newProductId.trim()) {
      this.dialogError = 'Product is required.';
      return;
    }
    if (!this.overrideForm.newProductCategoryId.trim()) {
      this.dialogError = 'Product category is required.';
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
      .overrideAppointment(this.selectedEnvironment, this.apiVersion, this.merchantId, this.selectedAppointment.id, payload)
      .subscribe({
        next: (updated) => {
          this.loading = false;
          this.updateAppointmentInList(updated);
          this.closeDialog(true);
          this.notifications.success('Appointment override applied.');
        },
        error: (error) => {
          this.loading = false;
          this.notifications.apiError(error, 'Unable to apply override.');
        }
      });
  }

  get productsForSelectedBranch(): Product[] {
    const branchId = this.createForm.branchId;
    if (!branchId) return this.products;
    return this.products.filter(p => p.branchId === branchId || !p.branchId);
  }

  get categoriesForSelectedProduct(): ProductCategory[] {
    return this.categories;
  }

  private loadSupportData(merchantId: string): void {
    this.supportDataLoading = true;
    forkJoin({
      branches: this.merchantApi
        .getBranches(this.selectedEnvironment, this.apiVersion, merchantId)
        .pipe(catchError(() => of([]))),
      categories: this.merchantApi
        .getProductCategories(this.selectedEnvironment, this.apiVersion, merchantId)
        .pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ branches, categories }) => {
        this.branches = branches;
        this.categories = categories;
        this.supportDataLoading = false;
      },
      error: () => {
        this.supportDataLoading = false;
      }
    });
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

  private emptyCreateForm(): AppointmentFormModel {
    return {
      branchId: '',
      productId: '',
      productCategoryId: '',
      startTime: '',
      employeeId: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      note: ''
    };
  }

  private emptyRescheduleForm(): RescheduleFormModel {
    return {
      newProductId: '',
      newProductCategoryId: '',
      newStartTime: '',
      newEmployeeId: ''
    };
  }

  private emptyOverrideForm(): OverrideFormModel {
    return {
      newProductId: '',
      newProductCategoryId: '',
      newStartTime: '',
      newEmployeeId: '',
      reason: ''
    };
  }

  private emptyNoteEditForm(): NoteEditFormModel {
    return { note: '', contactName: '', contactEmail: '', contactPhone: '' };
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
