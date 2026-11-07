import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WhiteLabelComponent } from './white-label.component';
import { MerchantApiService } from '../services/merchant-api.service';
import { defaultPalette } from './white-label.models';

describe('WhiteLabelComponent', () => {
  const response = () => ({settings: {enabled: true, displayName: 'North', hiddenFeatures: []}, revision: 2,
    effective: {enabled: true, displayName: 'North', title: 'North', logoUrl: null, darkLogoUrl: null,
      themeMode: 'SYSTEM', light: defaultPalette(false), dark: defaultPalette(true), features: ['APPOINTMENT_BOOKING']},
    availableFeatures: ['APPOINTMENT_BOOKING'], inherited: false});
  let api: jasmine.SpyObj<MerchantApiService>;
  let component: WhiteLabelComponent;
  beforeEach(() => {
    api = jasmine.createSpyObj('MerchantApiService', ['getWhiteLabel', 'saveWhiteLabel', 'getBranches', 'getMerchant', 'listWhiteLabelThemes']);
    api.getWhiteLabel.and.returnValue(of(response() as any));
    api.getBranches.and.returnValue(of([]));
    api.getMerchant.and.returnValue(of({merchantName: 'North'} as any));
    api.listWhiteLabelThemes.and.returnValue(of([]));
    TestBed.configureTestingModule({providers: [{provide: MerchantApiService, useValue: api},
      {provide: ActivatedRoute, useValue: {snapshot: {paramMap: new Map([['id', 'merchant-1']]), queryParamMap: new Map()}}}]});
    component = TestBed.runInInjectionContext(() => new WhiteLabelComponent());
    component.ngOnInit();
  });
  it('loads resolved palettes without making inherited values explicit', () => {
    expect(component.settings.light).toBeUndefined();
    expect(component.previewPalette.card).toBe('#FFFFFF');
    expect(component.revision).toBe(2);
  });
  it('publishes edited settings with revision and clears dirty state only after success', () => {
    component.settings.title = 'New title'; component.markDirty();
    api.saveWhiteLabel.and.returnValue(of(response() as any));
    component.save();
    expect(api.saveWhiteLabel).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'merchant-1', '', 'SHOPPER',
      jasmine.objectContaining({revision: 2, settings: jasmine.objectContaining({title: 'New title'})}));
    expect(component.dirty).toBeFalse();
  });
  it('keeps edits and displays server detail after a conflicting save', () => {
    component.markDirty();
    api.saveWhiteLabel.and.returnValue(throwError(() => ({error: {detail: 'Reload before saving'}})));
    component.save();
    expect(component.error).toBe('Reload before saving');
    expect(component.dirty).toBeTrue();
  });
  it('guards app changes and navigation with unsaved edits', () => {
    component.markDirty(); spyOn(window, 'confirm').and.returnValue(false);
    component.changeScope('KITCHEN', '');
    expect(component.app).toBe('SHOPPER');
    expect(component.canLeave()).toBeFalse();
  });
  it('copies a palette before editing and supports resetting to inheritance', () => {
    component.setColor('card', '#EEEEEE');
    expect(component.settings.light?.card).toBe('#EEEEEE');
    component.inheritPalette();
    expect(component.settings.light).toBeNull();
    expect(component.previewPalette.card).toBe('#FFFFFF');
  });
  it('normalizes cleared optional identity fields to inheritance', () => {
    component.settings.displayName = '  '; component.settings.title = ''; component.markDirty();
    api.saveWhiteLabel.and.returnValue(of(response() as any)); component.save();
    expect(api.saveWhiteLabel.calls.mostRecent().args[5].settings.displayName).toBeNull();
    expect(api.saveWhiteLabel.calls.mostRecent().args[5].settings.title).toBeNull();
  });
  it('does not mutate the saved response when discarding a logo change', () => {
    component.response!.logoPreviewUrl = 'saved.png';
    component.clearLogo(false);
    expect(component.response!.logoPreviewUrl).toBe('saved.png');
    spyOn(window, 'confirm').and.returnValue(true); component.cancel();
    expect(component.previewLogo).toBe('saved.png');
  });
  it('uses server supplied inherited colors when resetting an override', () => {
    component.response!.inheritedConfiguration = {...component.response!.effective,
      light: {...defaultPalette(false), card: '#F0F0F0'}};
    component.setColor('card', '#EEEEEE'); component.inheritPalette();
    expect(component.previewPalette.card).toBe('#F0F0F0');
  });
  it('hides features locally without changing merchant entitlements', () => {
    component.toggleFeature('APPOINTMENT_BOOKING', false);
    expect(component.settings.hiddenFeatures).toEqual(['APPOINTMENT_BOOKING']);
    component.toggleFeature('APPOINTMENT_BOOKING', true);
    expect(component.settings.hiddenFeatures).toEqual([]);
  });
});
