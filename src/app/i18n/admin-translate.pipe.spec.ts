import { TestBed } from '@angular/core/testing';
import { AdminLocaleService } from './admin-locale.service';
import { AdminTranslatePipe } from './admin-translate.pipe';

describe('AdminTranslatePipe', () => {
  it('handles empty values and updates an existing pipe when language changes', () => {
    const pipe = TestBed.runInInjectionContext(() => new AdminTranslatePipe());
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform('Save')).toBe('Save');
    TestBed.inject(AdminLocaleService).use('ar');
    expect(pipe.transform('Save')).toBe('حفظ');
    TestBed.inject(AdminLocaleService).use('de');
    expect(pipe.transform('Save')).toBe('Speichern');
    expect(pipe.transform('Table {0}', ['Terrace'])).toBe('Tisch Terrace');
  });
});
