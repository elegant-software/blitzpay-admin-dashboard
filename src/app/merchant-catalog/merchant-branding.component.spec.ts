import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MerchantBrandingComponent } from './merchant-branding.component';
import { MerchantApiService } from '../services/merchant-api.service';
import { BrandingResponse } from '../models/merchant-branding.models';

const response: BrandingResponse = {
  settings: { enabled: true, displayName: 'Cafe Brand', logoStorageKey: null, primaryColor: '#123456', accentColor: null },
  effective: { platformName: 'Simpleio', enabled: true, displayName: 'Cafe Brand', logoUrl: null,
    primaryColor: '#123456', primaryTextColor: '#FFFFFF', accentColor: '#5856D6', accentTextColor: '#FFFFFF' }
};
describe('MerchantBrandingComponent', () => {
  let fixture: ComponentFixture<MerchantBrandingComponent>;
  let component: MerchantBrandingComponent;
  let api: jasmine.SpyObj<MerchantApiService>;
  beforeEach(async () => {
    api = jasmine.createSpyObj('MerchantApiService', ['getBranding', 'saveBranding', 'createBrandingLogoUpload', 'uploadMerchantLogo']);
    api.getBranding.and.returnValue(of(structuredClone(response)));
    api.saveBranding.and.returnValue(of(structuredClone(response)));
    await TestBed.configureTestingModule({ imports: [MerchantBrandingComponent], providers: [{ provide: MerchantApiService, useValue: api }] }).compileComponents();
    fixture = TestBed.createComponent(MerchantBrandingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('merchantId', 'm');
    fixture.componentRef.setInput('merchantName', 'Ordinary Cafe');
    fixture.componentRef.setInput('backendEnvironment', { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: '' });
    fixture.detectChanges();
  });
  it('loads fresh settings and previews branding without publishing', () => {
    component.open(); fixture.detectChanges();
    expect(api.getBranding).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-testid="brand-preview"]').textContent).toContain('Cafe Brand');
    expect(api.saveBranding).not.toHaveBeenCalled();
  });

  it('accepts branchId-only branches in the scope selector', () => {
    fixture.componentRef.setInput('branches', [{ branchId: 'b', merchantId: 'm', branchCode: 'BR-1', name: 'Riverside', status: 'ACTIVE' }]);
    component.open(); fixture.detectChanges();
    const options = Array.from(fixture.nativeElement.querySelectorAll('#branding-scope option')) as HTMLOptionElement[];
    expect(options.some(option => option.value === 'b' && option.textContent?.includes('Riverside'))).toBeTrue();
  });
  it('previews edits without saving and rejects invalid colors', () => {
    component.open(); component.draft.displayName = 'New Brand'; component.draft.primaryColor = 'red';
    fixture.detectChanges();
    expect(component.preview.displayName).toBe('New Brand');
    expect(component.valid).toBeFalse();
    component.save(); expect(api.saveBranding).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Enter a hex color');
  });
  it('inherits merchant fields after resetting a branch override', () => {
    component.open();
    const branch = structuredClone(response);
    branch.settings = { enabled: null, displayName: 'Branch Brand', logoStorageKey: null, primaryColor: null, accentColor: null };
    api.getBranding.and.callFake((_env, _version, _merchant, branchId) => of(structuredClone(branchId ? branch : response)));
    component.selectScope('b');
    expect(component.preview.displayName).toBe('Branch Brand');
    expect(component.preview.primaryColor).toBe('#123456');
    component.reset('displayName');
    expect(component.preview.displayName).toBe('Cafe Brand');
    component.save();
    expect(api.saveBranding.calls.mostRecent().args[3].displayName).toBeNull();
    expect(api.saveBranding.calls.mostRecent().args[4]).toBe('b');
  });
  it('restores Simpleio styling when disabled while keeping saved custom fields', () => {
    component.open(); component.draft.enabled = false;
    expect(component.preview.primaryColor).toBe('#00C2FF');
    expect(component.preview.displayName).toBe('Ordinary Cafe');
    component.save();
    expect(api.saveBranding.calls.mostRecent().args[3].displayName).toBe('Cafe Brand');
  });
  it('protects unsaved changes on close and scope changes', () => {
    component.open(); component.draft.displayName = 'Unsaved';
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    component.close(); expect(component.visible).toBeTrue();
    expect(component.selectScope('b')).toBeFalse(); expect(component.scope).toBe('');
    expect(component.canLeave()).toBeFalse();
    confirm.and.returnValue(true); component.close(); expect(component.visible).toBeFalse();
    expect(api.saveBranding).not.toHaveBeenCalled();
  });
  it('shows server field errors inside the dialog and preserves edits', () => {
    component.open(); component.draft.displayName = 'Unsaved';
    api.saveBranding.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400,
      error: { detail: 'Invalid branding settings', errors: { displayName: ['Choose another display name'] } } })));
    component.save(); fixture.detectChanges();
    expect(component.error).toBe('Invalid branding settings');
    expect(fixture.nativeElement.textContent).toContain('Choose another display name');
    expect(component.draft.displayName).toBe('Unsaved'); expect(component.dirty).toBeTrue();
  });
  it('blocks duplicate submissions and closing during publication', () => {
    component.open(); component.draft.displayName = 'Unsaved';
    const pending = new Subject<BrandingResponse>(); api.saveBranding.and.returnValue(pending);
    component.save(); component.save(); component.close();
    expect(api.saveBranding).toHaveBeenCalledTimes(1); expect(component.visible).toBeTrue();
    pending.next(response); pending.complete(); expect(component.saving).toBeFalse();
  });
  it('can retry a load failure without publishing defaults', () => {
    api.getBranding.and.returnValue(throwError(() => new HttpErrorResponse({status: 500, error: { detail: 'Branding unavailable' }})));
    component.open(); expect(component.loaded).toBeFalse(); expect(component.error).toBe('Branding unavailable');
    component.save(); expect(api.saveBranding).not.toHaveBeenCalled();
    api.getBranding.and.returnValue(of(response)); component.retry(); expect(component.loaded).toBeTrue();
  });
  it('uploads a logo as a draft and revokes its local preview when discarded', () => {
    component.open();
    const create = spyOn(URL, 'createObjectURL').and.returnValue('blob:preview');
    const revoke = spyOn(URL, 'revokeObjectURL');
    api.createBrandingLogoUpload.and.returnValue(of({storageKey:'new-logo', uploadUrl:'https://upload.example', expiresAt:''}));
    api.uploadMerchantLogo.and.returnValue(of(''));
    const file = new File(['image'], 'logo.png', { type: 'image/png' });
    component.upload({target: {files:[file], value:'logo.png'}} as unknown as Event);
    expect(create).toHaveBeenCalledWith(file); expect(component.preview.logoUrl).toBe('blob:preview');
    expect(api.saveBranding).not.toHaveBeenCalled();
    spyOn(window, 'confirm').and.returnValue(true); component.close(); expect(revoke).toHaveBeenCalledWith('blob:preview');
  });
  it('rejects unsupported logo types before requesting an upload', () => {
    component.open();
    component.upload({target:{files:[new File(['svg'], 'logo.svg', {type:'image/svg+xml'})],value:''}} as unknown as Event);
    expect(api.createBrandingLogoUpload).not.toHaveBeenCalled(); expect(component.error).toContain('PNG, JPG or WebP');
  });
  it('previews a saved disabled logo when branding is enabled again', () => {
    const disabled = structuredClone(response); disabled.settings.enabled = false;
    disabled.settings.logoStorageKey = 'custom.png'; disabled.logoPreviewUrl = 'https://images.example/custom.png';
    disabled.effective.enabled = false; disabled.effective.logoUrl = null;
    api.getBranding.and.returnValue(of(disabled)); component.open(); component.draft.enabled = true;
    expect(component.preview.logoUrl).toBe('https://images.example/custom.png');
  });
});
