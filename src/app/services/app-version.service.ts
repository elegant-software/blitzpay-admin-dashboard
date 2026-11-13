import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { RuntimeConfig, runtimeConfig } from '../../environments/runtime-config';
import { SKIP_AUTH } from '../auth/interceptors/auth.interceptor';
import { getEnvironmentByKey } from './merchant-environment.service';

interface ActuatorInfo {
  build?: { version?: string; time?: string };
}

/** The release tag the deploy wrote into config.js (docker/write-config.sh); "dev" when run locally. */
export function readDashboardVersion(config: Pick<RuntimeConfig, 'version'>): string {
  return config.version?.trim() || 'dev';
}

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  private readonly http = inject(HttpClient);

  readonly dashboardVersion = readDashboardVersion(runtimeConfig);

  /** Backend release from its public `GET /actuator/info`; "unknown" when it cannot be read. */
  readonly backendVersion$: Observable<string> = this.http
    .get<ActuatorInfo>(`${getEnvironmentByKey(environment.defaultEnvironmentKey).baseUrl}/actuator/info`, {
      context: new HttpContext().set(SKIP_AUTH, true)
    })
    .pipe(
      map((info) => info?.build?.version?.trim() || 'unknown'),
      catchError(() => of('unknown')),
      shareReplay(1)
    );
}
