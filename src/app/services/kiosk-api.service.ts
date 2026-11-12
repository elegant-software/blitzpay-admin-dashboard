import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HANDLE_FORBIDDEN_LOCALLY } from '../auth/interceptors/auth.interceptor';
import { BackendEnvironment, KioskAccessStatus, KioskLogin, KioskSettings } from '../models/merchant-catalog.models';
import { buildApiBaseUrl } from './merchant-environment.service';

/** Every Kiosk endpoint of the backend contract lives here. A 403 (not a Merchant Manager) is handled by the caller. */
@Injectable({ providedIn: 'root' })
export class KioskApiService {
  private readonly http = inject(HttpClient);

  getKiosk(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<KioskAccessStatus> {
    return this.http.get<KioskAccessStatus>(this.url(environment, apiVersion, branchId), { context: this.context() });
  }

  /** Enables the Kiosk, or resets its Kiosk Login password when already enabled. Returns the new password once. */
  enableKiosk(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<KioskLogin> {
    return this.http.post<KioskLogin>(`${this.url(environment, apiVersion, branchId)}/enable`, {}, { context: this.context() });
  }

  disableKiosk(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<void> {
    return this.http.post<void>(`${this.url(environment, apiVersion, branchId)}/disable`, {}, { context: this.context() });
  }

  saveSettings(environment: BackendEnvironment, apiVersion: string, branchId: string, settings: KioskSettings): Observable<void> {
    return this.http.put<void>(`${this.url(environment, apiVersion, branchId)}/settings`, settings, { context: this.context() });
  }

  private url(environment: BackendEnvironment, apiVersion: string, branchId: string): string {
    return `${buildApiBaseUrl(environment, apiVersion)}/merchant/branches/${encodeURIComponent(branchId)}/kiosk`;
  }

  private context(): HttpContext {
    return new HttpContext().set(HANDLE_FORBIDDEN_LOCALLY, true);
  }
}
