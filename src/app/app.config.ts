import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptorInterceptor } from './core/interceptors/error.interceptor';
import { provideAngularSvgIcon } from 'angular-svg-icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(), // Para que funcione el router en el servidor
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptorInterceptor])
    ),
    // Proveedor de iconos
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAngularSvgIcon()
  ],
};
