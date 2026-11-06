import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MerchantApiService } from './merchant-api.service';
import { BackendEnvironment } from '../models/merchant-catalog.models';

describe('Merchant branding API', () => {
  let api: MerchantApiService;
  let http: HttpTestingController;
  const env: BackendEnvironment = { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080/', storefrontUrl: '' };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(MerchantApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('reads merchant settings and resolved branding', () => {
    api.getBranding(env, 'v1', 'm').subscribe(value => expect(value.effective.platformName).toBe('Simpleio'));
    const request = http.expectOne('http://localhost:8080/v1/merchants/m/branding');
    expect(request.request.method).toBe('GET');
    request.flush({ settings: {}, effective: { platformName: 'Simpleio' } });
  });
  it('replaces the complete branch settings including null resets', () => {
    const settings = { enabled: null, displayName: null, logoStorageKey: null, primaryColor: '#123456', accentColor: null };
    api.saveBranding(env, 'v1', 'm', settings, 'b').subscribe(value => expect(value.settings).toEqual(settings));
    const request = http.expectOne('http://localhost:8080/v1/merchants/m/branches/b/branding');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(settings);
    request.flush({ settings, effective: {} });
  });
  it('creates a scope-specific branding logo upload', () => {
    api.createBrandingLogoUpload(env, 'v1', 'm', 'image/png', 'b').subscribe(value => expect(value.storageKey).toBe('scoped-logo'));
    const request = http.expectOne('http://localhost:8080/v1/merchants/m/branches/b/branding/logo/upload-url');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ contentType: 'image/png' });
    request.flush({ storageKey: 'scoped-logo', uploadUrl: 'https://upload.example', expiresAt: '' });
  });
});
