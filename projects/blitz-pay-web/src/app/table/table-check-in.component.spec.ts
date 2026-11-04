import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { StorefrontTableResolution } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { storefrontRoutes } from '../app.routes';
import { StorefrontTableService } from './storefront-table.service';

/** Waits for the redirect from /t/:code to the lazily loaded Web Catalog and renders it. */
async function settle(harness: RouterTestingHarness): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await harness.fixture.whenStable();
    harness.detectChanges();
  }
}

describe('Table Link check-in (/t/:code)', () => {
  let api: jasmine.SpyObj<StorefrontApiService>;
  const resolution: StorefrontTableResolution = {
    merchantId: 'merchant-44', merchantName: 'Brew House', branchId: 'branch-12', branchName: 'Station Cafe',
    tableId: 'table-uuid', tableName: 'Terrace 3', active: true
  };

  beforeEach(async () => {
    sessionStorage.clear();
    api = jasmine.createSpyObj<StorefrontApiService>('StorefrontApiService', [
      'resolveTable', 'getMerchant', 'getBranch', 'getActiveProducts'
    ]);
    api.getMerchant.and.returnValue(of({ applicationId: 'merchant-44', merchantName: 'Brew House' }));
    api.getBranch.and.returnValue(of({ id: 'branch-12', merchantId: 'merchant-44', name: 'Station Cafe' }));
    api.getActiveProducts.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      providers: [provideRouter(storefrontRoutes), { provide: StorefrontApiService, useValue: api }]
    }).compileComponents();
  });

  it('opens the Branch catalog at the resolved Table', async () => {
    api.resolveTable.and.returnValue(of(resolution));
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/t/ab3k7q');
    await settle(harness);

    expect(api.resolveTable).toHaveBeenCalledWith('AB3K7Q');
    expect(TestBed.inject(Router).url).toBe('/m/merchant-44/b/branch-12');
    expect(TestBed.inject(StorefrontTableService).forBranch('merchant-44', 'branch-12'))
      .toEqual({ merchantId: 'merchant-44', branchId: 'branch-12', tableCode: 'AB3K7Q', tableName: 'Terrace 3' });
    expect(harness.routeNativeElement?.textContent).toContain('Your table: Terrace 3');
    expect(harness.routeNativeElement?.textContent).not.toContain('table-uuid');
  });

  it('opens a deactivated Table as the Branch storefront for counter pickup', async () => {
    api.resolveTable.and.returnValue(of({ ...resolution, tableId: null, tableName: null, active: false }));
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/t/AB3K7Q');
    await settle(harness);

    expect(TestBed.inject(StorefrontTableService).forBranch('merchant-44', 'branch-12')?.tableCode).toBeNull();
    expect(harness.routeNativeElement?.querySelector('[data-testid="counter-note"]')?.textContent).toContain('collect your order at the counter');
    expect(harness.routeNativeElement?.querySelector('[data-testid="table-note"]')).toBeNull();
  });

  it('offers "Enter table code" when the code is unknown', async () => {
    api.resolveTable.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/t/AB3K7Q');
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('We could not find this table');
    expect(harness.routeNativeElement?.querySelector('[data-testid="table-code-input"]')).not.toBeNull();
  });

  it('does not call the API for something that cannot be a Table Code', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/t/ABC');
    harness.detectChanges();

    expect(api.resolveTable).not.toHaveBeenCalled();
    expect(harness.routeNativeElement?.textContent).toContain('We could not find this table');
  });
});
