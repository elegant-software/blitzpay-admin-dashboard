import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Branch, MerchantSearchResultItem, OrderResponse } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { OrderManagementComponent } from './order-management.component';

describe('OrderManagementComponent', () => {
  let fixture: ComponentFixture<OrderManagementComponent>;
  let component: OrderManagementComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const merchant: MerchantSearchResultItem = {
    merchantId: 'merchant-1',
    merchantName: 'Café Lena',
    merchantCode: 'MRC-1',
    city: 'Berlin',
    country: 'DE',
    businessType: 'CAFE',
    merchantMobility: 'BRICK_AND_MORTAR',
    merchantStatus: 'ACTIVE',
    lastUpdatedAt: '2026-10-31T12:00:00Z'
  };
  const branch: Branch = {
    id: 'branch-1',
    branchId: 'branch-1',
    merchantId: merchant.merchantId,
    branchCode: 'BR-1',
    name: 'Central',
    status: 'ACTIVE'
  };

  const order = (overrides: Partial<OrderResponse> = {}): OrderResponse => ({
    orderId: 'order-12345678',
    merchantId: merchant.merchantId,
    branchId: branch.branchId!,
    orderType: 'WALK_IN_ORDERING',
    status: 'PENDING',
    usesDeferredPayment: false,
    items: [],
    totalAmountMinor: 1200,
    currency: 'EUR',
    createdAt: '2026-10-31T12:00:00Z',
    ...overrides
  });

  beforeEach(async () => {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', [
      'getMerchant',
      'searchMerchants',
      'getBranches',
      'getOrders',
      'getProducts',
      'getBranchCustomers',
      'searchShopperByEmail',
      'createOrder'
    ]);
    merchantApi.getBranches.and.returnValue(of([branch]));
    merchantApi.getOrders.and.returnValue(of([]));
    merchantApi.searchMerchants.and.returnValue(of({
      results: [merchant],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1
    }));

    await TestBed.configureTestingModule({
      imports: [OrderManagementComponent],
      providers: [
        { provide: MerchantApiService, useValue: merchantApi },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('presents a clear order scope and prompts for merchant and branch selection', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Orders');
    expect(root.querySelector('#orders-scope-title')?.textContent).toContain('Order scope');
    expect(root.querySelector('.orders-welcome-card')?.textContent).toContain('Select a branch to view orders');
  });

  it('uses the selected branch from the dialog header without asking for branch selection again', () => {
    component.selectedMerchantItem = merchant;
    component.createBranchId = branch.branchId!;
    component.branches = [branch];
    component.activeDialog = 'create';
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.create-order-dialog') as HTMLElement;

    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.querySelector('#create-order-title')?.textContent).toContain('Create a new order');
    expect(dialog.querySelector('.create-order-header')?.textContent).toContain('Café Lena · Central');
    expect(dialog.querySelector('#create-order-branch')).toBeNull();
    expect(dialog.querySelector('.create-order-section-heading h3')?.textContent).toContain('Payment method');
    expect(dialog.querySelector('.create-order-items-empty')?.textContent).toContain('No products available');
    expect(dialog.querySelector('.create-order-footer-actions')).not.toBeNull();
  });

  it('uses a merchant icon instead of the first character in merchant names', () => {
    component.selectMerchantForFilter({ ...merchant, merchantName: '[LOCAL TEST] Bremen Mitte' });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const avatar = root.querySelector('.orders-selected-merchant .orders-result-avatar');
    const selectedControl = root.querySelector<HTMLElement>('.orders-selected-merchant')!;
    const merchantCopy = root.querySelector<HTMLElement>('.orders-selected-merchant .orders-result-copy')!;

    expect(avatar?.querySelector('svg')).not.toBeNull();
    expect(avatar?.textContent?.trim()).toBe('');
    expect(merchantCopy.getBoundingClientRect().bottom).toBeLessThanOrEqual(selectedControl.getBoundingClientRect().bottom);
  });

  it('loads the selected merchant branches so orders can be scoped', () => {
    component.selectMerchantForFilter(merchant);
    fixture.detectChanges();

    expect(merchantApi.getBranches).toHaveBeenCalledWith(
      component.selectedEnvironment,
      component.apiVersion,
      merchant.merchantId
    );
    expect(component.branches.map(item => item.name)).toEqual(['Central']);
    expect(component.supportDataError).toBe('');
  });

  it('shows a styled, keyboard-operable branch options popover and loads the selected branch', () => {
    component.selectMerchantForFilter(merchant);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#order-branch')?.tagName).toBe('BUTTON');
    expect(root.querySelector('select#order-branch')).toBeNull();

    root.querySelector<HTMLButtonElement>('#order-branch')!.click();
    fixture.detectChanges();

    const option = root.querySelector<HTMLButtonElement>('.orders-branch-option:not(.orders-branch-placeholder)')!;
    expect(option.textContent).toContain('Central');
    expect(option.getAttribute('role')).toBe('option');

    option.click();
    fixture.detectChanges();

    expect(component.selectedBranchId).toBe('branch-1');
    expect(component.branchDropdownOpen).toBeFalse();
    expect(merchantApi.getOrders).toHaveBeenCalledWith(
      component.selectedEnvironment,
      component.apiVersion,
      merchant.merchantId,
      'branch-1'
    );
  });

  it('calculates status and invoice overview counts from loaded orders', () => {
    component.selectedMerchantItem = merchant;
    component.merchantId = merchant.merchantId;
    component.selectedBranchId = branch.branchId!;
    component.orders = [
      order(),
      order({ orderId: 'order-paid', status: 'PAID' }),
      order({ orderId: 'order-invoice', status: 'PENDING', targetShopperId: 'shopper-1', targetShopperName: 'Alex' })
    ];
    component.ordersLoaded = true;
    component.onFilterChange();
    fixture.detectChanges();

    expect(component.pendingOrderCount).toBe(2);
    expect(component.paidOrderCount).toBe(1);
    expect(component.invoiceOrderCount).toBe(1);
    expect(fixture.nativeElement.querySelector('.orders-overview')?.textContent).toContain('Invoice orders');
  });

  it('filters loaded orders by order identifier and shopper name', () => {
    component.orders = [
      order(),
      order({ orderId: 'order-invoice', targetShopperId: 'shopper-2', targetShopperName: 'Alex Morgan' })
    ];
    component.orderQuery = 'alex';
    component.onFilterChange();

    expect(component.filteredOrders.map(item => item.orderId)).toEqual(['order-invoice']);

    component.orderQuery = '12345678';
    component.onFilterChange();
    expect(component.filteredOrders.map(item => item.orderId)).toEqual(['order-12345678']);
  });

  it('uses styled status and type option popovers that apply filters', () => {
    component.selectedMerchantItem = merchant;
    component.selectedBranchId = branch.branchId!;
    component.ordersLoaded = true;
    component.orders = [
      order({ orderId: 'pending-standard' }),
      order({ orderId: 'paid-invoice', status: 'PAID', targetShopperId: 'shopper-1' })
    ];
    component.onFilterChange();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('select#order-status-filter')).toBeNull();
    expect(root.querySelector('select#order-type-filter')).toBeNull();

    root.querySelector<HTMLButtonElement>('#order-status-filter')!.click();
    fixture.detectChanges();
    root.querySelector<HTMLButtonElement>('#order-status-options [role="option"][aria-selected="false"]')!.click();
    fixture.detectChanges();

    expect(component.statusFilter).toBe('PENDING');
    expect(component.filteredOrders.map(item => item.orderId)).toEqual(['pending-standard']);

    root.querySelector<HTMLButtonElement>('#order-type-filter')!.click();
    fixture.detectChanges();
    root.querySelectorAll<HTMLButtonElement>('#order-type-options [role="option"]')[1].click();
    fixture.detectChanges();

    expect(component.typeFilter).toBe('invoice');
    expect(component.filteredOrders).toEqual([]);
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
