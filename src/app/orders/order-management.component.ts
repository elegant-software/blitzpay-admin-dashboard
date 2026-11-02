import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';

type OrderDialog = 'create' | 'detail' | null;

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  apiVersion = 'v1';

  // Merchant search
  merchantQuery = '';
  merchantResults: MerchantSearchResultItem[] = [];
  selectedMerchantItem: MerchantSearchResultItem | null = null;
  merchantIdInput = '';
  merchantId = '';

  // Branch filter
  selectedBranchId = '';
  branches: Branch[] = [];

  // Orders
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  statusFilter: OrderStatus | '' = '';
  typeFilter: '' | 'invoice' | 'standard' = '';

  loading = false;
  errorMessage = '';
  statusMessage = '';

  // Dialog
  activeDialog: OrderDialog = null;
  selectedOrder: OrderResponse | null = null;
  dialogError = '';

  // Support data
  products: Product[] = [];
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
      });
    }
  }

  get selectedEnvironment() {
    return getEnvironmentByKey(this.selectedEnvironmentKey);
  }

  // ── Merchant search ─────────────────────────────────────────────────────

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
    this.merchantId = m.merchantId;
    this.merchantResults = [];
    this.branches = [];
    this.selectedBranchId = '';
    this.loadSupportData(m.merchantId);
  }

  clearMerchantFilter(): void {
    this.selectedMerchantItem = null;
    this.merchantIdInput = '';
    this.merchantId = '';
    this.merchantQuery = '';
    this.merchantResults = [];
    this.branches = [];
    this.products = [];
    this.orders = [];
    this.filteredOrders = [];
    this.selectedBranchId = '';
  }

  // ── Orders loading ──────────────────────────────────────────────────────

  get canSearch(): boolean {
    return !!this.selectedMerchantItem && !!this.selectedBranchId;
  }

  loadOrders(): void {
    if (!this.merchantId || !this.selectedBranchId) {
      this.errorMessage = 'Select a merchant and branch before searching.';
      return;
    }

    this.errorMessage = '';
    this.statusMessage = '';
    this.loading = true;
    this.orders = [];
    this.filteredOrders = [];

    this.merchantApi.getOrders(this.selectedEnvironment, this.apiVersion, this.merchantId, this.selectedBranchId).subscribe({
      next: (orders) => {
        this.loading = false;
        this.orders = orders;
        this.applyFilters();
        this.statusMessage = `Loaded ${orders.length} order${orders.length === 1 ? '' : 's'}.`;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.toMessage(error, 'Unable to load orders.');
      }
    });
  }

  clearSearch(): void {
    this.clearMerchantFilter();
    this.statusFilter = '';
    this.typeFilter = '';
    this.errorMessage = '';
    this.statusMessage = '';
    this.closeDialog(true);
  }

  onFilterChange(): void {
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
    this.filteredOrders = result;
  }

  // ── Support data ────────────────────────────────────────────────────────

  private loadSupportData(merchantId: string): void {
    this.supportDataLoading = true;
    forkJoin({
      branches: this.merchantApi
        .getBranches(this.selectedEnvironment, this.apiVersion, merchantId)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ branches }) => {
        this.branches = branches.map(b => ({ ...b, branchId: b.branchId ?? b.id }));
        this.supportDataLoading = false;
      },
      error: () => {
        this.supportDataLoading = false;
      }
    });
  }

  // ── Status display ──────────────────────────────────────────────────────

  orderStatusTone(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'status-tag-warning';
      case 'PAID': return 'status-tag-success';
      case 'CANCELLED': return 'status-tag-neutral';
      case 'EXPIRED': return 'status-tag-danger';
    }
  }

  orderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'PAID': return 'Paid';
      case 'CANCELLED': return 'Cancelled';
      case 'EXPIRED': return 'Expired';
    }
  }

  isInvoiceOrder(order: OrderResponse): boolean {
    return !!order.targetShopperId;
  }

  formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  // ── Create order dialog ─────────────────────────────────────────────────

  openCreateDialog(): void {
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
    this.selectedOrder = order;
    this.dialogError = '';
    this.activeDialog = 'detail';
  }

  closeDialog(force = false): void {
    this.activeDialog = null;
    this.selectedOrder = null;
    this.dialogError = '';
    this.createItems = [];
    this.shopperSearchResult = null;
    this.shopperSearchError = '';
    this.selectedShopperId = '';
    this.selectedShopperName = '';
  }

  onCreateBranchChange(): void {
    this.createItems = [];
    this.products = [];
    this.branchCustomers = [];
    this.selectedShopperId = '';
    this.selectedShopperName = '';
    if (this.createBranchId) {
      this.loadProductsForBranch(this.createBranchId);
      this.loadBranchCustomers(this.createBranchId);
    }
  }

  private loadProductsForBranch(branchId: string): void {
    if (!this.merchantId) return;
    this.merchantApi.getProducts(this.selectedEnvironment, this.apiVersion, this.merchantId, branchId, false).subscribe({
      next: (products) => { this.products = products; },
      error: () => { this.products = []; }
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
          this.shopperSearchError = this.toMessage(error, 'Unable to search for shopper.');
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
        this.applyFilters();
        this.closeDialog(true);
        this.statusMessage = this.createPayByInvoice
          ? 'Invoice order created.'
          : 'Order created.';
      },
      error: (error) => {
        this.loading = false;
        this.dialogError = this.toMessage(error, 'Unable to create order.');
      }
    });
  }

  // ── Branch select change ────────────────────────────────────────────────

  onBranchFilterChange(): void {
    if (this.selectedBranchId && this.merchantId) {
      this.loadOrders();
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  branchName(branchId: string): string {
    const branch = this.branches.find(b => (b.branchId ?? b.id) === branchId);
    return branch?.name ?? branchId;
  }

  private toMessage(error: unknown, fallback: string): string {
    const httpError = error as HttpErrorResponse;
    const body = httpError?.error as { detail?: string; message?: string } | undefined;
    return body?.detail || body?.message || fallback;
  }
}
