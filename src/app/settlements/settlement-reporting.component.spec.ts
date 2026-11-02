import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MerchantSearchResultItem } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { SettlementReportingService } from '../services/settlement-reporting.service';
import { SettlementReportingComponent } from './settlement-reporting.component';
import { SettlementSummaryResponse } from './settlement-reporting.models';

describe('SettlementReportingComponent', () => {
  let fixture: ComponentFixture<SettlementReportingComponent>;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;
  let reportingService: jasmine.SpyObj<SettlementReportingService>;

  beforeEach(async () => {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', ['searchMerchants']);
    merchantApi.searchMerchants.and.returnValue(of({
      results: [],
      page: 0,
      size: 50,
      totalElements: 0,
      totalPages: 0
    }));

    reportingService = jasmine.createSpyObj<SettlementReportingService>(
      'SettlementReportingService',
      ['getSummary', 'getList', 'refreshVisible']
    );

    await TestBed.configureTestingModule({
      imports: [SettlementReportingComponent],
      providers: [
        { provide: MerchantApiService, useValue: merchantApi },
        { provide: SettlementReportingService, useValue: reportingService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettlementReportingComponent);
    fixture.detectChanges();
  });

  it('presents the settlement reporting workspace and date filters', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.settlement-page-header h1')?.textContent).toContain('Settlements');
    expect(root.querySelector('#settlement-from')).not.toBeNull();
    expect(root.querySelector('#settlement-to')).not.toBeNull();
    expect(root.querySelector('#settlement-merchant-search')).not.toBeNull();

    const page = root.querySelector<HTMLElement>('.settlement-page');
    expect(parseFloat(getComputedStyle(page!).paddingTop)).toBeGreaterThan(0);
    expect(parseFloat(getComputedStyle(page!).paddingLeft)).toBeGreaterThan(0);
  });

  it('shows fee breakdown and payment methods in the summary', () => {
    const summary: SettlementSummaryResponse = {
      merchantId: 'merchant-1',
      from: '2026-11-01',
      to: '2026-11-30',
      currency: 'EUR',
      transactionCount: 12,
      grossAmountMinor: 120000,
      processingFeeMinor: 3600,
      platformFeeMinor: 2400,
      netAmountMinor: 114000,
      byPaymentMethod: [{
        paymentMethod: 'CARD',
        transactionCount: 12,
        grossAmountMinor: 120000,
        netAmountMinor: 114000
      }]
    };

    fixture.componentInstance.summary = summary;
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.settlement-stat-card').length).toBe(5);
    expect(root.querySelector('.settlement-method-item')?.textContent).toContain('CARD');
    expect(root.querySelector('.settlement-stat-net')?.textContent).toContain('Net to merchant');
  });

  it('renders merchant search results as keyboard-operable buttons', () => {
    const merchant: MerchantSearchResultItem = {
      merchantId: 'merchant-1',
      merchantName: 'Northstar Cafe',
      merchantCode: 'NS-01',
      city: 'Berlin',
      country: null,
      businessType: '',
      merchantMobility: '',
      merchantStatus: 'ACTIVE',
      lastUpdatedAt: ''
    };
    fixture.componentInstance.merchantResults = [merchant];
    fixture.detectChanges();

    const option = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[role="option"]');
    expect(option?.tagName).toBe('BUTTON');
    expect(option?.textContent).toContain('Northstar Cafe');

    option?.click();
    expect(fixture.componentInstance.selectedMerchant).toEqual(merchant);
  });
});
