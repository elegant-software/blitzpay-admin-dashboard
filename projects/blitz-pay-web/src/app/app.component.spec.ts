import { StorefrontUiService } from './services/storefront-ui.service';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { NotificationService } from './notifications/notification.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('Web Storefront shell', () => {
  it('links the legal notice and privacy policy on every page', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([]), provideHttpClient()] }).compileComponents();
    spyOn(TestBed.inject(StorefrontUiService), 'load').and.stub();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('[data-testid="legal-footer"] a') as NodeListOf<HTMLAnchorElement>)
      .map(a => a.getAttribute('href'));
    expect(hrefs).toEqual([environment.imprintUrl, environment.privacyUrl]);
  });

  it('mounts the global toast host and shows action feedback', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], providers: [provideRouter([]), provideHttpClient(), provideNoopAnimations()]
    }).compileComponents();
    spyOn(TestBed.inject(StorefrontUiService), 'load').and.stub();
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

  it('keeps the header language control available without a sticky download promotion', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([]), provideHttpClient()] }).compileComponents();
    spyOn(TestBed.inject(StorefrontUiService), 'load').and.stub();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="app-install-prompt"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('header web-language-switcher')).not.toBeNull();
    expect(document.documentElement.style.getPropertyValue('--storefront-download-height')).toBe('');
  });
  it('exposes an accessible header theme toggle', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([]), provideHttpClient()] }).compileComponents();
    spyOn(TestBed.inject(StorefrontUiService), 'load').and.stub();
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
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    spyOn(TestBed.inject(StorefrontUiService), 'load').and.stub();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="pwa-install-notice"]')).toBeNull();

    const prompt = jasmine.createSpy('prompt').and.resolveTo();
    dispatchInstallPrompt(prompt);
    fixture.detectChanges();

    const notice: HTMLElement = fixture.nativeElement.querySelector('[data-testid="pwa-install-notice"]');
    expect(notice.textContent).toContain('Install this storefront');
    expect(fixture.nativeElement.querySelector('[data-testid="app-install-prompt"]')).toBeNull();

    const installButton = notice.querySelector<HTMLButtonElement>('[data-testid="pwa-install-button"]');
    installButton?.click();
    expect(prompt).toHaveBeenCalledTimes(1);

    notice.querySelector<HTMLButtonElement>('[data-testid="pwa-install-dismiss"]')?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="pwa-install-notice"]')).toBeNull();
  });
});
