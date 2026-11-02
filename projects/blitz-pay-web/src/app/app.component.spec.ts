import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('Web Storefront shell', () => {
  const dispatchInstallPrompt = (prompt: () => Promise<void>): void => {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' })
    });
    window.dispatchEvent(event);
  };

  it('always exposes the App Install Prompt with both store destinations', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const prompt: HTMLElement | null = fixture.nativeElement.querySelector('[data-testid="app-install-prompt"]');
    const storeLinks = Array.from(prompt?.querySelectorAll<HTMLAnchorElement>('a') ?? []);

    expect(prompt?.textContent).toContain('Get the BlitzPay app');
    expect(storeLinks.map((link) => link.href)).toEqual([
      'https://apps.apple.com/us/search?term=BlitzPay',
      'https://play.google.com/store/search?q=BlitzPay&c=apps'
    ]);
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
