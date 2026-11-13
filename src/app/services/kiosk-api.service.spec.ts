import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HANDLE_FORBIDDEN_LOCALLY } from '../auth/interceptors/auth.interceptor';
import { BackendEnvironment, Kiosk, KioskLogin, KioskSettings } from '../models/merchant-catalog.models';
import { KioskApiService } from './kiosk-api.service';

describe('KioskApiService', () => {
  let service: KioskApiService;
  let controller: HttpTestingController;

  const environment: BackendEnvironment = {
    key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201'
  };
  const branchUrl = 'http://localhost:8080/v1/merchant/branches/b-1';
  const kiosksUrl = `${branchUrl}/kiosks`;
  const settings: KioskSettings = { paymentChoices: ['CARD', 'CASH'], resetSeconds: 45, languages: ['de'], advertisedProductIds: ['p-1'] };
  const login: KioskLogin = {
    kioskId: 'k-1', name: 'Front', username: 'kiosk-br-1-1', password: 's3cret', keycloakUrl: 'http://kc', realm: 'blitzpay',
    clientId: 'kiosk', apiBaseUrl: 'http://api', branchId: 'b-1',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(KioskApiService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('lists the Kiosks and handles a 403 itself', () => {
    const kiosks: Kiosk[] = [{ id: 'k-1', number: 1, name: 'Front', username: 'kiosk-br-1-1', enabled: true }];
    let result: Kiosk[] | undefined;
    service.listKiosks(environment, 'v1', 'b-1').subscribe((r) => result = r);
    const req = controller.expectOne(kiosksUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(kiosks);
    expect(result).toEqual(kiosks);
  });

  it('adds a Kiosk with a trimmed name and returns the Kiosk Login once', () => {
    let result: KioskLogin | undefined;
    service.addKiosk(environment, 'v1', 'b-1', '  Front  ').subscribe((r) => result = r);
    const req = controller.expectOne(kiosksUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Front' });
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(login, { status: 201, statusText: 'Created' });
    expect(result).toEqual(login);
  });

  it('adds a Kiosk without a name when the name is blank', () => {
    service.addKiosk(environment, 'v1', 'b-1', '   ').subscribe();
    const req = controller.expectOne(kiosksUrl);
    expect(req.request.body).toEqual({});
    req.flush(login, { status: 201, statusText: 'Created' });
  });

  it('enables (or resets) one Kiosk and returns its Kiosk Login once', () => {
    let result: KioskLogin | undefined;
    service.enableKiosk(environment, 'v1', 'b-1', 'k-1').subscribe((r) => result = r);
    const req = controller.expectOne(`${kiosksUrl}/k-1/enable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(login);
    expect(result).toEqual(login);
  });

  it('disables one Kiosk', () => {
    const disabled: Kiosk = { id: 'k-1', number: 1, name: 'Front', username: 'kiosk-br-1-1', enabled: false };
    let result: Kiosk | undefined;
    service.disableKiosk(environment, 'v1', 'b-1', 'k-1').subscribe((r) => result = r);
    const req = controller.expectOne(`${kiosksUrl}/k-1/disable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(disabled);
    expect(result).toEqual(disabled);
  });

  it('removes one Kiosk with DELETE', () => {
    service.removeKiosk(environment, 'v1', 'b-1', 'k-1').subscribe();
    const req = controller.expectOne(`${kiosksUrl}/k-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('loads the shared Kiosk Settings', () => {
    let result: KioskSettings | undefined;
    service.getSettings(environment, 'v1', 'b-1').subscribe((r) => result = r);
    const req = controller.expectOne(`${branchUrl}/kiosk/settings`);
    expect(req.request.method).toBe('GET');
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(settings);
    expect(result).toEqual(settings);
  });

  it('saves the shared Kiosk Settings with PUT', () => {
    service.saveSettings(environment, 'v1', 'b-1', settings).subscribe();
    const req = controller.expectOne(`${branchUrl}/kiosk/settings`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(settings);
    expect(req.request.context.get(HANDLE_FORBIDDEN_LOCALLY)).toBeTrue();
    req.flush(settings);
  });
});
