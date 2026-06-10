import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { buildApiBaseUrl } from './merchant-environment.service';
import { PlatformKpiReport } from '../platform-kpi-dashboard/platform-kpi-dashboard.models';

@Injectable({ providedIn: 'root' })
export class PlatformKpiService {
  constructor(private readonly http: HttpClient) {}

  getReport(
    environment: BackendEnvironment,
    apiVersion: string,
    from: string,
    to: string,
    merchantId?: string,
  ): Observable<PlatformKpiReport> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (merchantId && merchantId.trim()) {
      params = params.set('merchantId', merchantId.trim());
    }
    return this.http.get<PlatformKpiReport>(
      `${buildApiBaseUrl(environment, apiVersion)}/reporting/dashboard/platform`,
      { params },
    );
  }
}
