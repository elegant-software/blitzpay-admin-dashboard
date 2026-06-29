import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Merchant, MerchantLocation, MerchantLogoUploadResponse } from '../app/models/merchant-catalog.models';

const contractBaseUrl =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_BASE_URL'] : undefined) ??
  'http://localhost:8089';

const merchantId =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_MERCHANT_ID'] : undefined) ??
  '11111111-1111-4111-8111-111111111111';

describe('Merchant API — contract tests', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    http = TestBed.inject(HttpClient);
  });

  it('GET /v1/merchants/{merchantId} returns required Merchant fields', (done) => {
    http.get<Merchant>(`${contractBaseUrl}/v1/merchants/${merchantId}`).subscribe({
      next: (body) => {
        expect(body.merchantId).toBeTruthy();
        expect(body.merchantStatus).toBeTruthy();
        expect(body.lastUpdatedAt).toBeTruthy();
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('PUT /v1/merchants/{merchantId} accepts UpdateMerchantRequest and returns Merchant', (done) => {
    http
      .put<Merchant>(`${contractBaseUrl}/v1/merchants/${merchantId}`, {
        contactInfo: {
          email: 'contact@test.example',
          phoneNumber: '+49123456789',
        },
      })
      .subscribe({
        next: (body) => {
          expect(body.merchantId).toBeTruthy();
          expect(body.merchantStatus).toBeTruthy();
          expect(body.lastUpdatedAt).toBeTruthy();
          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it('GET /v1/merchants/{merchantId}/location returns required MerchantLocation fields', (done) => {
    http.get<MerchantLocation>(`${contractBaseUrl}/v1/merchants/${merchantId}/location`).subscribe({
      next: (body) => {
        expect(body.merchantId).toBeTruthy();
        expect(typeof body.latitude).toBe('number');
        expect(typeof body.longitude).toBe('number');
        expect(typeof body.geofenceRadiusMeters).toBe('number');
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('PUT /v1/merchants/{merchantId}/location saves and returns MerchantLocation', (done) => {
    http
      .put<MerchantLocation>(`${contractBaseUrl}/v1/merchants/${merchantId}/location`, {
        latitude: 52.52,
        longitude: 13.405,
        geofenceRadiusMeters: 100,
      })
      .subscribe({
        next: (body) => {
          expect(body.merchantId).toBeTruthy();
          expect(typeof body.latitude).toBe('number');
          expect(typeof body.longitude).toBe('number');
          expect(typeof body.geofenceRadiusMeters).toBe('number');
          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it('DELETE /v1/merchants/{merchantId}/location returns 204', (done) => {
    http.delete<void>(`${contractBaseUrl}/v1/merchants/${merchantId}/location`).subscribe({
      next: () => done(),
      error: (err) => done.fail(err),
    });
  });

  it('PUT /v1/merchants/{merchantId}/logo accepts storageKey and returns Merchant', (done) => {
    http
      .put<Merchant>(`${contractBaseUrl}/v1/merchants/${merchantId}/logo`, {
        storageKey: `merchants/${merchantId}/logo.png`,
      })
      .subscribe({
        next: (body) => {
          expect(body.merchantId).toBeTruthy();
          expect(body.lastUpdatedAt).toBeTruthy();
          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it('POST /v1/merchants/{merchantId}/logo/upload-url returns MerchantLogoUploadResponse', (done) => {
    http
      .post<MerchantLogoUploadResponse>(
        `${contractBaseUrl}/v1/merchants/${merchantId}/logo/upload-url`,
        { contentType: 'image/png' }
      )
      .subscribe({
        next: (body) => {
          expect(body.storageKey).toBeTruthy();
          expect(body.uploadUrl).toBeTruthy();
          expect(body.expiresAt).toBeTruthy();
          done();
        },
        error: (err) => done.fail(err),
      });
  });
});
