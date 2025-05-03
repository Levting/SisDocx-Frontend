import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { TokenService } from '../services/token.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /* Inyectar el servicio para obtener el token */
  const tokenService: TokenService = inject(TokenService);
  const router: Router = inject(Router);
  const platformId: Object = inject(PLATFORM_ID);

  /* Obtener el token del localStorage */
  const token: string | null = tokenService.getToken();

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  /* Si el token existe, clonar la petición y añadir el token al encabezado */
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          // Limpiar el token y redirigir al login
          tokenService.removeToken();
          router.navigate(['/auth/iniciar-sesion'], {
            queryParams: { returnUrl: router.url },
          });
        }
        return throwError(() => error);
      })
    );
  }
  /* Caso contrario, devolver la petición original */
  return next(req);
};
