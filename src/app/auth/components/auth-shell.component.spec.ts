import { provideHttpClient } from '@angular/common/http';
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
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthShellComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('zackpay-admin-theme');
    document.documentElement.removeAttribute('data-coreui-theme');
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
});
