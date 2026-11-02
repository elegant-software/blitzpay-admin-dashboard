import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  const auth = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'register']);
  const route = {
    snapshot: {
      queryParamMap: convertToParamMap({})
    }
  };

  beforeEach(async () => {
    auth.login.and.resolveTo();
    auth.register.and.resolveTo();
    route.snapshot.queryParamMap = convertToParamMap({});

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: AuthStateService, useValue: { session$: of({}), snapshot: { status: 'anonymous' } } },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();
  });

  it('presents a branded, accessible sign-in page with clear admin context', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('main.auth-page')).not.toBeNull();
    expect(page.querySelector('.auth-story h1')?.textContent).toContain('Run the details');
    expect(page.querySelector('.auth-card h2')?.textContent).toContain('Welcome back');
    expect(page.querySelector('[aria-label="Admin tools"]')).not.toBeNull();
    expect(page.querySelector('button[aria-label="Sign in to the admin dashboard"]')).not.toBeNull();
    expect(page.querySelector('button[aria-label="Create an admin account"]')).not.toBeNull();
  });

  it('announces authentication errors accessibly', () => {
    route.snapshot.queryParamMap = convertToParamMap({ error: 'session-expired' });
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    const error = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(error?.textContent).toContain('Your session expired');
    expect(error?.getAttribute('aria-live')).toBe('assertive');
  });

  it('starts the requested authentication flow from the primary actions', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLButtonElement>('[aria-label="Sign in to the admin dashboard"]')!.click();
    page.querySelector<HTMLButtonElement>('[aria-label="Create an admin account"]')!.click();
    await fixture.whenStable();

    expect(auth.login).toHaveBeenCalledWith('/');
    expect(auth.register).toHaveBeenCalledWith('/');
  });
});
