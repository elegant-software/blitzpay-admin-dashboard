import { TestBed } from '@angular/core/testing';
import { StorefrontLanguageService, catalogLanguages, nativeLanguageName } from './storefront-language.service';
import { StorefrontMerchant } from '../models/storefront.models';

describe('StorefrontLanguageService', () => {
  beforeEach(() => sessionStorage.clear());

  it('remembers the chosen catalog language for the browsing session', () => {
    TestBed.inject(StorefrontLanguageService).choose('en');
    TestBed.resetTestingModule();
    expect(TestBed.inject(StorefrontLanguageService).language).toBe('en');
  });

  it('has no language until the shopper chooses one', () => {
    expect(TestBed.inject(StorefrontLanguageService).language).toBeNull();
  });

  it('keeps page direction unchanged when choosing Arabic or another menu language', () => {
    const direction = document.documentElement.getAttribute('dir');
    const service = TestBed.inject(StorefrontLanguageService);
    service.choose('ar');
    expect(document.documentElement.getAttribute('dir')).toBe(direction);
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBe('ar');
    service.choose('tr');
    expect(document.documentElement.getAttribute('dir')).toBe(direction);
  });

  it('restores the Arabic preference without changing page direction', () => {
    const direction = document.documentElement.getAttribute('dir');
    sessionStorage.setItem('blitzpay.storefront-language', 'ar');
    expect(TestBed.inject(StorefrontLanguageService).language).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe(direction);
  });

  it('keeps page direction on an Arabic browser without persisting a choice', () => {
    const direction = document.documentElement.getAttribute('dir');
    spyOnProperty(navigator, 'language', 'get').and.returnValue('ar-SA');
    expect(TestBed.inject(StorefrontLanguageService).language).toBeNull();
    expect(document.documentElement.getAttribute('dir')).toBe(direction);
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBeNull();
  });
});

describe('catalogLanguages', () => {
  const merchant = (overrides: Partial<StorefrontMerchant>): StorefrontMerchant => ({
    applicationId: 'm', merchantName: 'Café', ...overrides
  });

  it('offers the original and supported languages while International Menu is enabled', () => {
    expect(catalogLanguages(merchant({ offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: ['en'] })))
      .toEqual(['de', 'en']);
  });

  it('offers nothing without the offering and includes the original even without extra languages', () => {
    expect(catalogLanguages(merchant({ offerings: [], originalMenuLanguage: 'de', supportedMenuLanguages: ['en'] }))).toEqual([]);
    expect(catalogLanguages(merchant({ offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: [] }))).toEqual(['de']);
    expect(catalogLanguages(null)).toEqual([]);
  });

  it('names languages in their own language', () => {
    expect(nativeLanguageName('ar')).toBe('العربية');
    expect(nativeLanguageName('en')).toBe('English');
    expect(nativeLanguageName('tr')).toBe('Türkçe');
    expect(nativeLanguageName('de')).toBe('Deutsch');
    expect(nativeLanguageName('fr')).toBe('Français');
  });

  it('builds My Restaurant options from merchant configuration without duplicates', () => {
    expect(catalogLanguages(merchant({
      offerings: ['INTERNATIONAL_MENU', 'PRE_ORDER', 'WALK_IN_ORDERING'],
      originalMenuLanguage: 'de', supportedMenuLanguages: ['ar', 'en', 'tr', 'de', 'ar']
    }))).toEqual(['de', 'ar', 'en', 'tr']);
  });
});
