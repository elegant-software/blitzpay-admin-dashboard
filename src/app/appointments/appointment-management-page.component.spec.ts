import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AppointmentResponse } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { AppointmentManagementComponent } from './appointment-management.component';

describe('AppointmentManagementComponent', () => {
  let fixture: ComponentFixture<AppointmentManagementComponent>;
  let component: AppointmentManagementComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const appointment = (id: string, status: AppointmentResponse['status']): AppointmentResponse => ({
    id,
    merchantId: 'merchant-abc',
    branchId: 'branch-1',
    productId: 'product-1',
    productName: 'Consultation',
    productCategoryId: 'category-1',
    employeeId: null,
    employeeName: null,
    status,
    startTime: '2026-06-10T10:00:00Z',
    endTime: '2026-06-10T11:00:00Z',
    contactType: 'MERCHANT_CAPTURED',
    contactName: 'Alex Morgan',
    contactEmail: 'alex@example.com',
    contactPhone: null,
    shopperAccountId: null,
    note: null,
    cancelledReason: null
  });

  beforeEach(async () => {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', [
      'searchMerchants',
      'listAppointments',
      'listAppointmentsByEmployee',
      'getBranches',
      'getProductCategories'
    ]);
    merchantApi.searchMerchants.and.returnValue(of({ results: [], page: 0, size: 50, totalElements: 0, totalPages: 0 }));
    merchantApi.listAppointments.and.returnValue(of([]));
    merchantApi.listAppointmentsByEmployee.and.returnValue(of([]));
    merchantApi.getBranches.and.returnValue(of([]));
    merchantApi.getProductCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppointmentManagementComponent],
      providers: [
        { provide: MerchantApiService, useValue: merchantApi },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('presents the appointment search workspace and filter controls', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Appointments');
    expect(root.querySelector('.appointment-filter-card h2')?.textContent).toContain('Find appointments');
    expect(root.querySelector('#appt-merchant-search')).not.toBeNull();
    expect(root.querySelector('#appt-from')).not.toBeNull();
    expect(root.querySelector('#appt-to')).not.toBeNull();
  });

  it('shows appointment status counts for the selected merchant', () => {
    component.merchantId = 'merchant-abc';
    component.appointments = [
      appointment('booked-1', 'BOOKED'),
      appointment('booked-2', 'BOOKED'),
      appointment('completed-1', 'COMPLETED'),
      appointment('cancelled-1', 'CANCELLED')
    ];
    fixture.detectChanges();

    expect(component.bookedCount).toBe(2);
    expect(component.completedCount).toBe(1);
    expect(component.cancelledCount).toBe(1);
    expect(fixture.nativeElement.querySelector('.appointment-overview')?.textContent).toContain('In date range');
  });
});
