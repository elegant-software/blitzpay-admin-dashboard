import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HANDLE_FORBIDDEN_LOCALLY } from '../auth/interceptors/auth.interceptor';
import { BackendEnvironment, KitchenAccessStatus, KitchenLogin } from '../models/merchant-catalog.models';
import { MerchantApiService } from './merchant-api.service';

describe('MerchantApiService Kitchen Screen API', () => {
  let service: MerchantApiService;
  let controller: HttpTestingController;

  const environment: BackendEnvironment = {
    key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201'
  };
  const url = 'http://localhost:8080/v1/merchant/branches/b-1/kitchen';
  const login: KitchenLogin = {
    username: 'kitchen-br-1', password: 's3cret', keycloakUrl: 'https://auth.test', realm: 'blitzpay',
    clientId: 'blitzpay-kitchen', apiBaseUrl: 'https://api.test', branchId: 'b-1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MerchantApiService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MerchantApiService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('loads the Kitchen Login status and handles a 403 itself', () => {
    let result: KitchenAccessStatus | undefined;
    service.getKitchenAccess(environment, 'v1', 'b-1').subscribe((r) => result = r);
    const req = controller.expectOne(url);
    expect(req.request.method).toBe('GET');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush({ enabled: true, username: 'kitchen-br-1' });
    expect(result).toEqual({ enabled: true, username: 'kitchen-br-1' });
  });

  it('enables the Kitchen Screen and returns the Kitchen Login', () => {
    let result: KitchenLogin | undefined;
    service.enableKitchenAccess(environment, 'v1', 'b-1').subscribe((r) => result = r);
    const req = controller.expectOne(`${url}/enable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(login);
    expect(result).toEqual(login);
  });

  it('disables the Kitchen Screen', () => {
    let result: KitchenAccessStatus | undefined;
    service.disableKitchenAccess(environment, 'v1', 'b-1').subscribe((r) => result = r);
    const req = controller.expectOne(`${url}/disable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush({ enabled: false, username: 'kitchen-br-1' });
    expect(result).toEqual({ enabled: false, username: 'kitchen-br-1' });
  });
});
