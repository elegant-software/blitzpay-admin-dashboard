import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MerchantThemesComponent } from './merchant-themes.component';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';

describe('Merchant brand themes', () => {
  let fixture: ComponentFixture<MerchantThemesComponent>;
  let component: MerchantThemesComponent;
  let api: jasmine.SpyObj<MerchantApiService>;
  const theme = { app: 'SHOPPER' as const, id: 'summer', merchantId: 'merchant', name: 'Summer', primaryColor: '#123ABC',
    accentColor: '#FFCC00', primaryTextColor: '#FFFFFF', accentTextColor: '#000000' };
  beforeEach(async () => {
    api = jasmine.createSpyObj('MerchantApiService', ['getMerchantThemes', 'createMerchantTheme', 'updateMerchantTheme']);
    api.getMerchantThemes.and.returnValue(of([theme]));
    api.createMerchantTheme.and.returnValue(of({ ...theme, id: 'winter', name: 'Winter' }));
    api.updateMerchantTheme.and.returnValue(of({ ...theme, name: 'Updated' }));
    await TestBed.configureTestingModule({ imports: [MerchantThemesComponent], providers: [{ provide: MerchantApiService, useValue: api }] }).compileComponents();
    fixture = TestBed.createComponent(MerchantThemesComponent);
    component = fixture.componentInstance;
    component.merchantId = 'merchant';
    component.environment = getEnvironmentByKey('local');
    fixture.detectChanges();
  });
  it('loads fresh themes each time the editor opens and shows color controls', () => {
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(api.getMerchantThemes).toHaveBeenCalledWith(component.environment, 'v1', 'merchant', 'SHOPPER');
    expect(fixture.nativeElement.querySelectorAll('input[type=color]').length).toBe(2);
    component.close();
    component.open();
    expect(api.getMerchantThemes).toHaveBeenCalledTimes(2);
  });
  it('saves multiple named themes and closes only after success', () => {
    component.open();
    component.form.name = ' Winter ';
    component.save();
    expect(api.createMerchantTheme).toHaveBeenCalledWith(component.environment, 'v1', 'merchant', jasmine.objectContaining({ name: 'Winter' }), 'SHOPPER');
    expect(component.themes.length).toBe(2);
    expect(component.dialogOpen).toBeFalse();
  });
  it('edits the selected theme without creating another', () => {
    component.open();
    component.selectTheme('summer');
    component.form.name = 'Updated';
    component.save();
    expect(api.updateMerchantTheme).toHaveBeenCalledWith(component.environment, 'v1', 'merchant', 'summer', jasmine.objectContaining({ name: 'Updated' }), 'SHOPPER');
    expect(api.createMerchantTheme).not.toHaveBeenCalled();
    expect(component.themes.length).toBe(1);
  });
  it('keeps invalid values and API errors in the editor', () => {
    component.open();
    component.form.name = 'Winter';
    component.form.primaryColor = 'red';
    component.save();
    expect(api.createMerchantTheme).not.toHaveBeenCalled();
    component.form.primaryColor = '#000000';
    api.createMerchantTheme.and.returnValue(throwError(() => ({ error: { detail: 'Theme could not be saved' } })));
    component.save();
    fixture.detectChanges();
    expect(component.dialogOpen).toBeTrue();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Theme could not be saved');
  });
  it('prompts before discarding edits and keeps them if declined', () => {
    component.open();
    component.form.name = 'Unsaved';
    spyOn(window, 'confirm').and.returnValue(false);
    component.close();
    expect(component.dialogOpen).toBeTrue();
    expect(component.form.name).toBe('Unsaved');
  });
  it('prevents editing after a failed load and offers retry', () => {
    api.getMerchantThemes.and.returnValue(throwError(() => ({ error: { detail: 'Not available' } })));
    component.open();
    fixture.detectChanges();
    expect(component.loaded).toBeFalse();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Not available');
    component.form.name = 'Winter';
    component.save();
    expect(api.createMerchantTheme).not.toHaveBeenCalled();
  });
  it('labels and saves the merchant mobile app independently', () => {
    component.app = 'MERCHANT';
    component.open();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Merchant app branding');
    expect(api.getMerchantThemes).toHaveBeenCalledWith(component.environment, 'v1', 'merchant', 'MERCHANT');
    component.form.name = 'Winter';
    component.save();
    expect(api.createMerchantTheme).toHaveBeenCalledWith(component.environment, 'v1', 'merchant', jasmine.objectContaining({ name: 'Winter' }), 'MERCHANT');
  });
});
