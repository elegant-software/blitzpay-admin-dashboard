import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Branch } from '../app/models/merchant-catalog.models';

const contractBaseUrl =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_BASE_URL'] : undefined) ??
  'http://localhost:8089';

const merchantId =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_MERCHANT_ID'] : undefined) ??
  'test-merchant-id';

const branchId =
  (typeof process !== 'undefined' ? process.env['CONTRACT_TEST_BRANCH_ID'] : undefined) ??
  'test-branch-id';

const branchesUrl = `${contractBaseUrl}/v1/merchants/${merchantId}/branches`;

function assertBranchShape(branch: Branch): void {
  expect(branch.merchantId).toBeTruthy();
  expect(branch.name).toBeTruthy();
}

describe('Branch API — contract tests', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    http = TestBed.inject(HttpClient);
  });

  it('GET /v1/merchants/{merchantId}/branches returns an array of Branch', (done) => {
    http.get<Branch[]>(branchesUrl).subscribe({
      next: (body) => {
        expect(Array.isArray(body)).toBe(true);
        if (body.length > 0) {
          assertBranchShape(body[0]);
        }
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('POST /v1/merchants/{merchantId}/branches creates and returns a Branch', (done) => {
    http
      .post<Branch>(branchesUrl, {
        name: 'Contract Test Branch',
        addressLine1: '1 Test Street',
        city: 'Berlin',
        country: 'DE',
      })
      .subscribe({
        next: (body) => {
          assertBranchShape(body);
          expect(body.name).toBe('Contract Test Branch');
          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it('GET /v1/merchants/{merchantId}/branches/{branchId} returns a single Branch', (done) => {
    http.get<Branch>(`${branchesUrl}/${branchId}`).subscribe({
      next: (body) => {
        assertBranchShape(body);
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('PUT /v1/merchants/{merchantId}/branches/{branchId} updates and returns the Branch', (done) => {
    http
      .put<Branch>(`${branchesUrl}/${branchId}`, {
        name: 'Updated Contract Branch',
        active: true,
        activePaymentChannels: ['CARD'],
      })
      .subscribe({
        next: (body) => {
          assertBranchShape(body);
          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it('DELETE /v1/merchants/{merchantId}/branches/{branchId} returns 204', (done) => {
    http.delete<void>(`${branchesUrl}/${branchId}`).subscribe({
      next: () => done(),
      error: (err) => done.fail(err),
    });
  });
});
