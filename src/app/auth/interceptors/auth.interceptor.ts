import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthConfigService } from '../services/auth-config.service';
import { AuthService } from '../services/auth.service';

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
      } else if (error instanceof HttpErrorResponse && error.status === 403) {
        void authService.handleForbiddenResponse();
      }

      return throwError(() => error);
    })
  );
};
