import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HANDLE_FORBIDDEN_LOCALLY } from '../auth/interceptors/auth.interceptor';
import { BackendEnvironment, Kiosk, KioskLogin, KioskSettings } from '../models/merchant-catalog.models';
import { buildApiBaseUrl } from './merchant-environment.service';

/** Every Kiosk endpoint of the backend contract lives here. A 403 (not a Merchant Manager) is handled by the caller. */
@Injectable({ providedIn: 'root' })
export class KioskApiService {
  private readonly http = inject(HttpClient);

  /** The Branch's Kiosks, ordered by number. Never contains passwords. */
  listKiosks(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<Kiosk[]> {
    return this.http.get<Kiosk[]>(this.kiosksUrl(environment, apiVersion, branchId), { context: this.context() });
  }

  /** Adds a Kiosk with its own Kiosk Login. A blank name lets the backend name it "Kiosk <number>". Returns the password once. */
  addKiosk(environment: BackendEnvironment, apiVersion: string, branchId: string, name?: string): Observable<KioskLogin> {
    const trimmed = name?.trim();
    return this.http.post<KioskLogin>(this.kiosksUrl(environment, apiVersion, branchId), trimmed ? { name: trimmed } : {}, { context: this.context() });
  }

  /** Re-enables a disabled Kiosk, or resets the password of an enabled one. Returns the new password once. */
  enableKiosk(environment: BackendEnvironment, apiVersion: string, branchId: string, kioskId: string): Observable<KioskLogin> {
    return this.http.post<KioskLogin>(`${this.kioskUrl(environment, apiVersion, branchId, kioskId)}/enable`, {}, { context: this.context() });
  }

  /** Disables a Kiosk and revokes its sessions. */
  disableKiosk(environment: BackendEnvironment, apiVersion: string, branchId: string, kioskId: string): Observable<Kiosk> {
    return this.http.post<Kiosk>(`${this.kioskUrl(environment, apiVersion, branchId, kioskId)}/disable`, {}, { context: this.context() });
  }

  /** Removes a Kiosk and its Kiosk Login. */
  removeKiosk(environment: BackendEnvironment, apiVersion: string, branchId: string, kioskId: string): Observable<void> {
    return this.http.delete<void>(this.kioskUrl(environment, apiVersion, branchId, kioskId), { context: this.context() });
  }

  getSettings(environment: BackendEnvironment, apiVersion: string, branchId: string): Observable<KioskSettings> {
    return this.http.get<KioskSettings>(this.settingsUrl(environment, apiVersion, branchId), { context: this.context() });
  }

  saveSettings(environment: BackendEnvironment, apiVersion: string, branchId: string, settings: KioskSettings): Observable<KioskSettings> {
    return this.http.put<KioskSettings>(this.settingsUrl(environment, apiVersion, branchId), settings, { context: this.context() });
  }

  private branchUrl(environment: BackendEnvironment, apiVersion: string, branchId: string): string {
    return `${buildApiBaseUrl(environment, apiVersion)}/merchant/branches/${encodeURIComponent(branchId)}`;
  }

  private kiosksUrl(environment: BackendEnvironment, apiVersion: string, branchId: string): string {
    return `${this.branchUrl(environment, apiVersion, branchId)}/kiosks`;
  }

  private kioskUrl(environment: BackendEnvironment, apiVersion: string, branchId: string, kioskId: string): string {
    return `${this.kiosksUrl(environment, apiVersion, branchId)}/${encodeURIComponent(kioskId)}`;
  }

  private settingsUrl(environment: BackendEnvironment, apiVersion: string, branchId: string): string {
    return `${this.branchUrl(environment, apiVersion, branchId)}/kiosk/settings`;
  }

  private context(): HttpContext {
    return new HttpContext().set(HANDLE_FORBIDDEN_LOCALLY, true);
  }
}
