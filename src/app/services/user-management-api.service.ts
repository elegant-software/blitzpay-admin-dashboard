import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateAssignmentRequest, MerchantUserAssignment, UserSearchResult } from '../models/user-management.models';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { buildApiBaseUrl } from './merchant-environment.service';

@Injectable({ providedIn: 'root' })
export class UserManagementApiService {
  constructor(private readonly http: HttpClient) {}

  searchUsers(environment: BackendEnvironment, apiVersion: string, query: string): Observable<UserSearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<UserSearchResult[]>(`${this.base(environment, apiVersion)}/user-management/users`, { params });
  }

  getAssignments(environment: BackendEnvironment, apiVersion: string, userId: string): Observable<MerchantUserAssignment[]> {
    return this.http.get<MerchantUserAssignment[]>(`${this.base(environment, apiVersion)}/user-management/users/${userId}/assignments`);
  }

  createAssignment(
    environment: BackendEnvironment,
    apiVersion: string,
    userId: string,
    request: CreateAssignmentRequest
  ): Observable<MerchantUserAssignment> {
    return this.http.post<MerchantUserAssignment>(
      `${this.base(environment, apiVersion)}/user-management/users/${userId}/assignments`,
      request
    );
  }

  revokeAssignment(
    environment: BackendEnvironment,
    apiVersion: string,
    userId: string,
    assignmentId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.base(environment, apiVersion)}/user-management/users/${userId}/assignments/${assignmentId}`
    );
  }

  private base(environment: BackendEnvironment, apiVersion: string): string {
    return buildApiBaseUrl(environment, apiVersion);
  }
}
