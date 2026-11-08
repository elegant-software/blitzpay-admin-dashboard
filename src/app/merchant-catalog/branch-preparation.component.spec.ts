import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BranchPreparationComponent } from './branch-preparation.component';

describe('Branch preparation stations', () => {
  it('loads fresh settings, keeps assignments on save and emits the saved configuration', async () => {
    await TestBed.configureTestingModule({ imports: [BranchPreparationComponent], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    const fixture = TestBed.createComponent(BranchPreparationComponent);
    fixture.componentRef.setInput('merchantId', 'merchant');
    fixture.componentRef.setInput('branchId', 'branch');
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    const emitted: unknown[] = [];
    component.saved.subscribe(c => emitted.push(c));
    component.open();
    http.expectOne(r => r.url.endsWith('/preparation-configuration'))
      .flush({ stations: [], categoryDefaults: { cat: 'old' }, productOverrides: {} });
    component.addStation();
    component.configuration.stations[0].name = ' Food Kitchen ';
    spyOn(window, 'confirm').and.returnValue(false);
    component.close();
    expect(component.visible).toBeTrue();
    component.save();
    const save = http.expectOne(r => r.method === 'PUT' && r.url.endsWith('/preparation-configuration'));
    expect(save.request.body.stations[0].name).toBe('Food Kitchen');
    expect(save.request.body.categoryDefaults).toEqual({ cat: 'old' });
    save.flush(save.request.body);
    expect(component.visible).toBeFalse();
    expect(emitted.length).toBe(1);
    http.verify();
    fixture.destroy();
  });
});
