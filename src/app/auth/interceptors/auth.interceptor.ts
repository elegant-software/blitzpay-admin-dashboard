import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthConfigService } from '../services/auth-config.service';
import { AuthService } from '../services/auth.service';

/**
 * Set on a request whose 403 the caller shows itself (e.g. a Merchant Manager-only action on a page any admin can open).
 * Without it, a 403 sends the whole app to the access-denied page.
 */
export const HANDLE_FORBIDDEN_LOCALLY = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authConfig = inject(AuthConfigService);
  const authService = inject(AuthService);

  if (!authConfig.isProtectedApiRequest(req.url)) {
    return next(req);
  }

  return from(authService.ensureValidToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return throwError(() => new HttpErrorResponse({
          status: 401,
          statusText: 'Authentication required',
          url: req.url
        }));
      }

      return next(req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }));
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        void authService.handleUnauthorizedResponse();
      } else if (error instanceof HttpErrorResponse && error.status === 403 && !req.context.get(HANDLE_FORBIDDEN_LOCALLY)) {
        void authService.handleForbiddenResponse();
      }

      return throwError(() => error);
    })
  );
};
