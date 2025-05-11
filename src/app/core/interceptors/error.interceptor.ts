import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { Router } from '@angular/router';

export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Si es un error 401 (Unauthorized), redirigir al login
      if (error.status === 401) {
        logger.warn(
          'Sesión expirada o no autorizada. Redirigiendo a inicio de sesión.'
        );
        router.navigate(['/auth/iniciar-sesion']);
      }

      // Si es un error 403 (Forbidden), mostrar mensaje de permisos
      if (error.status === 403) {
        logger.error('No tienes permisos para acceder a este recurso');
      }

      // Si es un error de conexión
      if (error.status === 0) {
        logger.error('Error de conexión: No se pudo conectar con el servidor');
      }

      // Para otros errores, mostrar el mensaje específico
      if (error.error?.message) {
        logger.error('Error en la petición:', error.error.message);
      } else {
        logger.error(
          'Error en la petición:',
          error.message || 'Error desconocido'
        );
      }

      return throwError(() => error);
    })
  );
};
