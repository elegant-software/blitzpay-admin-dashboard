import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MerchantApiService } from '../services/merchant-api.service';
import { BackendEnvironment } from '../models/merchant-catalog.models';

describe('White-label API', () => {
  const env: BackendEnvironment = {key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: ''};
  let api: MerchantApiService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    api = TestBed.inject(MerchantApiService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('loads a merchant app configuration', () => {
    api.getWhiteLabel(env, 'v1', 'm', '', 'KITCHEN').subscribe(value => expect(value.revision).toBe(4));
    const req = http.expectOne('http://localhost:8080/v1/merchants/m/white-label?app=KITCHEN');
    expect(req.request.method).toBe('GET'); req.flush({revision: 4});
  });
  it('publishes a branch configuration with optimistic revision', () => {
    const body = {settings: {hiddenFeatures: []}, revision: 4};
    api.saveWhiteLabel(env, 'v1', 'm', 'b', 'STOREFRONT', body).subscribe(value => expect(value.revision).toBe(5));
    const req = http.expectOne('http://localhost:8080/v1/merchants/m/branches/b/white-label?app=STOREFRONT');
    expect(req.request.method).toBe('PUT'); expect(req.request.body).toEqual(body); req.flush({revision: 5});
  });
  it('loads the app scoped theme library', () => {
    api.listWhiteLabelThemes(env, 'v1', 'm', 'MERCHANT').subscribe(value => expect(value.length).toBe(0));
    const req = http.expectOne('http://localhost:8080/v1/merchants/m/themes?app=MERCHANT');
    expect(req.request.method).toBe('GET'); req.flush([]);
  });
  it('saves named light and dark palettes', () => {
    const body: any = {name: 'North', primaryColor: '#000000', accentColor: '#FFFFFF'};
    api.createWhiteLabelTheme(env, 'v1', 'm', 'SHOPPER', body).subscribe(value => expect(value.name).toBe('North'));
    const req = http.expectOne('http://localhost:8080/v1/merchants/m/themes?app=SHOPPER');
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual(body); req.flush({name: 'North'});
  });
  it('requests a scope isolated logo upload', () => {
    api.createWhiteLabelLogoUpload(env, 'v1', 'm', 'b', 'image/png').subscribe(value => expect(value.storageKey).toBe('key'));
    const req = http.expectOne('http://localhost:8080/v1/merchants/m/branches/b/white-label/logo/upload-url');
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual({contentType: 'image/png'}); req.flush({storageKey: 'key'});
  });
});
