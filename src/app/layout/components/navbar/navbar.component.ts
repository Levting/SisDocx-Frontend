import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DropdownProfileComponent } from './components/dropdown-profile/dropdown-profile.component';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario/usuario.model';

/**
 * Componente que representa la barra de navegación superior de la aplicación.
 * Muestra información del usuario y opciones de navegación.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [DropdownProfileComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  /** Estado de autenticación del usuario */
  userLoginOn: boolean = false;
  /** Usuario autenticado */
  public usuario: Usuario | null = null;

  /** Subject para limpiar suscripciones */
  private destroy$ = new Subject<void>();

  // Inyección de servicios
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  /**
   * Inicializa el componente
   */
  ngOnInit(): void {
    this.authService.userLoginOn.pipe(takeUntil(this.destroy$)).subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
        this.obtenerUsuarioAutenticado();
      },
    });
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cierra la sesión del usuario y redirige a la página de inicio de sesión
   */
  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['auth/iniciar-sesion']);
  }

  /**
   * Obtiene el usuario autenticado
   */
  obtenerUsuarioAutenticado() {
    this.usuario = this.authService.obtenerUsuarioAutenticado();
  }
}
