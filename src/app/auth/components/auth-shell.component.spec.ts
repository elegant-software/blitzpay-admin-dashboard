import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthShellComponent } from './auth-shell.component';

describe('AuthShellComponent', () => {
  let fixture: ComponentFixture<AuthShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthShellComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthShellComponent);
    fixture.detectChanges();
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
    const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('button'));
    const logoutBtn = buttons.find(btn => btn.textContent?.trim().includes('Logout'));
    expect(logoutBtn).toBeDefined();
  });
});
