import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MerchantApiService } from './merchant-api.service';
import { BackendEnvironment } from '../models/merchant-catalog.models';

describe('Branch preparation configuration API', () => {
  const environment: BackendEnvironment = { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201' };
  let api: MerchantApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(MerchantApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('loads and saves routing under the selected merchant and branch', () => {
    const configuration = { stations: [{ id: 'food', name: 'Food Kitchen' }], categoryDefaults: { burgers: 'food' }, productOverrides: {} };
    api.getPreparationConfiguration(environment, 'v1', 'merchant', 'branch').subscribe(result => expect(result).toEqual(configuration));
    http.expectOne('http://localhost:8080/v1/merchants/merchant/branches/branch/preparation-configuration').flush(configuration);
    api.savePreparationConfiguration(environment, 'v1', 'merchant', 'branch', configuration).subscribe();
    const request = http.expectOne('http://localhost:8080/v1/merchants/merchant/branches/branch/preparation-configuration');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(configuration);
    request.flush(configuration);
  });
});
