import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CarpetaActualService } from '../../core/services/carpeta-actual.service';

/**
 * Componente principal de layout que organiza la estructura de la aplicación.
 * Incluye la barra lateral, la barra de navegación superior y el contenido principal.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, OnDestroy {
  // Inyección de servicios
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private carpetaActualService = inject(CarpetaActualService);

  // Subject para limpieza de suscripciones
  private destroy$ = new Subject<void>();

  /**
   * Inicializa el componente y configura escuchadores
   */
  ngOnInit(): void {
    // Si no hay token, redirigir al login
    if (!this.tokenService.getToken()) {
      this.router.navigate(['/auth/iniciar-sesion']);
    }

    // Escuchar cambios de ruta para reiniciar la carpeta actual cuando se sale de documentos
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        // Si la ruta NO incluye 'documentos', reiniciar la carpeta actual
        if (!event.url.includes('/documentos')) {
          this.carpetaActualService.reiniciarCarpetaActual();
        }
      });
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
