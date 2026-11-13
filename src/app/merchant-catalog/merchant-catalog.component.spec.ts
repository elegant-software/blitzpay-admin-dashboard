import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../notifications/notification.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { throwError, of, Subject } from 'rxjs';
import { MerchantDetailComponent } from './merchant-detail.component';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { MerchantApiService } from '../services/merchant-api.service';
import { Branch, CardReader, Merchant, Product, ProductCategory, ProviderAccountResponse } from '../models/merchant-catalog.models';
import { AdminLocaleService } from '../i18n/admin-locale.service';

describe('MerchantDetailComponent product category management', () => {
  let component: MerchantDetailComponent;
  let fixture: ComponentFixture<MerchantDetailComponent>;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const merchant: Merchant = {
    merchantId: 'merchant-123',
    merchantCode: 'MRC-123',
    merchantName: 'Merchant 123',
    merchantStatus: 'ACTIVE',
    offerings: [],
    lastUpdatedAt: '2026-05-10T10:00:00.000Z'
  };

  const beverages: ProductCategory = {
    id: 'cat-1',
    name: 'Beverages',
    createdAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-10T10:00:00.000Z'
  };
  const bakery: ProductCategory = {
    id: 'cat-2',
    name: 'Bakery',
    createdAt: '2026-05-10T10:01:00.000Z',
    updatedAt: '2026-05-10T10:01:00.000Z'
  };
  const dairy: ProductCategory = {
    id: 'cat-3',
    name: 'Dairy',
    createdAt: '2026-05-10T10:02:00.000Z',
    updatedAt: '2026-05-10T10:02:00.000Z'
  };

  beforeEach(async () => {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', [
      'getKitchenAccess', 'getPreparationConfiguration',
      'getMerchant',
      'updateMerchant',
      'getLocation',
      'saveLocation',
      'removeLocation',
      'getBranches',
      'getAppearanceHistory',
      'getAppearanceOperational',
      'createBranch',
      'getBranch',
      'updateBranch',
      'deleteBranch',
      'getProducts',
      'getProductCategories',
      'createProductCategory',
      'renameProductCategory',
      'deleteProductCategory',
      'createProduct',
      'getProduct',
      'updateProduct',
      'removeProduct',
      'updateLogo',
      'createLogoUploadUrl',
      'uploadMerchantLogo',
      'getVerticals',
      'getStripeConnectStatus',
      'startStripeConnect',
      'refreshStripeConnect',
      'listProviderAccounts',
      'enableProviderAccount',
      'disableProviderAccount',
      'enableTapToPay',
      'disableTapToPay',
      'getCardReaders',
      'searchMerchants',
    ]);
    merchantApi.getKitchenAccess.and.returnValue(of({ enabled: false, username: null } as any));
    merchantApi.getPreparationConfiguration.and.returnValue(of({ stations: [], categoryDefaults: {}, productOverrides: {} }));

    await TestBed.configureTestingModule({
      imports: [MerchantDetailComponent],
      providers: [
        { provide: MerchantApiService, useValue: merchantApi },
        provideRouter([])
      ]
    }).compileComponents();

    spyOn(TestBed.inject(NotificationService), 'success');
    spyOn(TestBed.inject(NotificationService), 'apiError');
    fixture = TestBed.createComponent(MerchantDetailComponent);
    component = fixture.componentInstance;
    component.selectedMerchant = merchant;
    component.categories = [beverages];
    component['syncCategoryTableState']();
  });

  it('reloads displayed products in supported UI languages and falls back to the original', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    merchantApi.getProducts.and.returnValue(of([]));
    component.selectedMerchant = { ...merchant, originalMenuLanguage: 'de', supportedMenuLanguages: ['en', 'ar'] };
    component.selectedBranch = { branchId: 'b1', branchCode: 'B1', merchantId: merchant.merchantId, name: 'Central', status: 'ACTIVE' };
    component.catalogLanguage = 'de';
    const locale = TestBed.inject(AdminLocaleService);
    locale.use('ar'); fixture.detectChanges();
    expect(merchantApi.getProducts.calls.mostRecent().args[5]).toBe('ar');
    locale.use('en'); fixture.detectChanges();
    expect(merchantApi.getProducts.calls.mostRecent().args[5]).toBe('en');
    locale.use('fr'); fixture.detectChanges();
    expect(merchantApi.getProducts.calls.mostRecent().args[5]).toBe('de');
    merchantApi.getProducts.calls.reset();
    locale.use('it'); fixture.detectChanges();
    expect(merchantApi.getProducts).toHaveBeenCalledTimes(1);
    expect(merchantApi.getProducts.calls.mostRecent().args[5]).toBe('de');
  });

  it('does not reload a single-language merchant when the UI language changes', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    component.selectedMerchant = { ...merchant, originalMenuLanguage: 'de', supportedMenuLanguages: [] };
    component.selectedBranch = { branchId: 'b1', branchCode: 'B1', merchantId: merchant.merchantId, name: 'Central', status: 'ACTIVE' };
    component.catalogLanguage = 'de';
    fixture.detectChanges();
    TestBed.inject(AdminLocaleService).use('ar'); fixture.detectChanges();
    expect(component.catalogLanguage).toBe('de');
    expect(merchantApi.getProducts).not.toHaveBeenCalled();
  });

  it('presents the merchant identity and key context in the detail header', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    component.selectedMerchant = {
      ...merchant,
      businessType: 'RESTAURANT',
      merchantMobility: 'BRICK_AND_MORTAR',
      logoUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    };
    component.merchantLocation = {
      merchantId: merchant.merchantId,
      latitude: 0,
      longitude: 0,
      geofenceRadiusMeters: 0,
      city: 'Berlin'
    };

    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const hero = root.querySelector('.merchant-detail-hero');

    expect(hero).not.toBeNull();
    expect(hero?.querySelector('h1')?.textContent).toContain(merchant.merchantName);
    expect(hero?.textContent).toContain(merchant.merchantCode);
    expect(hero?.textContent).toContain('Berlin');
    expect(hero?.textContent).toContain('Brick & Mortar');
    expect(hero?.querySelector('.status-tag-success')?.textContent).toContain('Active');
    expect(hero?.querySelector('img')?.getAttribute('src')).toBe(component.selectedMerchant.logoUrl);
    expect(root.querySelector('[aria-label="Edit merchant"]')).not.toBeNull();
    expect(root.querySelectorAll('.merchant-detail-stat').length).toBe(4);
    expect(root.querySelector('#merchant-panel-info')?.getAttribute('role')).toBe('tabpanel');
    expect(root.querySelector('.merchant-detail-profile-card h2')?.textContent).toContain('Business details');
    expect(root.querySelector('.merchant-detail-contact-card h2')?.textContent).toContain('Contact information');
  });

  it('does not show a success banner just for loading a merchant', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    merchantApi.getStripeConnectStatus.and.returnValue(of({
      connected: false,
      chargesEnabled: false,
      detailsSubmitted: false
    }));
    merchantApi.listProviderAccounts.and.returnValue(of([]));
    merchantApi.getLocation.and.returnValue(of({
      merchantId: merchant.merchantId,
      latitude: 0,
      longitude: 0,
      geofenceRadiusMeters: 0
    }));
    merchantApi.getBranches.and.returnValue(of([]));
    merchantApi.getProductCategories.and.returnValue(of([]));

    component['selectMerchant'](merchant);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
    expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
  });

  it('supports arrow-key navigation between merchant detail tabs', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const infoTab = root.querySelector<HTMLButtonElement>('#merchant-tab-info')!;
    infoTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(component.activeDetailTab).toBe('categories');
    expect(document.activeElement).toBe(root.querySelector('#merchant-tab-categories'));
  });

  it('shows branches as accessible selectable cards beside a clearly scoped catalog', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    component.activeDetailTab = 'branches-products';
    const branch: Branch = {
      id: 'branch-1',
      branchId: 'branch-1',
      merchantId: merchant.merchantId,
      branchCode: 'BR-1',
      name: 'Central',
      city: 'Berlin',
      status: 'ACTIVE',
      active: true
    };
    component.branches = [branch];
    component.selectedBranch = branch;
    component['syncBranchTableState']();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const branchButton = root.querySelector<HTMLButtonElement>('.branch-select-button');

    expect(root.querySelector('.merchant-branches-panel')).not.toBeNull();
    expect(root.querySelectorAll('.branch-selection-card').length).toBe(1);
    expect(branchButton?.getAttribute('aria-pressed')).toBe('true');
    expect(branchButton?.textContent).toContain('Central');
    expect(branchButton?.textContent).toContain('Berlin');
    expect(root.querySelector('.branch-selection-card')?.classList.contains('branch-selection-card-active')).toBeTrue();
    expect(root.querySelector('.merchant-catalog-panel')).not.toBeNull();
    expect(root.querySelector('.product-branch-scope')?.textContent).toContain('Central');
  });

  it('shows categories in their own tab, separate from branches and products', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    component.activeDetailTab = 'categories';
    component.categories = [beverages];
    component['syncCategoryTableState']();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const panel = root.querySelector<HTMLElement>('#merchant-panel-categories');

    expect(panel?.getAttribute('aria-labelledby')).toBe('merchant-tab-categories');
    expect(panel?.textContent).toContain('Product categories');
    expect(panel?.textContent).toContain('Beverages');
    expect(root.querySelector('.merchant-branches-panel')).toBeNull();
    expect(root.querySelector('.merchant-products-card')).toBeNull();
  });

  it('renders product actions as icon-only buttons with accessible labels', () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    component.activeDetailTab = 'branches-products';
    const product: Product = {
      productId: 'product-1',
      merchantId: merchant.merchantId,
      branchId: 'branch-1',
      name: 'Coffee',
      unitPrice: 3,
      active: true,
      status: 'ACTIVE',
      createdAt: '2026-05-10T10:00:00.000Z',
      updatedAt: '2026-05-10T10:00:00.000Z'
    };
    component.products = [product];
    component['syncProductTableState']();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const actionButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.merchant-products-card .action-cell button'));

    expect(actionButtons.map(button => button.getAttribute('aria-label'))).toEqual(['Edit product', 'Remove product']);
    expect(actionButtons.every(button => button.textContent?.trim() === '')).toBeTrue();
    expect(actionButtons.every(button => button.querySelector('svg'))).toBeTrue();
  });

  it('previews and saves a selected category image', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:category-image');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const image = new File(['png'], 'drinks.png', { type: 'image/png' });
    const saved = { ...beverages, imageUrl: '/drinks.png' };
    merchantApi.createProductCategory.and.returnValue(of(saved));
    component.openCreateCategoryDialog();
    component.categoryFormName = 'Beverages';
    component.onCategoryImageSelected({ target: { files: [image], value: 'drinks.png' } } as unknown as Event);
    expect(component.categoryImagePreview).toBe('blob:category-image');
    component.saveCategory();
    expect(merchantApi.createProductCategory).toHaveBeenCalledWith(component.selectedEnvironment, 'v1', merchant.merchantId, { name: 'Beverages' }, image);
    expect(component.categories[0].imageUrl).toBe('/drinks.png');
    expect(component.categoryDialogOpen).toBeFalse();
    expect(revoke).toHaveBeenCalledWith('blob:category-image');
  });

  it('removes an existing category image on save', () => {
    merchantApi.renameProductCategory.and.returnValue(of({ ...beverages, imageUrl: null }));
    component.openEditCategoryDialog({ ...beverages, imageUrl: '/old.png' });
    expect(component.categoryImagePreview).toBe('/old.png');
    component.removeCategoryImage();
    expect(component.categoryImagePreview).toBeNull();
    component.saveCategory();
    expect(merchantApi.renameProductCategory).toHaveBeenCalledWith(component.selectedEnvironment, 'v1', merchant.merchantId, beverages.id, { name: 'Beverages' }, undefined, true);
  });

  it('guards image-only unsaved changes and releases the preview when discarded', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:category-image');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const confirmDiscard = spyOn(window, 'confirm').and.returnValue(false);
    component.openEditCategoryDialog(beverages);
    component.onCategoryImageSelected({ target: { files: [new File(['png'], 'image.png', { type: 'image/png' })], value: '' } } as unknown as Event);
    component.closeCategoryDialog();
    expect(component.categoryDialogOpen).toBeTrue();
    confirmDiscard.and.returnValue(true);
    component.closeCategoryDialog();
    expect(component.categoryDialogOpen).toBeFalse();
    expect(revoke).toHaveBeenCalledWith('blob:category-image');
  });

  it('rejects invalid and oversized category images without replacing the current preview', () => {
    component.openEditCategoryDialog({ ...beverages, imageUrl: '/old.png' });
    for (const file of [new File(['x'], 'image.svg', { type: 'image/svg+xml' }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }), new File([], 'empty.png', { type: 'image/png' })]) {
      component.onCategoryImageSelected({ target: { files: [file], value: '' } } as unknown as Event);
      expect(component.categoryDialogError).toBeTruthy();
      expect(component.categoryImagePreview).toBe('/old.png');
    }
  });

  it('keeps save errors inside the category dialog with the image available for retry', () => {
    merchantApi.renameProductCategory.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { code: 'INVALID_REQUEST', detail: 'Category image is invalid.' } })));
    component.openEditCategoryDialog(beverages);
    component.saveCategory();
    expect(component.categoryDialogOpen).toBeTrue();
    expect(component.categoryDialogError).toBe('Category image is invalid.');
    expect(component.categorySaving).toBeFalse();
  });

  it('prevents duplicate category submissions while saving', () => {
    merchantApi.createProductCategory.and.returnValue(new Subject<ProductCategory>());
    component.openCreateCategoryDialog(); component.categoryFormName = 'Food';
    component.saveCategory(); component.saveCategory();
    expect(merchantApi.createProductCategory).toHaveBeenCalledTimes(1);
  });

  it('creates a new product category and closes the dialog', () => {
    const category: ProductCategory = {
      id: 'cat-4',
      name: 'Food',
      createdAt: '2026-05-10T10:05:00.000Z',
      updatedAt: '2026-05-10T10:05:00.000Z'
    };
    merchantApi.createProductCategory.and.returnValue(of(category));

    component.openCreateCategoryDialog();
    component.categoryFormName = 'Food';

    component.saveCategory();

    expect(merchantApi.createProductCategory).toHaveBeenCalledWith(
      component.selectedEnvironment,
      'v1',
      merchant.merchantId,
      { name: 'Food' }
    );
    expect(component.categories).toEqual([beverages, category]);
    expect(component.categoryDialogOpen).toBeFalse();
    expect(TestBed.inject(NotificationService).success).toHaveBeenCalledWith('Category created.');
  });

  it('filters product categories by category name only', () => {
    component.categories = [beverages, bakery, dairy];
    component.categoryTableState.filter.query = 'bak';

    component.onCategoryFilterChange();

    expect(component.visibleCategoryRows).toEqual([bakery]);
  });

  it('sorts product categories by category name', () => {
    component.categories = [beverages, bakery, dairy];

    component.toggleCategorySort('name');

    expect(component.visibleCategoryRows).toEqual([bakery, beverages, dairy]);
  });

  it('paginates product categories with the same page-size model as other catalog tables', () => {
    component.categories = [
      { ...beverages, id: 'cat-1', name: 'Beverages' },
      { ...bakery, id: 'cat-2', name: 'Bakery' },
      { ...dairy, id: 'cat-3', name: 'Dairy' },
      { ...dairy, id: 'cat-4', name: 'Frozen', updatedAt: '2026-05-10T10:03:00.000Z' },
      { ...dairy, id: 'cat-5', name: 'Produce', updatedAt: '2026-05-10T10:04:00.000Z' },
      { ...dairy, id: 'cat-6', name: 'Snacks', updatedAt: '2026-05-10T10:05:00.000Z' }
    ];
    component['syncCategoryTableState']();

    component.onCategoryPageChange({ first: 5, rows: 5 });

    expect(component.visibleCategoryRows.map((category) => category.name)).toEqual(['Snacks']);
    expect(component.categoryPaginatorVisible).toBeTrue();
  });

  it('renames an existing product category in place', () => {
    const renamedCategory: ProductCategory = {
      ...beverages,
      name: 'Hot Drinks',
      updatedAt: '2026-05-10T10:10:00.000Z'
    };
    merchantApi.renameProductCategory.and.returnValue(of(renamedCategory));

    component.openEditCategoryDialog(beverages);
    component.categoryFormName = 'Hot Drinks';

    component.saveCategory();

    expect(merchantApi.renameProductCategory).toHaveBeenCalledWith(
      component.selectedEnvironment,
      'v1',
      merchant.merchantId,
      beverages.id,
      { name: 'Hot Drinks' }
    );
    expect(component.categories).toEqual([renamedCategory]);
    expect(TestBed.inject(NotificationService).success).toHaveBeenCalledWith('Category saved.');
  });

  it('keeps the active category filter and sort after a rename, removing a row that no longer matches', () => {
    const renamedCategory: ProductCategory = {
      ...beverages,
      name: 'Drinks',
      updatedAt: '2026-05-10T10:10:00.000Z'
    };
    merchantApi.renameProductCategory.and.returnValue(of(renamedCategory));
    component.categories = [beverages, bakery];
    component.toggleCategorySort('name');
    component.categoryTableState.filter.query = 'bev';
    component.onCategoryFilterChange();
    component.openEditCategoryDialog(beverages);
    component.categoryFormName = 'Drinks';

    component.saveCategory();

    expect(component.categoryTableState.filter.query).toBe('bev');
    expect(component.categoryTableState.sort.field).toBe('name');
    expect(component.visibleCategoryRows).toEqual([]);
  });

  it('surfaces the backend delete error when a category is still in use', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    merchantApi.deleteProductCategory.and.returnValue(
      throwError(() => ({ error: { message: 'Category is still used by products.' } }))
    );

    component.removeCategory(beverages);

    expect(merchantApi.deleteProductCategory).toHaveBeenCalledWith(
      component.selectedEnvironment,
      'v1',
      merchant.merchantId,
      beverages.id
    );
    expect(TestBed.inject(NotificationService).apiError).toHaveBeenCalled();
    expect(component.categories).toEqual([beverages]);
  });

  it('removes the category from the list and reports success after a successful delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    merchantApi.deleteProductCategory.and.returnValue(of(void 0));

    component.removeCategory(beverages);

    expect(component.categories).toEqual([]);
    expect(TestBed.inject(NotificationService).success).toHaveBeenCalledWith('Category deleted.');
  });

  it('normalizes category pagination after delete while keeping the active filter', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    merchantApi.deleteProductCategory.and.returnValue(of(void 0));
    component.categories = [beverages, bakery, dairy, { ...dairy, id: 'cat-4', name: 'Frozen' }, { ...dairy, id: 'cat-5', name: 'Produce' }, { ...dairy, id: 'cat-6', name: 'Snacks' }];
    component.categoryTableState.pagination.rows = 5;
    component.categoryTableState.filter.query = 's';
    component.onCategoryFilterChange();
    component.onCategoryPageChange({ first: 5, rows: 5 });

    component.removeCategory({ ...dairy, id: 'cat-6', name: 'Snacks' });

    expect(component.categoryTableState.filter.query).toBe('s');
    expect(component.categoryTableState.pagination.first).toBe(0);
  });

  it('builds a branch catalog QR URL using the selected storefront environment', () => {
    component.selectedEnvironmentKey = 'local';
    component.selectedBranch = {
      id: 'branch-1',
      branchId: 'branch-1',
      merchantId: merchant.merchantId,
      branchCode: 'BR-1',
      name: 'Central',
      status: 'ACTIVE',
      active: true
    } satisfies Branch;

    expect(component.branchCatalogUrl).toBe(
      `${getEnvironmentByKey('local').storefrontUrl}/m/merchant-123/b/branch-1`
    );
  });

  it('opens the clicked branch QR without changing the selected branch, and closes the dialog', async () => {
    merchantApi.getVerticals.and.returnValue(of([]));
    component.activeDetailTab = 'branches-products';
    const first: Branch = { id: 'b1', branchId: 'b1', branchCode: 'BR-1', merchantId: merchant.merchantId, name: 'First', status: 'ACTIVE', active: true };
    const second: Branch = { ...first, id: 'b2', branchId: 'b2', name: 'Second' };
    component.branches = [first, second];
    component.selectedBranch = first;
    component.onBranchFilterChange();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const triggers = root.querySelectorAll<HTMLButtonElement>('[aria-label="Show branch QR code"]');
    expect(triggers.length).toBe(2);
    triggers[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    const dialog = root.querySelector<HTMLDialogElement>('.branch-qr-dialog')!;
    expect(dialog.open).toBeTrue();
    expect(component.selectedBranch).toBe(first);
    const expected = `${component.selectedEnvironment.storefrontUrl}/m/merchant-123/b/b2`;
    expect(dialog.querySelector('.branch-catalog-url')?.textContent).toContain(expected);
    expect(dialog.querySelector('a')?.getAttribute('href')).toBe(expected);
    dialog.querySelector<HTMLButtonElement>('button')!.click();
    expect(dialog.open).toBeFalse();
  });

  it('opens the Printed Catalog for a branch row', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.navigateToPrintedCatalog({
      id: 'branch-1',
      merchantId: merchant.merchantId,
      branchCode: 'BR-1',
      name: 'Central',
      status: 'ACTIVE'
    } satisfies Branch);

    expect(router.navigate).toHaveBeenCalledWith(['/merchants', 'merchant-123', 'branches', 'branch-1', 'printed-catalog']);
  });
  describe('payment providers', () => {
    const stripeAccount = (enabled: boolean): ProviderAccountResponse => ({
      id: 'pa-1',
      pspCode: 'STRIPE',
      enabled,
      createdAt: '2026-05-10T10:00:00.000Z',
      updatedAt: '2026-05-10T10:00:00.000Z'
    });

    it('shows Stripe as Disabled when the merchant has no enabled Stripe account', () => {
      component.providerAccounts = [];
      expect(component.providerStatus('STRIPE')).toEqual({ label: 'Disabled', tone: 'status-tag-neutral' });

      component.providerAccounts = [stripeAccount(false)];
      expect(component.providerStatus('STRIPE')).toEqual({ label: 'Disabled', tone: 'status-tag-neutral' });
    });

    it('shows Stripe as Ready for onboarding once enabled but not yet connected', () => {
      component.providerAccounts = [stripeAccount(true)];
      for (const status of ['loading', 'not_connected', 'verifying', 'error'] as const) {
        component.paymentAccountStatus = status;
        expect(component.providerStatus('STRIPE')).toEqual({ label: 'Ready for onboarding', tone: 'status-tag-warning' });
      }
    });

    it('shows Stripe as Active only after onboarding has connected the account', () => {
      component.providerAccounts = [stripeAccount(true)];
      component.paymentAccountStatus = 'connected';

      expect(component.providerStatus('STRIPE')).toEqual({ label: 'Active', tone: 'status-tag-success' });
    });

    it('shows PayPal as unavailable and never calls the API to enable it', () => {
      expect(component.isPspAvailable('PAYPAL')).toBeFalse();
      expect(component.isPspAvailable('STRIPE')).toBeTrue();
      expect(component.providerStatus('PAYPAL')).toEqual({ label: 'Disabled', tone: 'status-tag-neutral' });

      component.enableProviderAccount('PAYPAL');

      expect(merchantApi.enableProviderAccount).not.toHaveBeenCalled();
    });
  });

  describe('card readers', () => {
    const reader: CardReader = {
      id: 'tmr_1', branchId: 'branch-1', branchName: 'Hauptfiliale', label: 'WisePad 3 Theke',
      deviceType: 'bbpos_wisepad3', serialNumber: 'WSC5001', softwareVersion: '4.01.07.00_DE',
      status: 'online', lastSeenAt: '2026-11-09T10:15:00Z'
    };

    function showPaymentTab(): HTMLElement {
      merchantApi.getVerticals.and.returnValue(of([]));
      component.paymentAccountStatus = 'connected';
      component.tapToPayEnabled = true;
      component.branches = [{ branchId: 'branch-1', branchCode: 'B1', merchantId: merchant.merchantId, name: 'Hauptfiliale', status: 'ACTIVE' }];
      component.activeDetailTab = 'payment';
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('relabels the toggle as terminal payments with a girocard hint', () => {
      component.providerAccounts = [{ id: 'pa-1', pspCode: 'STRIPE', enabled: true, createdAt: '', updatedAt: '' }];
      const root = showPaymentTab();
      expect(root.querySelector('label[for="terminal-payments-toggle"]')?.textContent).toContain('Terminal payments (Tap to Pay + card reader)');
      expect(root.textContent).toContain('girocard (EC) is only accepted with a card reader.');
    });

    it('loads card readers when terminal payments are enabled and renders them without UUIDs', () => {
      merchantApi.getStripeConnectStatus.and.returnValue(of({
        connected: true, chargesEnabled: true, detailsSubmitted: true, enabledPaymentFlows: ['TAP_TO_PAY']
      }));
      merchantApi.getCardReaders.and.returnValue(of([reader]));

      component.loadPaymentAccountStatus(merchant.merchantId);
      const root = showPaymentTab();

      expect(merchantApi.getCardReaders).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), merchant.merchantId, null);
      const cells = Array.from(root.querySelectorAll('.card-readers-card tbody td')).map((td) => td.textContent?.trim());
      expect(cells).toEqual(['WisePad 3 Theke', 'Hauptfiliale', 'bbpos_wisepad3', 'WSC5001', '4.01.07.00_DE', 'Online', jasmine.stringMatching(/9 Nov 2026/)]);
      const branchSelect = root.querySelector<HTMLSelectElement>('#card-reader-branch')!;
      expect(Array.from(branchSelect.options).map((o) => o.textContent?.trim())).toEqual(['All branches', 'Hauptfiliale']);
      expect(root.querySelector('.card-readers-card')?.textContent).not.toContain('branch-1');
    });

    it('filters card readers by the selected branch', () => {
      merchantApi.getCardReaders.and.returnValue(of([]));
      component.selectedMerchant = merchant;
      component.cardReaderBranchId = 'branch-1';

      component.loadCardReaders();

      expect(merchantApi.getCardReaders).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), merchant.merchantId, 'branch-1');
    });

    it('explains where card readers are paired when there are none', () => {
      const root = showPaymentTab();
      expect(root.querySelector('.card-readers-card')?.textContent)
        .toContain('Card readers are paired in the merchant app (Settings → Pair card reader).');
    });

    it('shows an error state when card readers cannot be loaded', () => {
      merchantApi.getCardReaders.and.returnValue(throwError(() => new Error('boom')));
      component.selectedMerchant = merchant;
      component.loadCardReaders();
      const root = showPaymentTab();
      expect(root.querySelector('.card-readers-card .text-danger')?.textContent).toContain('Card readers could not be loaded.');
    });

    it('hides the card readers section when terminal payments are disabled', () => {
      const root = showPaymentTab();
      component.tapToPayEnabled = false;
      fixture.detectChanges();
      expect(root.querySelector('.card-readers-card')).toBeNull();
    });
  });
});
