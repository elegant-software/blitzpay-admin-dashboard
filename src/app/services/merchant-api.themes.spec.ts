import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MerchantApiService } from './merchant-api.service';
import { getEnvironmentByKey } from './merchant-environment.service';

describe('Merchant theme API', () => {
  let api: MerchantApiService;
  let http: HttpTestingController;
  const environment = getEnvironmentByKey('local');
  const payload = { name: 'Summer', primaryColor: '#123ABC', accentColor: '#FFCC00' };
  const theme = { app: 'SHOPPER' as const, ...payload, id: 'theme', merchantId: 'merchant', primaryTextColor: '#FFFFFF', accentTextColor: '#000000' };
  const base = 'http://localhost:8080/v1/merchants/merchant/themes';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(MerchantApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('loads all palettes for the selected merchant', () => {
    api.getMerchantThemes(environment, 'v1', 'merchant').subscribe(result => expect(result).toEqual([theme]));
    const request = http.expectOne(base);
    expect(request.request.method).toBe('GET');
    request.flush([theme]);
  });
  it('creates a named palette', () => {
    api.createMerchantTheme(environment, 'v1', 'merchant', payload).subscribe(result => expect(result).toEqual(theme));
    const request = http.expectOne(base);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(theme);
  });
  it('updates only the selected theme', () => {
    api.updateMerchantTheme(environment, 'v1', 'merchant', 'theme', payload).subscribe(result => expect(result).toEqual(theme));
    const request = http.expectOne(`${base}/theme`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush(theme);
  });
  it('keeps merchant app requests separate from shopper app requests', () => {
    api.getMerchantThemes(environment, 'v1', 'merchant', 'MERCHANT').subscribe();
    http.expectOne(`${base}?app=MERCHANT`).flush([]);
    api.createMerchantTheme(environment, 'v1', 'merchant', payload, 'MERCHANT').subscribe();
    const create = http.expectOne(`${base}?app=MERCHANT`);
    expect(create.request.body).toEqual(payload);
    create.flush({ ...theme, app: 'MERCHANT' });
    api.updateMerchantTheme(environment, 'v1', 'merchant', 'theme', payload, 'MERCHANT').subscribe();
    const update = http.expectOne(`${base}/theme?app=MERCHANT`);
    expect(update.request.method).toBe('PUT');
    update.flush({ ...theme, app: 'MERCHANT' });
  });
});
