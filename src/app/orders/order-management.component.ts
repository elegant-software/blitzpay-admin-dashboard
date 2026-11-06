import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import {
  Branch,
  BranchCustomer,
  CreateOrderItemRequest,
  CreateOrderRequest,
  EnvironmentKey,
  MerchantSearchResultItem,
  OrderItemFormModel,
  OrderResponse,
  OrderStatus,
  Product,
  ShopperSearchResult,
} from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { MerchantSearchComponent } from '../shared/merchant-search.component';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';

type OrderDialog = 'create' | 'detail' | null;
type OrderFilterDropdown = 'status' | 'type' | null;

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe, MerchantSearchComponent],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  // Merchant search
  merchantQuery = '';
  merchantResults: MerchantSearchResultItem[] = [];
  merchantSearchLoading = false;
  merchantSearchError = '';
  selectedMerchantItem: MerchantSearchResultItem | null = null;
  merchantIdInput = '';
  merchantId = '';

  // Branch filter
  selectedBranchId = '';
  branches: Branch[] = [];
  branchDropdownOpen = false;

  @ViewChild('branchPicker') private branchPicker?: ElementRef<HTMLElement>;
  @ViewChild('branchTrigger') private branchTrigger?: ElementRef<HTMLButtonElement>;
  @ViewChildren('branchOption') private branchOptions!: QueryList<ElementRef<HTMLButtonElement>>;

  // Orders
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  statusFilter: OrderStatus | '' = '';
  typeFilter: '' | 'invoice' | 'standard' = '';
  filterDropdownOpen: OrderFilterDropdown = null;
  orderQuery = '';
  ordersLoaded = false;

  @ViewChild('statusFilterPicker') private statusFilterPicker?: ElementRef<HTMLElement>;
  @ViewChild('typeFilterPicker') private typeFilterPicker?: ElementRef<HTMLElement>;
  @ViewChild('statusFilterTrigger') private statusFilterTrigger?: ElementRef<HTMLButtonElement>;
  @ViewChild('typeFilterTrigger') private typeFilterTrigger?: ElementRef<HTMLButtonElement>;

  loading = false;
  errorMessage = '';

  supportDataFailed = false;

  // Dialog
  activeDialog: OrderDialog = null;
  selectedOrder: OrderResponse | null = null;
  dialogError = '';
  detailLoading = false;
  detailReady = false;
  settlingCash = false;
  cashReceiptConfirmed = false;
  cashSettlementNote = '';
  readonly statusOptions: readonly OrderStatus[] = ['PENDING', 'CREATED', 'PAYMENT_INITIATED', 'FAILED', 'PAID', 'CANCELLED', 'EXPIRED'];
  private detailRequestId = 0;

  // Support data
  products: Product[] = [];
  productsLoading = false;
  productsLoadFailed = false;
  supportDataLoading = false;

  // Create form
  createBranchId = '';
  createPayByInvoice = false;
  createDueDate = '';
  createItems: OrderItemFormModel[] = [];

  // Shopper search for invoice
  shopperSearchEmail = '';
  shopperSearching = false;
  shopperSearchResult: ShopperSearchResult | null = null;
  shopperSearchError = '';
  selectedShopperId = '';
  selectedShopperName = '';

  // Known customers for selected branch
  branchCustomers: BranchCustomer[] = [];
  branchCustomersLoading = false;
  private supportDataRequestId = 0;

  constructor(
    private readonly merchantApi: MerchantApiService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
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
        },
        error: (error) => { this.notifications.apiError(error, 'Unable to load the selected merchant.'); }
      });
    }
  }

  get selectedEnvironment() {
    return getEnvironmentByKey(this.selectedEnvironmentKey);
  }

  get pendingOrderCount(): number { return this.orders.filter(order => ['PENDING', 'CREATED', 'PAYMENT_INITIATED'].includes(order.status)).length; }
  get paidOrderCount(): number { return this.orders.filter(order => order.status === 'PAID').length; }
  get invoiceOrderCount(): number { return this.orders.filter(order => this.isInvoiceOrder(order)).length; }
  get visibleOrderCount(): number { return this.filteredOrders.length; }

  // ── Merchant search ─────────────────────────────────────────────────────

  searchMerchantsForFilter(): void {
    const q = this.merchantQuery.trim();
    if (!q) {
      this.merchantSearchError = 'Enter a merchant name, code, or ID to search.';
      return;
    }
    this.merchantSearchLoading = true;
    this.merchantSearchError = '';
    this.merchantApi.searchMerchants(this.selectedEnvironment, this.apiVersion, { q, page: 0 }).subscribe({
      next: response => {
        this.merchantResults = response.results;
        this.merchantSearchLoading = false;
        if (!response.results.length) this.merchantSearchError = 'No merchants found. Try another search.';
      },
      error: error => {
        this.merchantSearchLoading = false;
        this.notifications.apiError(error, 'Unable to search merchants.');
      }
    });
  }

  selectMerchantForFilter(m: MerchantSearchResultItem): void {
    if (this.settlingCash) return;
    this.errorMessage = '';

    this.branchDropdownOpen = false;
    this.selectedMerchantItem = m;
    this.merchantIdInput = m.merchantId;
    this.merchantId = m.merchantId;
    this.merchantResults = [];
    this.merchantQuery = '';
    this.merchantSearchError = '';
    this.selectedBranchId = '';
    this.branches = [];
    this.orders = [];
    this.filteredOrders = [];
    this.ordersLoaded = false;
    this.orderQuery = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.loadSupportData(m.merchantId);
  }

  clearMerchantFilter(): void {
    if (this.settlingCash) return;
    this.supportDataRequestId++;
    this.branchDropdownOpen = false;
    this.selectedMerchantItem = null;
    this.merchantIdInput = '';
    this.merchantId = '';
    this.merchantQuery = '';
    this.merchantResults = [];
    this.branches = [];
    this.products = [];
    this.orders = [];
    this.filteredOrders = [];
    this.ordersLoaded = false;
    this.selectedBranchId = '';
    this.supportDataFailed = false;
    this.supportDataLoading = false;
    this.merchantSearchError = '';
    this.orderQuery = '';
  }

  // ── Orders loading ──────────────────────────────────────────────────────

  get canSearch(): boolean {
    return !!this.selectedMerchantItem && !!this.selectedBranchId;
  }

  toggleBranchDropdown(): void {
    this.branchDropdownOpen = !this.branchDropdownOpen;
  }

  selectBranchFilter(branchId: string): void {
    if (this.settlingCash) return;
    this.selectedBranchId = branchId;
    this.branchDropdownOpen = false;
    this.onBranchFilterChange();
  }

  onBranchTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.branchDropdownOpen = true;
      const selectedIndex = this.branches.findIndex(branch => this.branchId(branch) === this.selectedBranchId) + 1;
      this.focusBranchOption(event.key === 'ArrowUp' ? this.branches.length : selectedIndex);
    } else if (event.key === 'Escape' && this.branchDropdownOpen) {
      event.preventDefault();
      this.branchDropdownOpen = false;
    }
  }

  onBranchOptionKeydown(event: KeyboardEvent, index: number): void {
    const optionCount = this.branches.length + 1;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % optionCount;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + optionCount) % optionCount;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = optionCount - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      this.focusBranchOption(nextIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.branchDropdownOpen = false;
      this.branchTrigger?.nativeElement.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectBranchFilter(index === 0 ? '' : this.branchId(this.branches[index - 1]));
      this.branchTrigger?.nativeElement.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  closeBranchDropdownOutside(event: MouseEvent): void {
    if (event.target instanceof Node && !this.branchPicker?.nativeElement.contains(event.target)) {
      this.branchDropdownOpen = false;
    }
  }

  loadOrders(): void {
    if (this.settlingCash) return;
    if (!this.merchantId || !this.selectedBranchId) {
      this.errorMessage = 'Select a merchant and branch before searching.';
      return;
    }

    this.errorMessage = '';

    this.loading = true;
    this.ordersLoaded = false;
    this.orders = [];
    this.filteredOrders = [];

    this.merchantApi.getOrders(this.selectedEnvironment, this.apiVersion, this.merchantId, this.selectedBranchId).subscribe({
      next: (orders) => {
        this.loading = false;
        this.orders = orders;
        this.ordersLoaded = true;
        this.applyFilters();
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Unable to load orders.');
      }
    });
  }

  clearSearch(): void {
    if (this.settlingCash) return;
    this.clearMerchantFilter();
    this.statusFilter = '';
    this.typeFilter = '';
    this.errorMessage = '';

    this.closeDialog(true);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  toggleFilterDropdown(filter: Exclude<OrderFilterDropdown, null>): void {
    this.filterDropdownOpen = this.filterDropdownOpen === filter ? null : filter;
  }

  selectStatusFilter(status: OrderStatus | ''): void {
    this.statusFilter = status;
    this.filterDropdownOpen = null;
    this.applyFilters();
    this.statusFilterTrigger?.nativeElement.focus();
  }

  selectTypeFilter(type: '' | 'invoice' | 'standard'): void {
    this.typeFilter = type;
    this.filterDropdownOpen = null;
    this.applyFilters();
    this.typeFilterTrigger?.nativeElement.focus();
  }

  onFilterTriggerKeydown(event: KeyboardEvent, filter: Exclude<OrderFilterDropdown, null>): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.filterDropdownOpen = filter;
      const selectedIndex = filter === 'status'
        ? ['', ...this.statusOptions].indexOf(this.statusFilter)
        : ['', 'invoice', 'standard'].indexOf(this.typeFilter);
      const optionCount = filter === 'status' ? this.statusOptions.length + 1 : 3;
      const index = event.key === 'ArrowUp' ? optionCount - 1 : Math.max(selectedIndex, 0);
      this.focusFilterOption(filter, index);
    } else if (event.key === 'Escape' && this.filterDropdownOpen === filter) {
      event.preventDefault();
      this.filterDropdownOpen = null;
    }
  }

  onFilterOptionKeydown(event: KeyboardEvent, index: number, filter: Exclude<OrderFilterDropdown, null>): void {
    const optionList = (event.currentTarget as HTMLElement).closest('[role="listbox"]');
    const optionCount = optionList?.querySelectorAll<HTMLButtonElement>('[role="option"]').length ?? 0;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % optionCount;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + optionCount) % optionCount;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = optionCount - 1;

    if (nextIndex !== null && optionCount) {
      event.preventDefault();
      this.focusFilterOption(filter, nextIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.filterDropdownOpen = null;
      this.filterTrigger(filter)?.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  closeFilterDropdownOutside(event: MouseEvent): void {
    const target = event.target;
    if (
      target instanceof Node &&
      !this.statusFilterPicker?.nativeElement.contains(target) &&
      !this.typeFilterPicker?.nativeElement.contains(target)
    ) {
      this.filterDropdownOpen = null;
    }
  }

  statusFilterLabel(): string {
    return this.statusFilter ? this.orderStatusLabel(this.statusFilter) : 'All statuses';
  }

  typeFilterLabel(): string {
    if (this.typeFilter === 'invoice') return 'Invoice';
    if (this.typeFilter === 'standard') return 'Standard';
    return 'All types';
  }

  clearOrderFilters(): void {
    this.orderQuery = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.filterDropdownOpen = null;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.orders];
    if (this.statusFilter) {
      result = result.filter(o => o.status === this.statusFilter);
    }
    if (this.typeFilter === 'invoice') {
      result = result.filter(o => !!o.targetShopperId);
    } else if (this.typeFilter === 'standard') {
      result = result.filter(o => !o.targetShopperId);
    }
    const query = this.orderQuery.trim().toLocaleLowerCase();
    if (query) {
      result = result.filter(order =>
        order.orderId.toLocaleLowerCase().includes(query) ||
        (order.targetShopperName ?? '').toLocaleLowerCase().includes(query) ||
        (order.targetShopperId ?? '').toLocaleLowerCase().includes(query)
      );
    }
    this.filteredOrders = result;
  }

  // ── Support data ────────────────────────────────────────────────────────

  private loadSupportData(merchantId: string): void {
    const requestId = ++this.supportDataRequestId;
    this.supportDataLoading = true;
    this.supportDataFailed = false;
    this.merchantApi.getBranches(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
      next: branches => {
        if (requestId !== this.supportDataRequestId) return;
        this.branches = branches.map(branch => ({ ...branch, branchId: branch.branchId ?? branch.id }));
        this.supportDataLoading = false;
      },
      error: error => {
        if (requestId !== this.supportDataRequestId) return;
        this.branches = [];
        this.supportDataLoading = false;
        this.supportDataFailed = true; this.notifications.apiError(error, 'Unable to load branches for this merchant.');
      }
    });
  }

  // ── Status display ──────────────────────────────────────────────────────

  orderStatusTone(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'status-tag-warning';
      case 'CREATED':
      case 'PAYMENT_INITIATED': return 'status-tag-warning';
      case 'FAILED': return 'status-tag-danger';
      case 'PAID': return 'status-tag-success';
      case 'CANCELLED': return 'status-tag-neutral';
      case 'EXPIRED': return 'status-tag-danger';
    }
  }

  orderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'CREATED': return 'Awaiting payment';
      case 'PAYMENT_INITIATED': return 'Payment in progress';
      case 'FAILED': return 'Payment failed';
      case 'PAID': return 'Paid';
      case 'CANCELLED': return 'Cancelled';
      case 'EXPIRED': return 'Expired';
    }
  }

  isInvoiceOrder(order: OrderResponse): boolean {
    return !!order.targetShopperId;
  }

  paymentMethodLabel(method: OrderResponse['checkoutPaymentMethod']): string {
    if (!method) return '—';
    return { CASH: 'Cash', CARD: 'Card', PAY_BY_BANK: 'Pay by bank', BANK_ACCOUNT: 'Bank account', TERMINAL: 'Card terminal', PAYPAL: 'PayPal' }[method];
  }

  formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  /** Formats an API amount given in the currency's minor unit (e.g. cents). */
  formatMinorAmount(amountMinor: number | null | undefined, currency: string): string {
    if (amountMinor == null || !Number.isFinite(amountMinor)) return '—';
    try {
      const format = new Intl.NumberFormat('en-GB', { style: 'currency', currency });
      const digits = format.resolvedOptions().maximumFractionDigits ?? 2;
      return format.format(amountMinor / 10 ** digits);
    } catch {
      return `${amountMinor} ${currency}`;
    }
  }

  // ── Create order dialog ─────────────────────────────────────────────────

  openCreateDialog(): void {
    if (this.settlingCash) return;
    if (!this.merchantId) {
      this.errorMessage = 'Load orders for a merchant first.';
      return;
    }
    this.createBranchId = this.selectedBranchId;
    this.createPayByInvoice = false;
    this.createDueDate = '';
    this.createItems = [];
    this.shopperSearchEmail = '';
    this.shopperSearchResult = null;
    this.shopperSearchError = '';
    this.selectedShopperId = '';
    this.selectedShopperName = '';
    this.branchCustomers = [];
    this.dialogError = '';
    this.activeDialog = 'create';

    if (this.createBranchId) {
      this.loadProductsForBranch(this.createBranchId);
      this.loadBranchCustomers(this.createBranchId);
    }
  }

  openDetailDialog(order: OrderResponse): void {
    if (this.settlingCash) return;
    const requestId = ++this.detailRequestId;
    this.selectedOrder = order;
    this.dialogError = '';
    this.cashReceiptConfirmed = false;
    this.cashSettlementNote = '';
    this.detailReady = false;
    this.detailLoading = true;
    this.activeDialog = 'detail';
    this.merchantApi.getOrder(this.selectedEnvironment, this.apiVersion, order.orderId).subscribe({
      next: fresh => {
        if (requestId !== this.detailRequestId || this.activeDialog !== 'detail') return;
        this.detailLoading = false;
        if (fresh.orderId !== order.orderId || fresh.merchantId !== order.merchantId || fresh.branchId !== order.branchId) {
          this.dialogError = 'Unable to verify this order. Reload its details before confirming cash.';
          this.notifications.error(this.dialogError);
          return;
        }
        this.detailReady = true;
        this.selectedOrder = fresh;
        this.replaceLoadedOrder(fresh);
      },
      error: error => {
        if (requestId !== this.detailRequestId || this.activeDialog !== 'detail') return;
        this.detailLoading = false;
        this.dialogError = this.orderErrorMessage(error, 'Unable to load fresh order details. Please try again.');
        this.notifications.apiError(error, 'Unable to load fresh order details. Please try again.');
      }
    });
  }

  get canConfirmCash(): boolean {
    const order = this.selectedOrder;
    return this.activeDialog === 'detail' && this.detailReady && !this.detailLoading && !!order
      && order.merchantId === this.merchantId && order.branchId === this.selectedBranchId
      && order.checkoutPaymentMethod === 'CASH' && ['CREATED', 'FAILED'].includes(order.status);
  }

  confirmCashReceived(): void {
    if (!this.canConfirmCash || !this.cashReceiptConfirmed || this.settlingCash || this.cashSettlementNote.length > 2000) return;
    const order = this.selectedOrder!;
    this.settlingCash = true;
    this.dialogError = '';
    this.merchantApi.settleCashOrder(this.selectedEnvironment, this.apiVersion, order.orderId, this.cashSettlementNote)
      .pipe(finalize(() => this.settlingCash = false))
      .subscribe({
        next: settled => {
          this.selectedOrder = settled;
          this.replaceLoadedOrder(settled);
          this.cashReceiptConfirmed = false;
          this.cashSettlementNote = '';
          this.notifications.success('Cash receipt confirmed. Order marked as paid.');
        },
        error: error => {
          this.dialogError = this.orderErrorMessage(error, 'Unable to confirm cash receipt. Please try again.');
          this.notifications.apiError(error, 'Unable to confirm cash receipt. Please try again.');
        }
      });
  }

  private replaceLoadedOrder(order: OrderResponse): void {
    this.orders = this.orders.map(candidate => candidate.orderId === order.orderId ? order : candidate);
    this.applyFilters();
  }

  private orderErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;
    const message = error.error?.detail ?? error.error?.message ?? error.error?.error;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }

  closeDialog(force = false): void {
    if (this.settlingCash) return;
    this.detailRequestId++;
    this.detailLoading = false;
    this.detailReady = false;
    this.cashReceiptConfirmed = false;
    this.cashSettlementNote = '';
    this.activeDialog = null;
    this.selectedOrder = null;
    this.dialogError = '';
    this.createItems = [];
    this.shopperSearchResult = null;
    this.shopperSearchError = '';
    this.selectedShopperId = '';
    this.selectedShopperName = '';
  }

  private loadProductsForBranch(branchId: string): void {
    if (!this.merchantId) return;
    this.products = [];
    this.productsLoading = true;
    this.productsLoadFailed = false;
    this.merchantApi.getProducts(this.selectedEnvironment, this.apiVersion, this.merchantId, branchId, false).subscribe({
      next: (products) => {
        this.products = products;
        this.productsLoading = false;
      },
      error: (error) => {
        this.products = [];
        this.productsLoading = false;
        this.productsLoadFailed = true; this.notifications.apiError(error, 'Unable to load products for this branch.');
      }
    });
  }

  private loadBranchCustomers(branchId: string): void {
    this.branchCustomersLoading = true;
    this.merchantApi.getBranchCustomers(this.selectedEnvironment, this.apiVersion, branchId).subscribe({
      next: (customers) => { this.branchCustomers = customers; this.branchCustomersLoading = false; },
      error: () => { this.branchCustomers = []; this.branchCustomersLoading = false; }
    });
  }

  // ── Item management ─────────────────────────────────────────────────────

  addItem(): void {
    this.createItems = [...this.createItems, { productId: '', productName: '', unitPrice: 0, quantity: 1 }];
  }

  removeItem(index: number): void {
    this.createItems = this.createItems.filter((_, i) => i !== index);
  }

  onProductSelected(index: number): void {
    const item = this.createItems[index];
    const product = this.products.find(p => p.productId === item.productId);
    if (product) {
      item.productName = product.name;
      item.unitPrice = product.unitPrice;
    }
  }

  get createOrderTotal(): number {
    return this.createItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  // ── Shopper search ──────────────────────────────────────────────────────

  searchShopper(): void {
    const email = this.shopperSearchEmail.trim();
    if (!email) return;

    this.shopperSearching = true;
    this.shopperSearchError = '';
    this.shopperSearchResult = null;

    this.merchantApi.searchShopperByEmail(this.selectedEnvironment, this.apiVersion, email).subscribe({
      next: (result) => {
        this.shopperSearchResult = result;
        this.shopperSearching = false;
      },
      error: (error) => {
        this.shopperSearching = false;
        const httpError = error as HttpErrorResponse;
        if (httpError?.status === 404) {
          this.shopperSearchError = 'No shopper found with that email address.';
        } else {
          this.notifications.apiError(error, 'Unable to search for shopper.');
        }
      }
    });
  }

  selectShopper(shopperId: string, name: string): void {
    this.selectedShopperId = shopperId;
    this.selectedShopperName = name;
    this.shopperSearchResult = null;
    this.shopperSearchEmail = '';
    this.shopperSearchError = '';
  }

  clearSelectedShopper(): void {
    this.selectedShopperId = '';
    this.selectedShopperName = '';
  }

  selectBranchCustomer(customer: BranchCustomer): void {
    this.selectShopper(customer.shopperAccountId, customer.name);
  }

  // ── Create order ────────────────────────────────────────────────────────

  createOrder(): void {
    this.dialogError = '';

    if (!this.createBranchId) {
      this.dialogError = 'Branch is required.';
      return;
    }
    if (this.createItems.length === 0) {
      this.dialogError = 'At least one item is required.';
      return;
    }
    for (const item of this.createItems) {
      if (!item.productId) {
        this.dialogError = 'All items must have a product selected.';
        return;
      }
      if (item.quantity < 1) {
        this.dialogError = 'All items must have a quantity of at least 1.';
        return;
      }
    }

    if (this.createPayByInvoice && !this.selectedShopperId) {
      this.dialogError = 'A shopper must be selected for invoice orders.';
      return;
    }

    const items: CreateOrderItemRequest[] = this.createItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    const payload: CreateOrderRequest = {
      merchantId: this.merchantId,
      branchId: this.createBranchId,
      orderType: 'WALK_IN_ORDERING',
      items,
    };

    if (this.createPayByInvoice) {
      payload.usesDeferredPayment = true;
      payload.targetShopperId = this.selectedShopperId;
      if (this.createDueDate) {
        payload.dueDate = this.createDueDate;
      }
    }

    this.loading = true;
    this.merchantApi.createOrder(this.selectedEnvironment, this.apiVersion, payload).subscribe({
      next: (order) => {
        this.loading = false;
        this.orders = [order, ...this.orders];
        this.ordersLoaded = true;
        this.applyFilters();
        this.closeDialog(true);
        this.notifications.success(this.createPayByInvoice
          ? 'Invoice order added successfully'
          : 'Order added successfully');
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Could not add order. Please try again.');
      }
    });
  }

  // ── Branch select change ────────────────────────────────────────────────

  onBranchFilterChange(): void {
    if (this.selectedBranchId && this.merchantId) {
      this.loadOrders();
    } else {
      this.orders = [];
      this.filteredOrders = [];
      this.ordersLoaded = false;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  branchName(branchId: string): string {
    const branch = this.branches.find(b => (b.branchId ?? b.id) === branchId);
    return branch?.name ?? branchId;
  }

  branchId(branch: Branch): string {
    return branch.branchId ?? branch.id ?? '';
  }

  private filterTrigger(filter: Exclude<OrderFilterDropdown, null>): HTMLButtonElement | undefined {
    return filter === 'status'
      ? this.statusFilterTrigger?.nativeElement
      : this.typeFilterTrigger?.nativeElement;
  }

  private focusFilterOption(filter: Exclude<OrderFilterDropdown, null>, index: number): void {
    const picker = filter === 'status' ? this.statusFilterPicker : this.typeFilterPicker;
    setTimeout(() => picker?.nativeElement.querySelectorAll<HTMLButtonElement>('[role="option"]').item(index)?.focus());
  }

  private focusBranchOption(index: number): void {
    setTimeout(() => this.branchOptions?.get(index)?.nativeElement.focus());
  }

}
