import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthShellComponent } from './auth-shell.component';

describe('AuthShellComponent', () => {
  let fixture: ComponentFixture<AuthShellComponent>;

  beforeEach(async () => {
    localStorage.removeItem('zackpay-admin-theme');
    document.documentElement.removeAttribute('data-coreui-theme');

    await TestBed.configureTestingModule({
      imports: [AuthShellComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthShellComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    const http = TestBed.inject(HttpTestingController);
    http.match((req) => req.url.endsWith('/actuator/info'));
    http.verify();
    localStorage.removeItem('blitzpay.admin-language');
    localStorage.removeItem('zackpay-admin-theme');
    document.documentElement.removeAttribute('data-coreui-theme');
  });

  it('offers the selector in the top header and translates navigation into Arabic', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('header app-language-selector button')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('[role="menuitemradio"] [lang="ar"]')!.closest('button')!.click();
    fixture.detectChanges();
    expect(element.querySelector('.nav-label')?.textContent).toBe('لوحة التحكم');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    fixture.destroy();
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('keeps RTL navigation visible on the right across mobile and desktop widths', () => {
    const element = fixture.nativeElement as HTMLElement;
    const frame = document.createElement('iframe');
    frame.style.width = '390px';
    document.body.appendChild(frame);
    try {
      const doc = frame.contentDocument!;
      doc.documentElement.dir = 'rtl';
      doc.documentElement.lang = 'ar';
      const style = doc.createElement('style');
      style.textContent = Array.from(document.styleSheets)
        .flatMap(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText)).join('\n') +
        '\n* { transition: none !important; }';
      doc.head.appendChild(style);
      doc.body.appendChild(element.querySelector('.app-layout')!.cloneNode(true));
      const sidebar = doc.querySelector<HTMLElement>('#sidebar')!;
      const main = doc.querySelector<HTMLElement>('.app-main')!;
      // Fixed-position elements use the viewport, including the scrollbar gutter.
      const width = () => frame.contentWindow!.innerWidth;
      expect(sidebar.getBoundingClientRect().left).toBeGreaterThanOrEqual(width());
      sidebar.classList.add('sidebar-narrow');
      expect(sidebar.getBoundingClientRect().right).toBe(width());
      expect(sidebar.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
      expect(frame.contentWindow!.getComputedStyle(doc.body).fontFamily).toContain('Cairo');
      frame.style.width = '1200px';
      sidebar.classList.remove('sidebar-narrow');
      expect(sidebar.getBoundingClientRect().right).toBe(width());
      expect(frame.contentWindow!.getComputedStyle(main).marginRight).toBe('256px');
      sidebar.classList.add('sidebar-narrow'); main.classList.add('app-main-collapsed');
      expect(sidebar.getBoundingClientRect().width).toBe(64);
      expect(frame.contentWindow!.getComputedStyle(main).marginRight).toBe('64px');
      doc.documentElement.dir = 'ltr';
      expect(sidebar.getBoundingClientRect().left).toBe(0);
      expect(frame.contentWindow!.getComputedStyle(main).marginRight).toBe('0px');
    } finally { frame.remove(); }
  });

  it('shows the dashboard and backend versions in the footer', () => {
    TestBed.inject(HttpTestingController).expectOne((req) => req.url.endsWith('/actuator/info'))
      .flush({ build: { version: 'v2.26.0' } });
    fixture.detectChanges();
    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer [data-testid="app-version"]');
    expect(footer?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Dashboard dev · API v2.26.0');
  });

  it('renders sidebar navigation links for all main sections', () => {
    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('.sidebar-nav .nav-link'));
    const texts = links.map(l => l.textContent?.replace(/\s+/g, ' ').trim() ?? '');
    expect(texts.some(t => t.includes('Dashboard'))).toBeTrue();
    expect(texts.some(t => t.includes('Merchants'))).toBeTrue();
    expect(texts.some(t => t.includes('Appointments'))).toBeTrue();
    expect(texts.some(t => t.includes('Settlements'))).toBeTrue();
  });

  it('renders a logout button in the topbar', () => {
    const element = fixture.nativeElement as HTMLElement;
    const logoutButton = element.querySelector<HTMLButtonElement>('.header-logout');
    expect(logoutButton?.getAttribute('aria-label')).toBe('Log out');
    expect(logoutButton?.textContent?.trim()).toBe('');
    expect(logoutButton?.querySelector('svg')).not.toBeNull();
  });

  it('switches between light and dark themes and persists the selection', () => {
    const element = fixture.nativeElement as HTMLElement;
    const themeButton = element.querySelector<HTMLButtonElement>('.theme-toggle');

    expect(document.documentElement.getAttribute('data-coreui-theme')).toBe('light');
    expect(themeButton?.getAttribute('aria-label')).toBe('Switch to dark mode');

    themeButton?.click();
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-coreui-theme')).toBe('dark');
    expect(localStorage.getItem('zackpay-admin-theme')).toBe('dark');
    expect(themeButton?.getAttribute('aria-label')).toBe('Switch to light mode');
  });

  it('restores a previously selected theme', async () => {
    localStorage.setItem('zackpay-admin-theme', 'dark');
    fixture.destroy();
    fixture = TestBed.createComponent(AuthShellComponent);
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-coreui-theme')).toBe('dark');
    expect(fixture.nativeElement.querySelector('.theme-toggle')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('exposes sidebar collapse state and link labels accessibly', () => {
    const element = fixture.nativeElement as HTMLElement;
    const sidebar = element.querySelector<HTMLElement>('#sidebar');
    const collapseButton = element.querySelector<HTMLButtonElement>('.sidebar-fold-toggle');

    expect(collapseButton?.getAttribute('aria-controls')).toBe('sidebar');
    expect(collapseButton?.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('.nav-link[aria-label="Dashboard"]')).not.toBeNull();
    expect(element.querySelector('.merchant-live-badge')).not.toBeNull();

    collapseButton?.click();
    fixture.detectChanges();

    expect(sidebar?.classList.contains('sidebar-narrow')).toBeTrue();
    expect(collapseButton?.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.merchant-live-badge')).toBeNull();
  });

  it('uses theme-aware styling hooks for the header', () => {
    const element = fixture.nativeElement as HTMLElement;
    const topbar = element.querySelector<HTMLElement>('.app-topbar-inner');
    const brand = element.querySelector<HTMLElement>('.topbar-brand');
    const lightBackground = getComputedStyle(topbar!).backgroundColor;
    const lightText = getComputedStyle(brand!).color;

    element.querySelector<HTMLButtonElement>('.theme-toggle')?.click();
    fixture.detectChanges();

    expect(getComputedStyle(topbar!).backgroundColor).not.toBe(lightBackground);
    expect(getComputedStyle(brand!).color).not.toBe(lightText);
  });

  it('opens the sidebar within a mobile viewport instead of leaving it offscreen', () => {
    const element = fixture.nativeElement as HTMLElement;
    const frame = document.createElement('iframe');
    frame.style.width = '390px';
    document.body.appendChild(frame);
    try {
      const frameDocument = frame.contentDocument!;
      const style = frameDocument.createElement('style');
      style.textContent = Array.from(document.styleSheets)
        .flatMap(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText)).join('\n') +
        '\n* { transition: none !important; }';
      frameDocument.head.appendChild(style);
      element.querySelector<HTMLButtonElement>('.header-toggle')!.click();
      fixture.detectChanges();
      frameDocument.body.appendChild(element.querySelector('#sidebar')!.cloneNode(true));
      const sidebar = frameDocument.querySelector<HTMLElement>('#sidebar')!;
      expect(sidebar.getBoundingClientRect().left).toBe(0);
      expect(sidebar.getBoundingClientRect().right).toBeGreaterThan(0);
      const link = sidebar.querySelector<HTMLAnchorElement>('.nav-link')!;
      expect(link.getAttribute('href')).toBe('/dashboard');
      expect(frame.contentWindow!.getComputedStyle(link).display).not.toBe('none');
      expect(frame.contentWindow!.getComputedStyle(link.querySelector('.nav-label')!).display).not.toBe('none');

      sidebar.classList.remove('sidebar-narrow');
      expect(sidebar.getBoundingClientRect().right).toBeLessThanOrEqual(0);
      frame.style.width = '1200px';
      expect(sidebar.getBoundingClientRect().left).toBe(0);
      sidebar.classList.add('sidebar-narrow');
      expect(sidebar.getBoundingClientRect().width).toBe(64);
      frame.style.width = '390px';
      expect(sidebar.getBoundingClientRect().left).toBe(0);
    } finally {
      frame.remove();
    }
  });

  it('dismisses mobile navigation using the toggle, backdrop, Escape, or a navigation link', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('.header-toggle')!;
    const open = () => {
      toggle.click();
      fixture.detectChanges();
      expect(element.querySelector('.sidebar-backdrop')).not.toBeNull();
    };
    const expectClosed = () => {
      fixture.detectChanges();
      expect(element.querySelector('.sidebar-backdrop')).toBeNull();
    };
    open();
    toggle.click();
    expectClosed();
    open();
    element.querySelector<HTMLButtonElement>('.sidebar-backdrop')!.click();
    expectClosed();
    open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expectClosed();
    open();
    element.querySelector<HTMLAnchorElement>('.nav-link')!.dispatchEvent(new MouseEvent('click', { button: 1 }));
    expectClosed();
  });
});
