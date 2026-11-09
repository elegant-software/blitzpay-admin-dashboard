import { TestBed } from '@angular/core/testing';
import { StorefrontUiService } from '../services/storefront-ui.service';
import { OpenShopperAppComponent } from './open-shopper-app.component';

describe('Open shopper app from a Table web fallback', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [OpenShopperAppComponent],
    providers: [{ provide: StorefrontUiService, useValue: { text: (value: string) => value } }]
  }));

  it('preserves the Table Code in a user-initiated app link and leaves the web page available', () => {
    const fixture = TestBed.createComponent(OpenShopperAppComponent);
    fixture.componentRef.setInput('code', 'ab3-k7q');
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('[data-testid="shopper-app-link"]') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('blitzpay://t/AB3K7Q');
    expect(fixture.nativeElement.textContent).toContain('continue ordering here');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('does not offer an app destination for invalid or missing table context', () => {
    const fixture = TestBed.createComponent(OpenShopperAppComponent);
    for (const code of ['', 'AB0234', 'javascript:alert(1)', null]) {
      fixture.componentRef.setInput('code', code);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('a')).toBeNull();
    }
  });
});
