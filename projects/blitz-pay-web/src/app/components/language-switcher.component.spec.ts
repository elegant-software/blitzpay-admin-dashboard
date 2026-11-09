import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from '../app.component';
import { StorefrontUiService } from '../services/storefront-ui.service';

const languages = [
  { code: 'en', displayName: 'English', nativeName: 'English', flagCode: 'GB', direction: 'ltr' },
  { code: 'de', displayName: 'German', nativeName: 'Deutsch', flagCode: 'DE', direction: 'ltr' },
  { code: 'ar', displayName: 'Arabic', nativeName: 'العربية', flagCode: 'SA', direction: 'rtl' }
];

describe('Storefront header languages', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear(); document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr';
  });

  it('loads only public metadata and switches all page direction while keeping the selector LTR', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/v1/storefront/languages').flush(languages);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector<HTMLButtonElement>('web-language-switcher button')!;
    trigger.click(); fixture.detectChanges();
    const options = root.querySelectorAll<HTMLButtonElement>('[role=menuitemradio]');
    expect([...options].map(option => option.textContent?.trim())).toEqual(['English✓', 'Deutsch', 'العربية']);
    options[2].click(); fixture.detectChanges();
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(root.querySelector('.guest-label')?.textContent).toContain('أنت هنا كضيف');
    expect(getComputedStyle(root.querySelector('web-language-switcher')!).direction).toBe('ltr');
    expect(getComputedStyle(root.querySelector('web-language-switcher button')!).fontFamily).toContain('Cairo');
    expect(root.querySelector('[data-testid=app-install-prompt]')).toBeNull();
    expect(sessionStorage.getItem('blitzpay.storefront-ui-language')).toBe('ar');
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBe('ar');
    trigger.click(); fixture.detectChanges(); root.querySelectorAll<HTMLButtonElement>('[role=menuitemradio]')[1].click(); fixture.detectChanges();
    expect(document.documentElement.dir).toBe('ltr');
    expect(root.querySelector('.guest-label')?.textContent).toContain('Als Gast hier');
    fixture.destroy();
  });

  it('filters unshipped UI bundles and retries language failures without blocking the page', () => {
    const ui = TestBed.inject(StorefrontUiService);
    const http = TestBed.inject(HttpTestingController);
    ui.load(); http.expectOne('/v1/storefront/languages').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(ui.code()).toBe('en'); expect(ui.failed()).toBeTrue();
    ui.load(); http.expectOne('/v1/storefront/languages').flush([...languages, { ...languages[0], code: 'fr' }]);
    expect(ui.languages().map(language => language.code)).toEqual(['en', 'de', 'ar']);
    expect(ui.failed()).toBeFalse();
  });

  it('supports Escape and keyboard arrow navigation', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    TestBed.inject(HttpTestingController).expectOne('/v1/storefront/languages').flush(languages);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('web-language-switcher button') as HTMLButtonElement;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); fixture.detectChanges();
    await fixture.whenStable();
    const options = fixture.nativeElement.querySelectorAll('[role=menuitemradio]') as NodeListOf<HTMLButtonElement>;
    options[0].focus(); options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(options[1]);
    options[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });
});
