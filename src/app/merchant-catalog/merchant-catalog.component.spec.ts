import { TestBed } from '@angular/core/testing';
import { throwError, of } from 'rxjs';
import { MerchantCatalogComponent } from './merchant-catalog.component';
import { MerchantApiService } from '../services/merchant-api.service';
import { Merchant, Product, ProductCategory } from '../models/merchant-catalog.models';

describe('MerchantCatalogComponent product category management', () => {
  let component: MerchantCatalogComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const merchant: Merchant = {
    applicationId: 'merchant-123',
    applicationReference: 'MERCHANT-123',
    registrationNumber: 'REG-123',
    status: 'ACTIVE',
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
      'getMerchant',
      'updateMerchant',
      'getLocation',
      'saveLocation',
      'removeLocation',
      'getBranches',
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
      'uploadMerchantLogo'
    ]);

    await TestBed.configureTestingModule({
      imports: [MerchantCatalogComponent],
      providers: [{ provide: MerchantApiService, useValue: merchantApi }]
    }).compileComponents();

    component = TestBed.createComponent(MerchantCatalogComponent).componentInstance;
    component.selectedMerchant = merchant;
    component.categories = [beverages];
    component['syncCategoryTableState']();
    component.selectedProduct = {
      productId: 'product-1',
      merchantId: merchant.applicationId,
      branchId: 'branch-1',
      name: 'Cola',
      unitPrice: 12,
      active: true,
      status: 'ACTIVE',
      categoryId: beverages.id,
      categoryName: beverages.name,
      createdAt: '2026-05-10T10:00:00.000Z',
      updatedAt: '2026-05-10T10:00:00.000Z'
    } satisfies Product;
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
      merchant.applicationId,
      { name: 'Food' }
    );
    expect(component.categories).toEqual([beverages, category]);
    expect(component.categoryDialogOpen).toBeFalse();
    expect(component.statusMessage).toBe('Category created.');
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
      merchant.applicationId,
      beverages.id,
      { name: 'Hot Drinks' }
    );
    expect(component.categories).toEqual([renamedCategory]);
    expect(component.statusMessage).toBe('Category renamed.');
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
      merchant.applicationId,
      beverages.id
    );
    expect(component.errorMessage).toBe('Category is still used by products.');
    expect(component.categories).toEqual([beverages]);
  });

  it('clears the selected product category reference after a successful delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    merchantApi.deleteProductCategory.and.returnValue(of(void 0));

    component.productEditForm.categoryId = beverages.id;

    component.removeCategory(beverages);

    expect(component.categories).toEqual([]);
    expect(component.productEditForm.categoryId).toBe('');
    expect(component.selectedProduct?.categoryId).toBeNull();
    expect(component.selectedProduct?.categoryName).toBeNull();
    expect(component.statusMessage).toBe('Category deleted.');
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
});
