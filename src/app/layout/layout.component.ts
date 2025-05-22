import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TokenService } from '../core/services/token.service';
import { Subject } from 'rxjs';
import { CarpetaActualService } from '../core/services/carpeta-actual.service';
import { ElementoService } from '../core/services/elemento.service';
import { Carpeta } from '../core/models/documentos/carpeta.model';
import { filter, takeUntil } from 'rxjs/operators';
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
  private elementoService: ElementoService = inject(ElementoService);

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

    // Obtener la carpeta raíz al iniciar
    this.obtenerCarpetaRaiz();

    // Suscribirse a los cambios de ruta
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        if (event.url === '/documentos') {
          this.obtenerCarpetaRaiz();
        }
      });
  }

  private obtenerCarpetaRaiz(): void {
    this.elementoService.obtenerRaiz().subscribe({
      next: (carpetaRaiz) => {
        this.carpetaActualService.actualizarCarpetaActual(
          carpetaRaiz.carpetaRaiz as Carpeta
        );
      },
      error: (error) => {
        console.error('Error al obtener carpeta raíz:', error);
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
}
