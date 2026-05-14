import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { MerchantApiService } from '../app/services/merchant-api.service';

// In Bazel (Node.js runner) process.env is populated by the runner.
// In Karma (ChromeHeadless) process is undefined; fall back to the default port.
const contractBaseUrl =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_BASE_URL'] : undefined) ??
  'http://localhost:8089';

interface PaymentRequestResponse {
  paymentRequestId: string;
  paymentId: string;
  resourceToken: string;
  redirectReturnUri: string;
}

describe('MerchantApiService — contract tests', () => {
  let service: MerchantApiService;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MerchantApiService, provideHttpClient()],
    });
    service = TestBed.inject(MerchantApiService);
    http = TestBed.inject(HttpClient);
  });

  it('POST /v1/payments/request returns paymentRequestId', (done) => {
    http.post<PaymentRequestResponse>(
      `${contractBaseUrl}/v1/payments/request`,
      {
        paymentRequestId: null,
        orderId: 'ORDER-123',
        amountMinorUnits: 1099,
        currency: 'EUR',
        userDisplayName: 'Jane Doe',
        userEmail: 'jane.doe@example.com',
        redirectReturnUri: 'https://merchant.example.com/return',
      }
    ).subscribe({
      next: (body) => {
        expect(body.paymentRequestId).toMatch(
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
        );
        expect(body.paymentId).toBeTruthy();
        expect(body.resourceToken).toBeTruthy();
        expect(body.redirectReturnUri).toBe('https://merchant.example.com/return');
        done();
      },
      error: (err) => done.fail(err),
    });
  });
});
