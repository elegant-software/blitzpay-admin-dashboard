import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { NotificationService } from './notifications/notification.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('Web Storefront shell', () => {
  it('mounts the global toast host and shows action feedback', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], providers: [provideRouter([]), provideNoopAnimations()]
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.inject(NotificationService).success('Your order was placed. Please pay staff in cash.');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('app-notifications');
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Your order was placed.');
  });

  const dispatchInstallPrompt = (prompt: () => Promise<void>): void => {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' })
    });
    window.dispatchEvent(event);
  };

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

  it('shows a separate, dismissible PWA install notice only when the browser signals installability', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="pwa-install-notice"]')).toBeNull();

    const prompt = jasmine.createSpy('prompt').and.resolveTo();
    dispatchInstallPrompt(prompt);
    fixture.detectChanges();

    const notice: HTMLElement = fixture.nativeElement.querySelector('[data-testid="pwa-install-notice"]');
    expect(notice.textContent).toContain('Install this storefront');
    expect(notice.compareDocumentPosition(fixture.nativeElement.querySelector('[data-testid="app-install-prompt"]')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const installButton = notice.querySelector<HTMLButtonElement>('[data-testid="pwa-install-button"]');
    installButton?.click();
    expect(prompt).toHaveBeenCalledTimes(1);

    notice.querySelector<HTMLButtonElement>('[data-testid="pwa-install-dismiss"]')?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="pwa-install-notice"]')).toBeNull();
  });
});
