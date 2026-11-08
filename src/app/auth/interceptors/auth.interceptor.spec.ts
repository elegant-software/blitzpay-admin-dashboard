import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthConfigService } from '../services/auth-config.service';
import { AuthService } from '../services/auth.service';
import { authInterceptor, HANDLE_FORBIDDEN_LOCALLY } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['ensureValidToken', 'handleUnauthorizedResponse', 'handleForbiddenResponse']);
    authService.ensureValidToken.and.resolveTo('token');
    authService.handleForbiddenResponse.and.resolveTo();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: AuthConfigService, useValue: { isProtectedApiRequest: () => true } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('requires a bearer token for the admin UI language catalogue', async () => {
    http.get('http://api.test/v1/merchants/menu-languages').subscribe();
    await Promise.resolve();
    await Promise.resolve();
    const request = controller.expectOne('http://api.test/v1/merchants/menu-languages');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token');
    request.flush([]);
  });

  async function forbidden(context?: HttpContext): Promise<void> {
    let failed = false;
    http.get('http://api.test/v1/x', { context }).subscribe({ error: () => failed = true });
    await Promise.resolve();
    await Promise.resolve();
    controller.expectOne('http://api.test/v1/x').flush({ error: 'no' }, { status: 403, statusText: 'Forbidden' });
    expect(failed).toBeTrue();
  }

  it('sends the user to the access-denied page on a 403 by default', async () => {
    await forbidden();
    expect(authService.handleForbiddenResponse).toHaveBeenCalled();
  });

  it('leaves a 403 to the caller when the request handles it locally', async () => {
    await forbidden(new HttpContext().set(HANDLE_FORBIDDEN_LOCALLY, true));
    expect(authService.handleForbiddenResponse).not.toHaveBeenCalled();
  });
});
