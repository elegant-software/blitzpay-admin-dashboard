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
});

describe('catalogLanguages', () => {
  const merchant = (overrides: Partial<StorefrontMerchant>): StorefrontMerchant => ({
    applicationId: 'm', merchantName: 'Café', ...overrides
  });

  it('offers the original and supported languages while International Menu is enabled', () => {
    expect(catalogLanguages(merchant({ offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: ['en'] })))
      .toEqual(['de', 'en']);
  });

  it('offers nothing without the offering or without supported languages', () => {
    expect(catalogLanguages(merchant({ offerings: [], originalMenuLanguage: 'de', supportedMenuLanguages: ['en'] }))).toEqual([]);
    expect(catalogLanguages(merchant({ offerings: ['INTERNATIONAL_MENU'], originalMenuLanguage: 'de', supportedMenuLanguages: [] }))).toEqual([]);
    expect(catalogLanguages(null)).toEqual([]);
  });

  it('names languages in their own language', () => {
    expect(nativeLanguageName('de')).toBe('Deutsch');
    expect(nativeLanguageName('fr')).toBe('Français');
  });
});
