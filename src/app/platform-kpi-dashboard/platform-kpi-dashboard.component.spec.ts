import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let fixture: ComponentFixture<PlatformKpiDashboardComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformKpiDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(PlatformKpiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit → load()

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

  it('presents an accessible page heading and clearly grouped reporting filters', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Platform dashboard');
    expect(element.querySelector('[aria-labelledby="dashboard-filters-title"]')).not.toBeNull();
    expect(element.querySelector('label[for="dashboard-from"]')).not.toBeNull();
    expect(element.querySelector('label[for="dashboard-to"]')).not.toBeNull();
    expect(element.querySelector('label[for="dashboard-merchant-search"]')).not.toBeNull();
  });

  it('keeps the selected merchant summary and change action within its filter field', () => {
    component.selectedMerchant = {
      merchantId: 'merchant-1',
      merchantName: '[LOCAL TEST] Bremen Viertel Food Truck',
      merchantCode: 'MRC-939081A2D2',
      city: 'Bremen',
      country: 'Germany',
      businessType: 'FOOD_TRUCK',
      merchantMobility: 'BRICK_AND_MORTAR',
      merchantStatus: 'ACTIVE',
      lastUpdatedAt: '',
    };
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.dashboard-selected-merchant')).not.toBeNull();
    expect(element.querySelector('.dashboard-selected-merchant-name')?.textContent).toContain(
      '[LOCAL TEST] Bremen Viertel Food Truck',
    );
    expect(element.querySelector('.dashboard-selected-merchant-code')?.textContent).toContain(
      'MRC-939081A2D2',
    );
    const changeButton = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Change selected merchant"]',
    );
    expect(changeButton).not.toBeNull();
    changeButton?.click();
    fixture.detectChanges();

    expect(component.selectedMerchant).toBeNull();
    expect(element.querySelector('.dashboard-selected-merchant')).toBeNull();
    expect(element.querySelector('#dashboard-merchant-search')).not.toBeNull();
  });

  it('announces KPI loading and report errors as accessible status messages', () => {
    const element = fixture.nativeElement as HTMLElement;
    component.report = null;
    component.loading = true;
    fixture.detectChanges();
    expect(element.querySelector('.dashboard-loading[role="status"]')).not.toBeNull();

    component.loading = false;
    component.error = 'Could not load the report.';
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"][aria-live="assertive"]')?.textContent).toContain('Could not load the report.');
  });
});
