import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { buildApiBaseUrl } from './merchant-environment.service';
import {
  SettlementPageResponse,
  SettlementRefreshResult,
  SettlementSummaryResponse,
} from '../settlements/settlement-reporting.models';

@Injectable({ providedIn: 'root' })
export class SettlementReportingService {
  constructor(private readonly http: HttpClient) {}

  getSummary(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    from: string,
    to: string,
  ): Observable<SettlementSummaryResponse> {
    const params = new HttpParams()
      .set('merchantId', merchantId)
      .set('from', from)
      .set('to', to);
    return this.http.get<SettlementSummaryResponse>(
      `${buildApiBaseUrl(environment, apiVersion)}/reporting/settlements/summary`,
      { params },
    );
  }

  getList(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    from: string,
    to: string,
    page: number,
    size: number,
  ): Observable<SettlementPageResponse> {
    const params = new HttpParams()
      .set('merchantId', merchantId)
      .set('from', from)
      .set('to', to)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SettlementPageResponse>(
      `${buildApiBaseUrl(environment, apiVersion)}/reporting/settlements`,
      { params },
    );
  }

  refreshVisible(
    environment: BackendEnvironment,
    apiVersion: string,
    merchantId: string,
    paymentRequestIds: string[],
  ): Observable<SettlementRefreshResult> {
    return this.http.post<SettlementRefreshResult>(
      `${buildApiBaseUrl(environment, apiVersion)}/reporting/settlements/refresh`,
      {
        merchantId,
        paymentRequestIds,
      },
    );
  }
}
