import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const authGuard = (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const session = authService.snapshot;
    if (session.status === 'authenticated' && session.accessResolution === 'authorized') {
        return true;
    }
    if (session.status === 'anonymous') {
        return router.createUrlTree(['/auth/login'], authService.navigationForProtectedRoute(state.url));
    }
    if (session.status === 'initializing') {
        return false;
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
