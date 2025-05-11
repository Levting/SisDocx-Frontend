import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleService } from '../services/role.service';

/**
 * Guard que protege las rutas basándose en los roles del usuario.
 * Implementa la interfaz CanActivate de Angular para controlar el acceso a las rutas.
 *
 * Uso:
 * En las rutas, añadir el guard y especificar los roles permitidos:
 * {
 *   path: 'ruta-protegida',
 *   component: MiComponente,
 *   canActivate: [RoleGuard],
 *   data: { roles: ['Administrador', 'Personal'] }
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private roleService: RoleService, private router: Router) {}

  /**
   * Método que se ejecuta antes de activar una ruta.
   * Verifica si el usuario actual tiene los roles necesarios para acceder a la ruta.
   *
   * @param route - Snapshot de la ruta que se intenta activar
   * @returns true si el usuario tiene permiso, false en caso contrario
   */
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Obtener los roles requeridos de la configuración de la ruta
    const requiredRoles = route.data['roles'] as string[];

    // Obtener el rol actual del usuario
    const userRole = this.roleService.getUserRole();

    // Verificar si el usuario tiene uno de los roles requeridos
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // Si el usuario no tiene los roles requeridos, redirigir al inicio
    this.router.navigate(['/']);
    return false;
  }
}
