import { TestBed } from '@angular/core/testing';
import { AdminLanguageService } from './admin-language.service';
import { PrimeNG } from 'primeng/config';

describe('AdminLanguageService', () => {
  let service: AdminLanguageService;

  beforeEach(() => {
    localStorage.removeItem('blitzpay.admin-language');
    service = TestBed.inject(AdminLanguageService);
  });

  afterEach(() => {
    localStorage.removeItem('blitzpay.admin-language');
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  it('offers the languages shipped in languages.json without asking the backend', () => {
    expect(service.languages().map(l => l.code)).toEqual(['en', 'de', 'ar']);
  });

  it('switches translations and document direction, persists selection, and restores LTR', () => {
    service.load(); service.select('ar');
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
    service.load(); service.select('xx');
    expect(service.selected().code).toBe('ar');
    expect(service.text('Untranslated text')).toBe('Untranslated text');
  });

  it('falls back to English for an unavailable preference', () => {
    localStorage.setItem('blitzpay.admin-language', 'xx');
    service.load();
    expect(service.selected().code).toBe('en');
  });

  it('updates paginator accessibility labels and restores them when leaving the dashboard', () => {
    service.load(); service.select('ar');
    expect(TestBed.inject(PrimeNG).translation.aria?.nextPageLabel).toBe('الصفحة التالية');
    service.leaveDashboard();
    expect(TestBed.inject(PrimeNG).translation.aria?.nextPageLabel).toBe('Next Page');
  });

  it('keeps the login document LTR after leaving the dashboard and reapplies the preference on return', () => {
    localStorage.setItem('blitzpay.admin-language', 'ar');
    service.load(); service.leaveDashboard();
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    service.load();
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
