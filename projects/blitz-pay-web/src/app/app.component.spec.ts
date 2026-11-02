import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

describe('Web Storefront shell', () => {
  it('reveals store choices after scrolling and pressing Download, and can collapse them', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const prompt: HTMLElement | null = fixture.nativeElement.querySelector('[data-testid="app-install-prompt"]');
    expect(prompt?.hidden).toBeTrue();
    spyOnProperty(window, 'scrollY', 'get').and.returnValue(240);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(prompt?.hidden).toBeFalse();
    const download = prompt!.querySelector<HTMLButtonElement>('[aria-controls="app-download-links"]')!;
    expect(download.getAttribute('aria-expanded')).toBe('false');
    const links = prompt!.querySelector<HTMLElement>('#app-download-links')!;
    expect(links.hidden).toBeTrue();
    download.click();
    fixture.detectChanges();
    expect(download.getAttribute('aria-expanded')).toBe('true');
    expect(links.hidden).toBeFalse();
    const storeLinks = Array.from(links.querySelectorAll<HTMLAnchorElement>('a'));
    expect(storeLinks.map((link) => link.href)).toEqual([
      environment.appStoreUrl,
      environment.googlePlayUrl
    ]);
    download.click();
    fixture.detectChanges();
    expect(links.hidden).toBeTrue();
  });

  it('exposes an accessible header theme toggle', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('[data-testid="theme-toggle"]') as HTMLButtonElement;
    const before = document.documentElement.dataset['theme'];
    expect(button.getAttribute('aria-label')).toContain('Switch to');
    button.click();
    fixture.detectChanges();
    expect(document.documentElement.dataset['theme']).not.toBe(before);
  });
});
