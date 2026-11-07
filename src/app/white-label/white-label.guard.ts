import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { EnvironmentKey } from '../models/merchant-catalog.models';
import { environment } from '../../environments/environment';

/** Isolated merchant entry point. The backend checks the manager's assignment; admin routes keep authGuard. */
export const merchantWhiteLabelGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const api = inject(MerchantApiService);
  const router = inject(Router);
  const login = () => router.createUrlTree(['/auth/login'], auth.navigationForProtectedRoute(state.url));
  try {
    await auth.initialize();
    if (!await auth.ensureValidToken()) return login();
    const env = getEnvironmentByKey((route.queryParamMap.get('environment') as EnvironmentKey) || environment.defaultEnvironmentKey);
    await firstValueFrom(api.getWhiteLabel(env, 'v1', route.paramMap.get('id') ?? '', '', 'SHOPPER'));
    return true;
  } catch (error: any) {
    if (error?.status === 401) return login();
    if (error?.status === 403 || error?.status === 404) return router.createUrlTree(['/auth/access-denied'], {queryParams: {reason: 'role-missing'}});
    // Fail closed when merchant authorization cannot be verified.
    return router.createUrlTree(['/auth/access-denied'], {queryParams: {reason: 'provider-error'}});
  }
};
