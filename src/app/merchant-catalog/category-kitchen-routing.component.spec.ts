import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Branch, ProductCategory } from '../models/merchant-catalog.models';
import { CategoryKitchenRoutingComponent } from './category-kitchen-routing.component';

describe('Category kitchen routing', () => {
  const branch = (branchId: string, name: string) => ({ branchId, name, merchantId: 'm', branchCode: name, status: 'ACTIVE' }) as Branch;
  const category = (id: string, name: string) => ({ id, name, createdAt: '', updatedAt: '' }) as ProductCategory;
  const config = { stations: [{ id: 's-bar', name: 'Drinks Bar' }], categoryDefaults: {}, productOverrides: { p: 's-bar' } };

  async function setup(branches: Branch[]) {
    await TestBed.configureTestingModule({ imports: [CategoryKitchenRoutingComponent], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    const fixture = TestBed.createComponent(CategoryKitchenRoutingComponent);
    fixture.componentRef.setInput('merchantId', 'm');
    fixture.componentRef.setInput('branches', branches);
    fixture.componentRef.setInput('categories', [category('c-drinks', 'Drinks'), category('c-mains', 'Mains')]);
    fixture.detectChanges();
    return { fixture, http: TestBed.inject(HttpTestingController), el: fixture.nativeElement as HTMLElement };
  }

  it('saves a category station on the selected branch, keeping product overrides', async () => {
    const { fixture, http, el } = await setup([branch('b-1', 'Center')]);
    http.expectOne(r => r.url.endsWith('/branches/b-1/preparation-configuration')).flush(config);
    fixture.detectChanges();
    expect(el.querySelector('#kitchen-routing-branch')).toBeNull();
    expect(el.textContent).toContain('2 categories go to Unassigned');

    fixture.componentInstance.assign('c-drinks', 's-bar');
    const save = http.expectOne(r => r.method === 'PUT' && r.url.endsWith('/branches/b-1/preparation-configuration'));
    expect(save.request.body.categoryDefaults).toEqual({ 'c-drinks': 's-bar' });
    expect(save.request.body.productOverrides).toEqual({ p: 's-bar' });
    save.flush(save.request.body);
    fixture.detectChanges();
    expect(el.textContent).toContain('1 category goes to Unassigned');
    http.verify();
  });

  it('shows a branch picker for multi-branch merchants and loads the chosen branch', async () => {
    const { fixture, http, el } = await setup([branch('b-1', 'Center'), branch('b-2', 'Airport')]);
    http.expectOne(r => r.url.endsWith('/branches/b-1/preparation-configuration')).flush(config);
    fixture.detectChanges();
    expect(el.querySelector('#kitchen-routing-branch')).not.toBeNull();
    fixture.componentInstance.selectBranch('b-2');
    http.expectOne(r => r.url.endsWith('/branches/b-2/preparation-configuration')).flush(config);
    http.verify();
  });

  it('offers only active branches and opens on the active one', async () => {
    const inactive = { ...branch('b-old', 'Hannover'), active: false } as Branch;
    const { fixture, http, el } = await setup([inactive, branch('b-1', 'Bremen')]);
    http.expectOne(r => r.url.endsWith('/branches/b-1/preparation-configuration')).flush(config);
    fixture.detectChanges();
    expect(el.querySelector('#kitchen-routing-branch')).toBeNull();
    expect(el.querySelector('#kitchen-routing-title')!.textContent).toContain('Bremen');
    http.verify();
  });
});
