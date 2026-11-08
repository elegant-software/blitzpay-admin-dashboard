import { TestBed } from '@angular/core/testing';
import { AdminLocaleService } from './admin-locale.service';

describe('AdminLocaleService', () => {
  it('translates shared actions in German and Arabic and preserves merchant data parameters', () => {
    const locale = TestBed.inject(AdminLocaleService);
    locale.use('de');
    expect(locale.text('Save')).toBe('Speichern');
    locale.use('ar');
    expect(locale.text('Save')).toBe('حفظ');
    expect(locale.text('Translations — {0}', ['Café Blitz'])).toContain('Café Blitz');
    expect(locale.text('Translations — {0}', ['Café Blitz'])).toContain('الترجمات');
    expect(locale.text('Café Blitz')).toBe('Café Blitz');
  });

  it('handles empty values, missing translations, whitespace and safe interpolation', () => {
    const locale = TestBed.inject(AdminLocaleService);
    expect(locale.text(null)).toBe('');
    expect(locale.text(undefined)).toBe('');
    expect(locale.text('')).toBe('');
    expect(locale.text('Unknown {0}', ['$&'])).toBe('Unknown $&');
    locale.use('ar');
    expect(locale.text('  Save  ')).toBe('  حفظ  ');
    expect(locale.text('Unknown')).toBe('Unknown');
  });

  it('localizes stored messages with dynamic values when the language changes', () => {
    const locale = TestBed.inject(AdminLocaleService);
    const message = 'Added table Terrace 1.';
    locale.use('ar');
    expect(locale.text(message)).toContain('تمت إضافة الطاولة');
    expect(locale.text(message)).toContain('Terrace 1');
    locale.use('de');
    expect(locale.text(message)).toBe('Tisch Terrace 1 hinzugefügt.');
  });
});
