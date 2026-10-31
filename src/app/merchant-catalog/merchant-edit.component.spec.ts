import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MenuLanguage, Merchant, MerchantLocation, UpdateMerchantRequest } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { MerchantEditComponent } from './merchant-edit.component';

describe('MerchantEditComponent menu languages', () => {
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

  async function setup(loaded: Merchant = merchant()) {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService',
      ['getMerchant', 'getVerticals', 'getLocation', 'getMenuLanguages', 'updateMerchant', 'saveLocation']);
    merchantApi.getMerchant.and.returnValue(of(loaded));
    merchantApi.getVerticals.and.returnValue(of([]));
    merchantApi.getLocation.and.returnValue(of(null as unknown as MerchantLocation));
    merchantApi.getMenuLanguages.and.returnValue(of(catalogue));
    merchantApi.updateMerchant.and.returnValue(of(loaded));

    await TestBed.configureTestingModule({
      imports: [MerchantEditComponent],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: MerchantApiService, useValue: merchantApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'm-1' }) } } },
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
