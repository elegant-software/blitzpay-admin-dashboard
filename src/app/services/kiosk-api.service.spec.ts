import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HANDLE_FORBIDDEN_LOCALLY } from '../auth/interceptors/auth.interceptor';
import { BackendEnvironment, KioskAccessStatus, KioskLogin, KioskSettings } from '../models/merchant-catalog.models';
import { KioskApiService } from './kiosk-api.service';

describe('KioskApiService', () => {
  let service: KioskApiService;
  let controller: HttpTestingController;

  const environment: BackendEnvironment = {
    key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201'
  };
  const url = 'http://localhost:8080/v1/merchant/branches/b-1/kiosk';
  const settings: KioskSettings = { paymentChoices: ['CARD', 'CASH'], resetSeconds: 45, languages: ['de'], advertisedProductIds: ['p-1'] };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(KioskApiService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('loads status and settings and handles a 403 itself', () => {
    const status: KioskAccessStatus = { enabled: true, login: 'kiosk-br-1', settings };
    let result: KioskAccessStatus | undefined;
    service.getKiosk(environment, 'v1', 'b-1').subscribe((r) => result = r);
    const req = controller.expectOne(url);
    expect(req.request.method).toBe('GET');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(status);
    expect(result).toEqual(status);
  });

  it('enables (or resets) and returns the Kiosk Login once', () => {
    const login: KioskLogin = { login: 'kiosk-br-1', password: 's3cret' };
    let result: KioskLogin | undefined;
    service.enableKiosk(environment, 'v1', 'b-1').subscribe((r) => result = r);
    const req = controller.expectOne(`${url}/enable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(login);
    expect(result).toEqual(login);
  });

  it('disables the Kiosk', () => {
    service.disableKiosk(environment, 'v1', 'b-1').subscribe();
    const req = controller.expectOne(`${url}/disable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(null);
  });

  it('saves settings with PUT', () => {
    service.saveSettings(environment, 'v1', 'b-1', settings).subscribe();
    const req = controller.expectOne(`${url}/settings`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(settings);
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(null);
  });
});
