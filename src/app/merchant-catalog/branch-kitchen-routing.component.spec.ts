import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductCategory } from '../models/merchant-catalog.models';
import { BranchKitchenRoutingComponent } from './branch-kitchen-routing.component';

describe('Branch kitchen routing', () => {
  const category = (id: string, name: string) => ({ id, name, createdAt: '', updatedAt: '' }) as ProductCategory;
  const config = { stations: [{ id: 's-bar', name: 'Drinks Bar' }], categoryDefaults: {}, productOverrides: { p: 's-bar' } };

  async function setup() {
    await TestBed.configureTestingModule({ imports: [BranchKitchenRoutingComponent], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    const fixture = TestBed.createComponent(BranchKitchenRoutingComponent);
    fixture.componentRef.setInput('merchantId', 'm');
    fixture.componentRef.setInput('branchId', 'b-1');
    fixture.componentRef.setInput('categories', [category('c-drinks', 'Drinks'), category('c-mains', 'Mains')]);
    fixture.detectChanges();
    return { fixture, http: TestBed.inject(HttpTestingController), el: fixture.nativeElement as HTMLElement };
  }

  it('saves a category station on the given branch, keeping product overrides', async () => {
    const { fixture, http, el } = await setup();
    http.expectOne(r => r.url.endsWith('/branches/b-1/preparation-configuration')).flush(config);
    fixture.detectChanges();
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

  it('reloads when the selected branch changes', async () => {
    const { fixture, http } = await setup();
    http.expectOne(r => r.url.endsWith('/branches/b-1/preparation-configuration')).flush(config);
    fixture.componentRef.setInput('branchId', 'b-2');
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/branches/b-2/preparation-configuration')).flush(config);
    http.verify();
  });
});
