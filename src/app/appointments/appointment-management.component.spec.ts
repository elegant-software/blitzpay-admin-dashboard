import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  AppointmentResponse,
  BackendEnvironment,
  MerchantBookAppointmentRequest,
  RescheduleAppointmentRequest,
  SupportOverrideAppointmentRequest
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';

describe('MerchantApiService — Appointment API', () => {
  let service: MerchantApiService;
  let httpTestingController: HttpTestingController;

  const environment: BackendEnvironment = {
    key: 'local',
    label: 'Local',
    baseUrl: 'http://localhost:8080',
    storefrontUrl: 'http://localhost:4201'
  };
  const apiVersion = 'v1';
  const merchantId = 'merchant-abc';
  const appointmentId = 'appt-123';

  const appointmentResponse: AppointmentResponse = {
    id: appointmentId,
    merchantId,
    branchId: 'branch-1',
    productId: 'product-1',
    productName: 'Haircut',
    productCategoryId: 'cat-1',
    employeeId: 'emp-1',
    employeeName: 'Alice',
    status: 'BOOKED',
    startTime: '2026-06-10T10:00:00Z',
    endTime: '2026-06-10T11:00:00Z',
    contactType: 'MERCHANT_CAPTURED',
    contactName: 'Bob Smith',
    contactEmail: 'bob@example.com',
    contactPhone: null,
    shopperAccountId: null,
    note: null,
    cancelledReason: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MerchantApiService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(MerchantApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('lists appointments for a merchant with date range params', () => {
    const from = '2026-06-01T00:00:00.000Z';
    const to = '2026-06-30T23:59:59.999Z';
    let result: AppointmentResponse[] | undefined;

    service.listAppointments(environment, apiVersion, merchantId, from, to).subscribe((r) => { result = r; });

    const req = httpTestingController.expectOne(
      (r) => r.url === `http://localhost:8080/v1/merchants/${merchantId}/appointments`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('from')).toBe(from);
    expect(req.request.params.get('to')).toBe(to);

    req.flush([appointmentResponse]);

    expect(result).toEqual([appointmentResponse]);
  });

  it('lists appointments by employee with date range params', () => {
    const employeeId = 'emp-1';
    const from = '2026-06-01T00:00:00.000Z';
    const to = '2026-06-30T23:59:59.999Z';
    let result: AppointmentResponse[] | undefined;

    service.listAppointmentsByEmployee(environment, apiVersion, merchantId, employeeId, from, to).subscribe((r) => { result = r; });

    const req = httpTestingController.expectOne(
      (r) => r.url === `http://localhost:8080/v1/merchants/${merchantId}/appointments/employee/${employeeId}`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('from')).toBe(from);
    expect(req.request.params.get('to')).toBe(to);

    req.flush([appointmentResponse]);

    expect(result).toEqual([appointmentResponse]);
  });

  it('creates an appointment with the correct POST body', () => {
    const payload: MerchantBookAppointmentRequest = {
      branchId: 'branch-1',
      productId: 'product-1',
      productCategoryId: 'cat-1',
      startTime: '2026-06-10T10:00:00Z',
      employeeId: 'emp-1',
      contactName: 'Bob Smith',
      contactEmail: 'bob@example.com',
      contactPhone: null,
      note: null
    };
    let result: AppointmentResponse | undefined;

    service.createAppointment(environment, apiVersion, merchantId, payload).subscribe((r) => { result = r; });

    const req = httpTestingController.expectOne(
      `http://localhost:8080/v1/merchants/${merchantId}/appointments`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(appointmentResponse);

    expect(result).toEqual(appointmentResponse);
  });

  it('cancels an appointment via DELETE', () => {
    let completed = false;

    service.cancelAppointment(environment, apiVersion, merchantId, appointmentId).subscribe(() => { completed = true; });

    const req = httpTestingController.expectOne(
      `http://localhost:8080/v1/merchants/${merchantId}/appointments/${appointmentId}`
    );
    expect(req.request.method).toBe('DELETE');

    req.flush(null);

    expect(completed).toBeTrue();
  });

  it('marks an appointment as complete via PUT', () => {
    const completedAppointment: AppointmentResponse = { ...appointmentResponse, status: 'COMPLETED' };
    let result: AppointmentResponse | undefined;

    service.completeAppointment(environment, apiVersion, merchantId, appointmentId).subscribe((r) => { result = r; });

    const req = httpTestingController.expectOne(
      `http://localhost:8080/v1/merchants/${merchantId}/appointments/${appointmentId}/complete`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});

    req.flush(completedAppointment);

    expect(result).toEqual(completedAppointment);
  });

  it('reschedules an appointment with the correct PUT body', () => {
    const payload: RescheduleAppointmentRequest = {
      newProductId: 'product-2',
      newProductCategoryId: 'cat-2',
      newStartTime: '2026-06-15T14:00:00Z',
      newEmployeeId: 'emp-2'
    };
    const rescheduled: AppointmentResponse = { ...appointmentResponse, productId: 'product-2', startTime: '2026-06-15T14:00:00Z' };
    let result: AppointmentResponse | undefined;

    service.rescheduleAppointment(environment, apiVersion, merchantId, appointmentId, payload).subscribe((r) => { result = r; });

    const req = httpTestingController.expectOne(
      `http://localhost:8080/v1/merchants/${merchantId}/appointments/${appointmentId}/reschedule`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush(rescheduled);

    expect(result).toEqual(rescheduled);
  });

  it('applies a support override with the correct PUT body including reason', () => {
    const payload: SupportOverrideAppointmentRequest = {
      newProductId: 'product-3',
      newProductCategoryId: 'cat-1',
      newStartTime: '2026-06-20T09:00:00Z',
      newEmployeeId: null,
      reason: 'Customer requested urgent change.'
    };
    const overridden: AppointmentResponse = { ...appointmentResponse, productId: 'product-3', startTime: '2026-06-20T09:00:00Z' };
    let result: AppointmentResponse | undefined;

    service.overrideAppointment(environment, apiVersion, merchantId, appointmentId, payload).subscribe((r) => { result = r; });

    const req = httpTestingController.expectOne(
      `http://localhost:8080/v1/merchants/${merchantId}/appointments/${appointmentId}/override`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush(overridden);

    expect(result).toEqual(overridden);
  });
});
