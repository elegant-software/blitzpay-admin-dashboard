import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminLanguageService } from './admin-language.service';
import { PrimeNG } from 'primeng/config';

const languages = [
  { code: 'en', displayName: 'English', nativeName: 'English', flagCode: 'GB', direction: 'ltr' },
  { code: 'de', displayName: 'German', nativeName: 'Deutsch', flagCode: 'DE', direction: 'ltr' },
  { code: 'ar', displayName: 'Arabic', nativeName: 'العربية', flagCode: 'SA', direction: 'rtl' }
].map(language => ({ ...language, adminUiEnabled: true, menuEnabled: true }));

describe('AdminLanguageService', () => {
  let service: AdminLanguageService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('blitzpay.admin-language');
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting()
    ] });
    service = TestBed.inject(AdminLanguageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('blitzpay.admin-language');
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  function respond() {
    const request = http.expectOne(r => r.url.endsWith('/v1/merchants/menu-languages'));
    expect(request.request.method).toBe('GET');
    request.flush(languages);
  }

  it('loads the dashboard language catalogue once', () => {
    service.load(); service.load(); respond();
    expect(service.languages().map(l => l.code)).toEqual(['en', 'de', 'ar']);
  });

  it('offers only backend-enabled languages with shipped interface translations', () => {
    service.load();
    http.expectOne(r => r.url.endsWith('/merchants/menu-languages')).flush([
      languages[0], { ...languages[1], adminUiEnabled: false },
      { ...languages[0], code: 'fr', adminUiEnabled: true }
    ]);
    expect(service.languages().map(language => language.code)).toEqual(['en']);
  });

  it('switches translations and document direction, persists selection, and restores LTR', () => {
    service.load(); respond(); service.select('ar');
    expect(service.text('Dashboard')).toBe('لوحة التحكم');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(localStorage.getItem('blitzpay.admin-language')).toBe('ar');
    service.select('de');
    expect(document.documentElement.dir).toBe('ltr');
    expect(service.text('Dashboard')).toBe('Dashboard');
  });

  it('restores a supported preference and ignores unsupported selection', () => {
    localStorage.setItem('blitzpay.admin-language', 'ar');
    service.load(); respond(); service.select('xx');
    expect(service.selected().code).toBe('ar');
    expect(service.text('Untranslated text')).toBe('Untranslated text');
  });

  it('falls back to English for an unavailable preference', () => {
    localStorage.setItem('blitzpay.admin-language', 'xx');
    service.load(); respond();
    expect(service.selected().code).toBe('en');
  });

  it('updates paginator accessibility labels and restores them when leaving the dashboard', () => {
    service.load(); respond(); service.select('ar');
    expect(TestBed.inject(PrimeNG).translation.aria?.nextPageLabel).toBe('الصفحة التالية');
    service.leaveDashboard();
    expect(TestBed.inject(PrimeNG).translation.aria?.nextPageLabel).toBe('Next Page');
  });

  it('shows a recoverable error and can retry after failure', () => {
    service.load();
    http.expectOne(r => r.url.endsWith('/merchants/menu-languages')).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(service.error()).toBeTruthy();
    expect(service.selected().code).toBe('en');
    service.load(); respond();
    expect(service.error()).toBe('');
  });

  it('handles an empty catalogue with a visible error', () => {
    service.load();
    http.expectOne(r => r.url.endsWith('/merchants/menu-languages')).flush([]);
    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBeFalse();
    service.load(); respond();
    expect(service.languages().length).toBe(3);
  });

  it('keeps the login document LTR if language loading completes after leaving the dashboard', () => {
    localStorage.setItem('blitzpay.admin-language', 'ar');
    service.load(); service.leaveDashboard(); respond();
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    service.load();
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
