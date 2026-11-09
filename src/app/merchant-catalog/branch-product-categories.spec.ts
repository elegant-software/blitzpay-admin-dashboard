import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MerchantDetailComponent } from './merchant-detail.component';
import { BranchKitchenScreenComponent } from './branch-kitchen-screen.component';
import { BranchKitchenRoutingComponent } from './branch-kitchen-routing.component';
import { MerchantApiService } from '../services/merchant-api.service';
import { Branch, Product } from '../models/merchant-catalog.models';

const product = (index: number, categoryId: string | null = 'drinks'): Product => ({
  productId: `p${index}`, merchantId: 'm1', branchId: 'b1', name: `Coffee ${index}`,
  unitPrice: 3, active: index !== 1, status: index === 1 ? 'INACTIVE' : 'ACTIVE',
  categoryId, categoryName: categoryId === 'drinks' ? 'Getränke' : categoryId === 'food' ? 'Speisen' : null,
  createdAt: '', updatedAt: '', imageUrl: '/detail.svg', thumbnailUrl: '/thumb.svg',
});

describe('Branch product category browsing', () => {
  let fixture: ComponentFixture<MerchantDetailComponent>;
  let component: MerchantDetailComponent;
  let api: jasmine.SpyObj<MerchantApiService>;
  beforeEach(async () => {
    api = jasmine.createSpyObj('MerchantApiService', ['getProducts', 'getBranch', 'getVerticals']);
    api.getProducts.and.returnValue(of([]));
    api.getVerticals.and.returnValue(of([]));
    await TestBed.configureTestingModule({ imports: [MerchantDetailComponent], providers: [
      { provide: MerchantApiService, useValue: api }, provideRouter([]),
    ] }).overrideComponent(MerchantDetailComponent, {
      remove: { imports: [BranchKitchenScreenComponent, BranchKitchenRoutingComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(MerchantDetailComponent);
    component = fixture.componentInstance;
    component.selectedMerchant = { merchantId: 'm1', merchantName: 'Cafe', merchantCode: 'M1', merchantStatus: 'ACTIVE', offerings: [], lastUpdatedAt: '', originalMenuLanguage: 'de' };
    component.selectedBranch = { merchantId: 'm1', branchId: 'b1', branchCode: 'B1', name: 'Central', status: 'ACTIVE' };
    component.productTableState.branchId = 'b1';
    component.activeDetailTab = 'branches-products';
    component.products = [...Array.from({ length: 12 }, (_, i) => product(i)), product(12, 'food'), product(13, null)];
    component.onProductFilterChange();
  });
  afterEach(() => fixture.destroy());

  it('shows branch category counts including inactive products and accessible selected chips', () => {
    fixture.detectChanges();
    const chips = Array.from(fixture.nativeElement.querySelectorAll('.product-category-chip')) as HTMLButtonElement[];
    expect(chips.map(chip => chip.querySelector('span')?.textContent)).toEqual(['All products', 'Getränke', 'Speisen', 'Uncategorized']);
    expect(chips.map(chip => chip.querySelector('.product-category-count')?.textContent)).toEqual(['14', '12', '1', '1']);
    expect(chips[0].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('.product-thumb').getAttribute('src')).toBe('/thumb.svg');
    expect(fixture.nativeElement.querySelector('.product-thumb').getAttribute('loading')).toBe('lazy');
  });

  it('combines category and text search before pagination, resets page and keeps page size', () => {
    component.onProductPageChange({ first: 10, rows: 10 });
    component.selectProductCategory('drinks');
    expect(component.productTableState.pagination.first).toBe(0);
    expect(component.productTableState.pagination.rows).toBe(10);
    expect(component.productVisibleCount).toBe(12);
    component.productTableState.filter.query = 'Coffee 1';
    component.onProductFilterChange();
    expect(component.visibleProductRows.map(row => row.productId)).toEqual(['p1', 'p10', 'p11']);
    expect(component.productCategoryOptions.find(category => category.id === 'drinks')?.count).toBe(12);
    component.clearProductFilters();
    expect(component.selectedProductCategory).toBe('');
    expect(component.productVisibleCount).toBe(14);
  });

  it('filters uncategorized separately and keeps global sorting and page size controls', () => {
    component.selectProductCategory('__uncategorized__');
    expect(component.visibleProductRows.map(row => row.productId)).toEqual(['p13']);
    expect(component.productPaginatorVisible).toBeTrue();
    component.clearProductFilters();
    component.toggleProductSort('name');
    component.onProductPageChange({ first: 5, rows: 5 });
    expect(component.visibleProductRows[0].name).toBe('Coffee 5');
  });

  it('shows a useful empty state and clears the category when it disappears', () => {
    component.selectProductCategory('food');
    component.productTableState.filter.query = 'missing';
    component.onProductFilterChange();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.merchant-products-card').textContent).toContain('No products match the current filters.');
    component.products = [product(1)];
    component.productTableState.filter.query = '';
    component.onProductFilterChange();
    expect(component.selectedProductCategory).toBe('');
    expect(component.productVisibleCount).toBe(1);
  });

  it('shows skeletons and retryable errors without reporting an empty catalog', () => {
    const response = new Subject<Product[]>();
    api.getProducts.and.returnValue(response);
    component.setCatalogLanguage('de');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.product-loading-skeleton')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.product-category-count')).toBeNull();
    expect(fixture.nativeElement.querySelector('.merchant-products-card').textContent).not.toContain('No products for the selected branch.');
    response.error(new HttpErrorResponse({ status: 503 }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.product-load-error')).not.toBeNull();
    api.getProducts.and.returnValue(of([product(1)]));
    (fixture.nativeElement.querySelector('.product-load-error button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.productVisibleCount).toBe(1);
    expect(fixture.nativeElement.querySelector('.product-load-error')).toBeNull();
  });

  it('preserves category, search and page size on language reload and ignores superseded responses', () => {
    component.onProductPageChange({ rows: 10 });
    component.selectProductCategory('drinks');
    component.productTableState.filter.query = 'Coffee';
    const old = new Subject<Product[]>(); const current = new Subject<Product[]>();
    api.getProducts.and.returnValues(old, current);
    component.setCatalogLanguage('en'); component.setCatalogLanguage('de');
    current.next([product(8)]); old.next([product(99)]);
    expect(component.selectedProductCategory).toBe('drinks');
    expect(component.productTableState.filter.query).toBe('Coffee');
    expect(component.productTableState.pagination.rows).toBe(10);
    expect(component.visibleProductRows.map(row => row.productId)).toEqual(['p8']);
  });

  it('resets branch filters, keeps page size and ignores a slower branch selection', () => {
    component.onProductPageChange({ rows: 10 });
    component.selectProductCategory('drinks');
    component.productTableState.filter.query = 'Coffee';
    const older = new Subject<Branch>();
    const latest = new Subject<Branch>();
    api.getBranch.and.returnValues(older, latest);
    api.getProducts.and.returnValue(of([
      { ...product(20, 'food'), branchId: 'b3' },
      { ...product(21), branchId: 'b2' },
    ]));
    component.selectBranch({ ...component.selectedBranch!, branchId: 'b2' });
    component.selectBranch({ ...component.selectedBranch!, branchId: 'b3' });
    latest.next({ ...component.selectedBranch!, branchId: 'b3', name: 'New branch' });
    older.next({ ...component.selectedBranch!, branchId: 'b2', name: 'Old branch' });
    expect(component.selectedBranch?.branchId).toBe('b3');
    expect(component.selectedProductCategory).toBe('');
    expect(component.productTableState.filter.query).toBe('');
    expect(component.productTableState.pagination.rows).toBe(10);
    expect(component.visibleProductRows.map(row => row.productId)).toEqual(['p20']);
  });

  it('clamps the current page when the filtered result shrinks', () => {
    component.onProductPageChange({ first: 10, rows: 5 });
    component.products = component.products.slice(0, 7);
    component.onProductPageChange({ first: 10, rows: 5 });
    expect(component.productTableState.pagination.first).toBe(5);
    expect(component.visibleProductRows.map(row => row.productId)).toEqual(['p5', 'p6']);
  });

  it('starts on the first page after changing the sort order', () => {
    component.onProductPageChange({ first: 10, rows: 5 });
    component.toggleProductSort('name');
    expect(component.productTableState.pagination.first).toBe(0);
    expect(component.visibleProductRows[0].productId).toBe('p0');
  });
});
