import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MenuLanguage, Merchant, MerchantLocation, UpdateMerchantRequest } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { MerchantEditComponent } from './merchant-edit.component';

describe('MerchantEditComponent shared create and edit form', () => {
  let fixture: ComponentFixture<MerchantEditComponent>;
  let component: MerchantEditComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const catalogue: MenuLanguage[] = [
    { code: 'en', displayName: 'English', nativeName: 'English' },
    { code: 'fr', displayName: 'French', nativeName: 'Français' },
    { code: 'de', displayName: 'German', nativeName: 'Deutsch' },
  ];

  const merchant = (overrides: Partial<Merchant> = {}): Merchant => ({
    merchantId: 'm-1', merchantCode: 'MRC-1', merchantName: 'Café Lena', merchantStatus: 'ACTIVE',
    offerings: ['PRE_ORDER'], lastUpdatedAt: '2026-10-31T12:00:00Z',
    originalMenuLanguage: 'de', supportedMenuLanguages: ['en'], ...overrides,
  });

  async function setup(loaded: Merchant = merchant(), creating = false) {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService',
      ['getMerchant', 'createMerchant', 'getVerticals', 'getLocation', 'getMenuLanguages', 'updateMerchant', 'saveLocation']);
    merchantApi.getMerchant.and.returnValue(of(loaded));
    merchantApi.createMerchant.and.returnValue(of(loaded));
    merchantApi.getVerticals.and.returnValue(of([]));
    merchantApi.getLocation.and.returnValue(of(null as unknown as MerchantLocation));
    merchantApi.getMenuLanguages.and.returnValue(of(catalogue));
    merchantApi.updateMerchant.and.returnValue(of(loaded));

    await TestBed.configureTestingModule({
      imports: [MerchantEditComponent],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: MerchantApiService, useValue: merchantApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(creating ? {} : { id: 'm-1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MerchantEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const savedPayload = (): UpdateMerchantRequest => merchantApi.updateMerchant.calls.mostRecent().args[3];

  it('loads the merchant languages and offers the rest of the catalogue', async () => {
    await setup();
    expect(component.form.originalMenuLanguage).toBe('de');
    expect(component.form.supportedMenuLanguages).toEqual(['en']);
    expect(component.addableMenuLanguages.map((l) => l.code)).toEqual(['fr']);
    expect(component.languageLabel('fr')).toBe('French — Français');
  });

  it('opens the shared form in create mode without loading an existing merchant', async () => {
    await setup(merchant(), true);

    const root = fixture.nativeElement as HTMLElement;
    expect(component.isCreateMode).toBeTrue();
    expect(merchantApi.getMerchant).not.toHaveBeenCalled();
    expect(root.querySelector('h1')?.textContent).toContain('Add a merchant');
    expect(root.querySelector('#merchant-name')).not.toBeNull();
    expect(root.querySelector('#merchant-editor-location-title')).not.toBeNull();
  });

  it('creates a merchant using the shared profile fields', async () => {
    await setup(merchant(), true);
    component.form.merchantName = 'New Cafe';
    component.form.website = 'https://new-cafe.example';
    component.form.offerings = ['PRE_ORDER'];

    component.save();

    expect(merchantApi.createMerchant).toHaveBeenCalledWith(
      component.selectedEnvironment,
      component.apiVersion,
      jasmine.objectContaining({
        merchantName: 'New Cafe',
        website: 'https://new-cafe.example',
        offerings: ['PRE_ORDER']
      })
    );
    expect(merchantApi.updateMerchant).not.toHaveBeenCalled();
    expect(component.isCreateMode).toBeFalse();
  });

  it('requires a trading name before creating or updating', async () => {
    await setup(merchant(), true);

    component.save();

    expect(merchantApi.createMerchant).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Enter a trading name.');
  });

  it('offers International Menu as an offering', async () => {
    await setup();
    expect(component.serviceOptions.map((o) => o.code)).toContain('INTERNATIONAL_MENU');
  });

  it('saves the original and supported menu languages', async () => {
    await setup();
    component.languageToAdd = 'fr';
    component.addSupportedMenuLanguage();
    component.toggleOffering('INTERNATIONAL_MENU');

    component.save();

    expect(savedPayload().originalMenuLanguage).toBe('de');
    expect(savedPayload().supportedMenuLanguages).toEqual(['en', 'fr']);
    expect(savedPayload().offerings).toEqual(['PRE_ORDER', 'INTERNATIONAL_MENU']);
  });

  it('drops a supported language that becomes the original language', async () => {
    await setup();
    component.onOriginalMenuLanguageChange('en');
    expect(component.form.supportedMenuLanguages).toEqual([]);
  });

  it('removes a supported language', async () => {
    await setup();
    component.removeSupportedMenuLanguage('en');
    component.save();
    expect(savedPayload().supportedMenuLanguages).toEqual([]);
  });

  it('blocks International Menu without an original language', async () => {
    await setup(merchant({ originalMenuLanguage: null, supportedMenuLanguages: [] }));
    component.toggleOffering('INTERNATIONAL_MENU');

    component.save();

    expect(merchantApi.updateMerchant).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Original Menu Language');
  });

  it('leaves languages untouched when the merchant has none', async () => {
    await setup(merchant({ originalMenuLanguage: null, supportedMenuLanguages: [] }));
    component.save();
    expect(savedPayload().originalMenuLanguage).toBeUndefined();
    expect(savedPayload().supportedMenuLanguages).toBeUndefined();
  });
});
