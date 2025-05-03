import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId: Object = inject(PLATFORM_ID);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    return this.authService.verificarAutenticacion().pipe(
      map((esValido) => {
        if (!esValido) {
          this.router.navigate(['/auth/iniciar-sesion'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/auth/iniciar-sesion'], {
          queryParams: { returnUrl: state.url },
        });
        return of(false);
      })
    );
  }
}
