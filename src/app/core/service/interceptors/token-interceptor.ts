import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth';
import { catchError, switchMap, throwError } from 'rxjs';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If token expired or unauthorized
      if (error.status === 401) {
        console.warn('⚠️ Access token expired, attempting to refresh...');

        return auth.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = auth.getToken();
            if (newToken) {
              console.log('✅ Retrying request with new token:', newToken);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(retryReq);
            }
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            console.error('❌ Refresh failed, logging out user.');
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
