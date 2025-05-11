import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';
import { UserService } from './user.service';
import { map } from 'rxjs/operators';

/**
 * Servicio encargado de manejar la lógica de roles de usuario en la aplicación.
 * Proporciona métodos para verificar roles y mantener el estado del usuario actual.
 */
@Injectable({
  providedIn: 'root',
})
export class RoleService {
  /**
   * BehaviorSubject que mantiene el estado del usuario actual.
   * Se actualiza automáticamente cuando el usuario autenticado cambia.
   */
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);

  /**
   * Observable público que emite el usuario actual.
   * Los componentes pueden suscribirse a este observable para reaccionar a cambios en el usuario.
   */
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private userService: UserService) {
    // Suscribirse a los cambios del usuario autenticado para mantener el estado actualizado
    this.userService.usuarioAutenticado$.subscribe((user) => {
      this.currentUserSubject.next(user);
    });
  }

  /**
   * Verifica si el usuario actual tiene un rol específico.
   * @param roleName - Nombre del rol a verificar
   * @returns true si el usuario tiene el rol especificado
   */
  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.getValue();
    return user?.rol?.nombre === roleName;
  }

  /**
   * Verifica si el usuario actual tiene alguno de los roles especificados.
   * @param roles - Array de nombres de roles a verificar
   * @returns true si el usuario tiene al menos uno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  }

  /**
   * Verifica si el usuario actual es administrador.
   * @returns true si el usuario tiene el rol de Administrador
   */
  isAdmin(): boolean {
    return this.hasRole('Administrador');
  }

  /**
   * Verifica si el usuario actual es personal.
   * @returns true si el usuario tiene el rol de Personal
   */
  isPersonal(): boolean {
    return this.hasRole('Personal');
  }

  /**
   * Obtiene el nombre del rol del usuario actual.
   * @returns Nombre del rol del usuario o cadena vacía si no hay usuario
   */
  getUserRole(): string {
    return this.currentUserSubject.getValue()?.rol?.nombre || '';
  }

  /**
   * Obtiene el nombre de la provincia del usuario actual.
   * @returns Nombre de la provincia del usuario o cadena vacía si no hay usuario
   */
  getUserProvince(): string {
    return this.currentUserSubject.getValue()?.provincia?.nombre || '';
  }

  /**
   * Observable que emite true si el usuario actual es administrador.
   * Útil para suscribirse a cambios en el rol de administrador.
   * @returns Observable<boolean>
   */
  isAdmin$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map((user) => user?.rol?.nombre === 'Administrador')
    );
  }

  /**
   * Observable que emite true si el usuario actual es personal.
   * Útil para suscribirse a cambios en el rol de personal.
   * @returns Observable<boolean>
   */
  isPersonal$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map((user) => user?.rol?.nombre === 'Personal')
    );
  }

  /**
   * Observable que emite true si el usuario actual tiene alguno de los roles especificados.
   * Útil para suscribirse a cambios en los roles del usuario.
   * @param roles - Array de nombres de roles a verificar
   * @returns Observable<boolean>
   */
  hasAnyRole$(roles: string[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map((user) => roles.includes(user?.rol?.nombre || ''))
    );
  }
}
