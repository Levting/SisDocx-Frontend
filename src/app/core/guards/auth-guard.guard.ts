import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

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
  ): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true; // Permitir la renderización en el servidor
    }

    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/auth/iniciar-sesion'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    return true;
  }
}
