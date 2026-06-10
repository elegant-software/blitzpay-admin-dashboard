import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { PlatformKpiService } from './platform-kpi.service';
import { PlatformKpiReport } from '../platform-kpi-dashboard/platform-kpi-dashboard.models';

describe('PlatformKpiService', () => {
  let service: PlatformKpiService;
  let httpTestingController: HttpTestingController;

  const environment: BackendEnvironment = {
    key: 'local',
    label: 'Local',
    baseUrl: 'http://localhost:8080',
    storefrontUrl: 'http://localhost:4201',
  };
  const apiVersion = 'v1';

  const mockReport: PlatformKpiReport = {
    from: '2026-06-01',
    to: '2026-06-10',
    merchantId: null,
    revenue: {
      currency: 'EUR',
      grossAmountMinor: 150000,
      processingFeeMinor: 3000,
      platformFeeMinor: 1500,
      netAmountMinor: 145500,
      settledTransactionCount: 12,
    },
    orders: {
      paidCount: 14,
      pendingCount: 3,
      failedOrCancelledCount: 2,
      byOrderType: [
        { orderType: 'PRE_ORDER', count: 10 },
        { orderType: 'WALK_IN_ORDERING', count: 4 },
      ],
    },
    appointments: { bookedCount: 8, completedCount: 22, cancelledCount: 3 },
    paymentMethodFrequency: [
      { paymentMethod: 'CARD', transactionCount: 9, sharePercent: 75.0 },
      { paymentMethod: 'PAY_BY_BANK', transactionCount: 3, sharePercent: 25.0 },
    ],
    merchantCounts: { totalCount: 45, activeCount: 38, newInPeriodCount: 2 },
    branchCounts: { totalCount: 112, activeCount: 99, newInPeriodCount: 5 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlatformKpiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PlatformKpiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('calls GET /reporting/dashboard/platform with from and to params', () => {
    let result: PlatformKpiReport | undefined;

    service.getReport(environment, apiVersion, '2026-06-01', '2026-06-10').subscribe((r) => {
      result = r;
    });

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/v1/reporting/dashboard/platform' &&
        r.params.get('from') === '2026-06-01' &&
        r.params.get('to') === '2026-06-10' &&
        !r.params.has('merchantId'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
    expect(result).toEqual(mockReport);
  });

  it('includes merchantId param when provided', () => {
    const merchantId = 'merchant-abc';
    service.getReport(environment, apiVersion, '2026-06-01', '2026-06-10', merchantId).subscribe();

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/v1/reporting/dashboard/platform' &&
        r.params.get('merchantId') === merchantId,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ ...mockReport, merchantId, merchantCounts: null, branchCounts: null });
  });

  it('omits merchantId param when merchantId is an empty string', () => {
    service.getReport(environment, apiVersion, '2026-06-01', '2026-06-10', '').subscribe();

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/v1/reporting/dashboard/platform' &&
        !r.params.has('merchantId'),
    );
    req.flush(mockReport);
  });
});
