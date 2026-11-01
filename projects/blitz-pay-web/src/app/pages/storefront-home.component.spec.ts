import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
});
