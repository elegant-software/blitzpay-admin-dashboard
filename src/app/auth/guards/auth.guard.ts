import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.initialize();
  const session = authService.snapshot;

  if (session.status === 'authenticated' && session.accessResolution === 'authorized') {
    return true;
  }

  if (session.status === 'anonymous') {
    return router.createUrlTree(['/auth/login'], authService.navigationForProtectedRoute(state.url));
  }

  if (session.status === 'error') {
    return router.createUrlTree(['/auth/login'], {
      queryParams: {
        returnUrl: state.url,
        error: session.lastErrorCode ?? 'auth-error'
      }
    });
  }

  return router.createUrlTree(['/auth/access-denied'], {
    queryParams: {
      reason: authService.resolveAccessDeniedReason()
    }
  });
};
