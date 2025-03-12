import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch} from '@angular/common/http';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {errorInterceptorInterceptor} from './core/interceptors/error-interceptor.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    {provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useValue: errorInterceptorInterceptor, multi: true}
  ]
};
