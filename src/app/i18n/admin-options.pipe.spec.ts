import { TestBed } from '@angular/core/testing';
import { AdminLocaleService } from './admin-locale.service';
import { AdminOptionsPipe } from './admin-options.pipe';

describe('AdminOptionsPipe', () => {
  it('translates labels reactively, preserving values and API objects', () => {
    const pipe = TestBed.runInInjectionContext(() => new AdminOptionsPipe());
    const locale = TestBed.inject(AdminLocaleService);
    const options = [{ value: 'ACTIVE', label: 'Active' }];
    locale.use('ar');
    const arabic = pipe.transform(options);
    expect(arabic).toEqual([{ value: 'ACTIVE', label: 'نشط' }]);
    expect(options[0].label).toBe('Active');
    expect(pipe.transform(options)).toBe(arabic);
    locale.use('de');
    expect(pipe.transform(options)[0].label).toBe('Aktiv');
  });
});
