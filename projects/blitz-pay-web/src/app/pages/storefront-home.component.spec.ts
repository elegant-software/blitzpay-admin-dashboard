import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { StorefrontHomeComponent } from './storefront-home.component';

describe('Storefront welcome page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('guides a new guest to use their camera without offering an unavailable scanner', () => {
    const fixture = TestBed.createComponent(StorefrontHomeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Open your phone’s camera");
    expect(fixture.nativeElement.querySelector('a[href="#how-it-works"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="return-menu"]')).toBeNull();
  });

  it('lets a returning guest resume their branch menu', () => {
    TestBed.inject(StorefrontSessionService).useScope('merchant-44', 'branch-12');
    const fixture = TestBed.createComponent(StorefrontHomeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="return-menu"]').getAttribute('href'))
      .toBe('/m/merchant-44/b/branch-12');
  });

  it('opens the Table Link for a typed table code', async () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const fixture = TestBed.createComponent(StorefrontHomeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="table-code-input"]');

    input.value = 'ab3-k7q';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('[data-testid="table-code-submit"]').click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/t', 'AB3K7Q']);
  });

  it('explains the format instead of opening an impossible table code', async () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate');
    const fixture = TestBed.createComponent(StorefrontHomeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="table-code-input"]');

    input.value = 'table 5';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('[data-testid="table-code-submit"]').click();
    fixture.detectChanges();

    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('A table code has 6 letters and numbers');
  });
});
