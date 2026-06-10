import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlatformKpiDashboardComponent } from './platform-kpi-dashboard.component';
import { PlatformKpiReport } from './platform-kpi-dashboard.models';

const mockReport: PlatformKpiReport = {
  from: '2026-05-11',
  to: '2026-06-10',
  merchantId: null,
  revenue: {
    currency: 'EUR',
    grossAmountMinor: 200000,
    processingFeeMinor: 4000,
    platformFeeMinor: 2000,
    netAmountMinor: 194000,
    settledTransactionCount: 20,
  },
  orders: {
    paidCount: 18,
    pendingCount: 2,
    failedOrCancelledCount: 1,
    byOrderType: [{ orderType: 'WALK_IN_ORDERING', count: 18 }],
  },
  appointments: { bookedCount: 5, completedCount: 15, cancelledCount: 1 },
  paymentMethodFrequency: [
    { paymentMethod: 'CARD', transactionCount: 18, sharePercent: 90.0 },
    { paymentMethod: 'PAY_BY_BANK', transactionCount: 2, sharePercent: 10.0 },
  ],
  merchantCounts: { totalCount: 50, activeCount: 42, newInPeriodCount: 3 },
  branchCounts: { totalCount: 120, activeCount: 110, newInPeriodCount: 6 },
};

describe('PlatformKpiDashboardComponent', () => {
  let component: PlatformKpiDashboardComponent;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformKpiDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(PlatformKpiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit → searchMerchants + load()

    // Flush merchant list first, then the KPI report.
    const merchantReq = httpTestingController.expectOne((r) =>
      r.url.includes('/merchants/search'),
    );
    merchantReq.flush({ results: [], page: 0, size: 200, totalElements: 0, totalPages: 0 });

    const kpiReq = httpTestingController.expectOne((r) =>
      r.url.includes('/reporting/dashboard/platform'),
    );
    kpiReq.flush(mockReport);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('populates report after successful load', () => {
    expect(component.report).toEqual(mockReport);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('sets error and clears loading on HTTP failure', () => {
    component.error = null;
    component.load(); // only KPI request; merchant list already loaded

    const req = httpTestingController.expectOne((r) =>
      r.url.includes('/reporting/dashboard/platform'),
    );
    req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(component.loading).toBeFalse();
    expect(component.error).toBeTruthy();
  });

  it('isDrillDown is false when report has no merchantId', () => {
    component.report = { ...mockReport, merchantId: null };
    expect(component.isDrillDown).toBeFalse();
  });

  it('isDrillDown is true when report has a merchantId', () => {
    component.report = { ...mockReport, merchantId: 'merchant-abc' };
    expect(component.isDrillDown).toBeTrue();
  });

  it('formatMinor divides by 100 and formats with currency', () => {
    const formatted = component.formatMinor(150000, 'EUR');
    expect(formatted).toContain('1.500');
  });
});
