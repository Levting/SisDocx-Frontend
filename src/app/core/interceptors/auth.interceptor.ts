import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { TokenService } from '../services/token.service';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /* Inyectar el servicio para obtener el token */
  const tokenService: TokenService = inject(TokenService);
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
    return next(cloned);
  }
  /* Caso contrario, devolver la petición original */
  return next(req);
};
