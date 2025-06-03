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
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(), // Para que funcione el router en el servidor
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorInterceptorInterceptor,
        loadingInterceptor,
      ])
    ),
    // Proveedor de iconos
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAngularSvgIcon(),
    provideAnimations(), // required for toastr
    provideToastr({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
      enableHtml: true,
      newestOnTop: true,
      tapToDismiss: true,
      extendedTimeOut: 1000,
      easeTime: 300,
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning',
      },
    }),
  ],
};
