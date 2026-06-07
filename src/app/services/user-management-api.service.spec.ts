import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { CreateAssignmentRequest, MerchantUserAssignment, UserSearchResult } from '../models/user-management.models';
import { UserManagementApiService } from './user-management-api.service';

describe('UserManagementApiService', () => {
  let service: UserManagementApiService;
  let http: HttpTestingController;

  const env: BackendEnvironment = { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: '' };
  const apiVersion = 'v1';
  const userId = 'user-uuid-123';
  const assignmentId = 'assignment-uuid-456';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserManagementApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserManagementApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('searchUsers calls GET /user-management/users with q param', () => {
    const results: UserSearchResult[] = [{ id: 'kc-1', displayName: 'Alice', email: 'alice@example.com', enabled: true }];
    service.searchUsers(env, apiVersion, 'alice').subscribe(r => expect(r).toEqual(results));
    const req = http.expectOne('http://localhost:8080/v1/user-management/users?q=alice');
    expect(req.request.method).toBe('GET');
    req.flush(results);
  });

  it('getAssignments calls GET /user-management/users/:id/assignments', () => {
    const assignments: MerchantUserAssignment[] = [{
      id: assignmentId, merchantId: 'm-1', merchantName: 'Test', branchId: null,
      branchName: null, role: 'MERCHANT_MANAGER', employeeId: null
    }];
    service.getAssignments(env, apiVersion, userId).subscribe(r => expect(r).toEqual(assignments));
    const req = http.expectOne(`http://localhost:8080/v1/user-management/users/${userId}/assignments`);
    expect(req.request.method).toBe('GET');
    req.flush(assignments);
  });

  it('createAssignment calls POST /user-management/users/:id/assignments', () => {
    const request: CreateAssignmentRequest = { merchantId: 'm-1', branchId: null, role: 'MERCHANT_MANAGER', employeeId: null };
    const created: MerchantUserAssignment = { id: assignmentId, merchantId: 'm-1', merchantName: 'Test', branchId: null, branchName: null, role: 'MERCHANT_MANAGER', employeeId: null };
    service.createAssignment(env, apiVersion, userId, request).subscribe(r => expect(r).toEqual(created));
    const req = http.expectOne(`http://localhost:8080/v1/user-management/users/${userId}/assignments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(created);
  });

  it('revokeAssignment calls DELETE /user-management/users/:id/assignments/:assignmentId', () => {
    service.revokeAssignment(env, apiVersion, userId, assignmentId).subscribe();
    const req = http.expectOne(`http://localhost:8080/v1/user-management/users/${userId}/assignments/${assignmentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
