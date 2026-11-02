import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MerchantSearchResultItem } from '../models/merchant-catalog.models';
import { OrderManagementComponent } from './order-management.component';

describe('OrderManagementComponent — branch loading', () => {
  let component: OrderManagementComponent;
  let httpTestingController: HttpTestingController;

  const merchant: MerchantSearchResultItem = {
    merchantId: 'merchant-abc',
    merchantName: 'Cafe',
    merchantCode: 'CAFE',
    city: null,
    country: null,
    businessType: '',
    merchantMobility: '',
    merchantStatus: 'ACTIVE',
    lastUpdatedAt: '2026-01-01T00:00:00Z',
  } as MerchantSearchResultItem;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrderManagementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    });

    component = TestBed.createComponent(OrderManagementComponent).componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads the merchant branches when a merchant is picked from search results', () => {
    component.selectMerchantForFilter(merchant);

    const req = httpTestingController.expectOne(r => r.method === 'GET' && r.url.endsWith('/v1/merchants/merchant-abc/branches'));
    req.flush([{ id: 'branch-1', name: 'Main' }]);

    expect(component.branches.length).toBe(1);
    expect(component.branches[0].branchId).toBe('branch-1');
  });
});

describe('OrderManagementComponent — minor-unit amounts', () => {
  let component: OrderManagementComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrderManagementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    });
    component = TestBed.createComponent(OrderManagementComponent).componentInstance;
  });

  it('formats totalAmountMinor (cents) as a currency amount', () => {
    expect(component.formatMinorAmount(2185, 'EUR')).toBe('€21.85');
  });

  it('respects currencies without minor units', () => {
    expect(component.formatMinorAmount(500, 'JPY')).toBe('JP¥500');
  });

  it('shows a dash instead of NaN when the amount is missing', () => {
    expect(component.formatMinorAmount(undefined, 'EUR')).toBe('—');
  });
});
