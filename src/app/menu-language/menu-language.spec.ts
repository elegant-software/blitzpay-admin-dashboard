import { Merchant, MenuLanguage } from '../models/merchant-catalog.models';
import { isRightToLeft, languageLabel, merchantMenuLanguages, offersInternationalMenu, displayProductLanguage } from './menu-language';

describe('menu language helpers', () => {
  const catalogue: MenuLanguage[] = [
    { code: 'de', displayName: 'German', nativeName: 'Deutsch' },
    { code: 'en', displayName: 'English', nativeName: 'English' },
  ];
  const merchant = (overrides: Partial<Merchant> = {}): Merchant => ({
    merchantId: 'm-1', merchantCode: 'MRC-1', merchantName: 'Café Lena', merchantStatus: 'ACTIVE',
    offerings: [], lastUpdatedAt: '2026-10-31T12:00:00Z', ...overrides,
  });

  it('lists the original language first, then supported languages', () => {
    expect(merchantMenuLanguages(merchant({ originalMenuLanguage: 'de', supportedMenuLanguages: ['fr', 'en'] })))
      .toEqual(['de', 'fr', 'en']);
  });

  it('has no menu languages without an original language', () => {
    expect(merchantMenuLanguages(merchant({ supportedMenuLanguages: ['en'] }))).toEqual([]);
    expect(merchantMenuLanguages(null)).toEqual([]);
  });

  it('labels a language with its English and native names', () => {
    expect(languageLabel('de', catalogue)).toBe('German — Deutsch');
    expect(languageLabel('en', catalogue)).toBe('English');
  });

  it('falls back to the upper-case code for unknown languages', () => {
    expect(languageLabel('xx', catalogue)).toBe('XX');
  });

  it('detects the International Menu offering', () => {
    expect(offersInternationalMenu(merchant({ offerings: ['PRE_ORDER', 'INTERNATIONAL_MENU'] }))).toBeTrue();
    expect(offersInternationalMenu(merchant())).toBeFalse();
  });

  it('flags right-to-left languages', () => {
    expect(isRightToLeft('ar')).toBeTrue();
    expect(isRightToLeft('fa')).toBeTrue();
    expect(isRightToLeft('de')).toBeFalse();
  });

  it('uses the UI language only when the merchant supports it', () => {
    const multilingual = merchant({ originalMenuLanguage: 'de', supportedMenuLanguages: ['en', 'ar'] });
    expect(displayProductLanguage(multilingual, 'ar')).toBe('ar');
    expect(displayProductLanguage(multilingual, 'en-GB')).toBe('en');
    expect(displayProductLanguage(multilingual, 'fr')).toBe('de');
  });

  it('keeps single-language merchants in their original language', () => {
    expect(displayProductLanguage(merchant({ originalMenuLanguage: 'de' }), 'ar')).toBe('de');
    expect(displayProductLanguage(merchant(), 'ar')).toBeUndefined();
    expect(displayProductLanguage(null, 'ar')).toBeUndefined();
  });
});
