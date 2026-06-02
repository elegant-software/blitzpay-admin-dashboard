import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('Web Storefront shell', () => {
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
});
