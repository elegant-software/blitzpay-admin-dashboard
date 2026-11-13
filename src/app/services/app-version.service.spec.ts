import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from '../auth/interceptors/auth.interceptor';
import { AuthService } from '../auth/services/auth.service';
import { AuthConfigService } from '../auth/services/auth-config.service';
import { AppVersionService, readDashboardVersion } from './app-version.service';

describe('AppVersionService', () => {
  let service: AppVersionService;
  let controller: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['ensureValidToken', 'handleUnauthorizedResponse', 'handleForbiddenResponse']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: AuthConfigService, useValue: { isProtectedApiRequest: () => true } }
      ]
    });
    service = TestBed.inject(AppVersionService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('reads the dashboard version from the runtime config and shows "dev" without one', () => {
    expect(readDashboardVersion({ version: 'v2.26.0' })).toBe('v2.26.0');
    expect(readDashboardVersion({ version: '  ' })).toBe('dev');
    expect(readDashboardVersion({})).toBe('dev');
  });

  it('reads the backend version from the public actuator info endpoint without a token', () => {
    let version: string | undefined;
    service.backendVersion$.subscribe((v) => version = v);

    const request = controller.expectOne((req) => req.url.endsWith('/actuator/info'));
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ build: { version: 'v2.26.0', time: '2026-11-13T10:00:00Z' } });

    expect(version).toBe('v2.26.0');
    expect(authService.ensureValidToken).not.toHaveBeenCalled();
  });

  it('shows "unknown" when the backend cannot be reached', () => {
    let version: string | undefined;
    service.backendVersion$.subscribe((v) => version = v);

    controller.expectOne((req) => req.url.endsWith('/actuator/info'))
      .flush('down', { status: 503, statusText: 'Service Unavailable' });

    expect(version).toBe('unknown');
    expect(authService.handleUnauthorizedResponse).not.toHaveBeenCalled();
  });
});
