import { CarpetaService } from './../../../../core/services/carpeta.service';
import { CarpetaActualService } from './../../../../core/services/carpeta-actual.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MenuService } from '../../../../core/services/menu.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarHeaderComponent } from './sidebar-header/sidebar-header.component';
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';
import { SidebarFooterComponent } from './sidebar-footer/sidebar-footer.component';
import { Carpeta } from '../../../../core/models/documentos/carpeta';
import { Subject, takeUntil } from 'rxjs';
import { DropdownMenuComponent } from './dropdown-menu/dropdown-menu.component';
import { SidebarModalCrearCarpetaComponent } from './crear-carpeta/sidebar-modal-crear-carpeta.component';

/**
 * Componente que representa la barra lateral de la aplicación.
 * Gestiona la visualización de la navegación y el estado del sidebar.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    RouterModule,
    FormsModule,
    SidebarHeaderComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    DropdownMenuComponent,
    SidebarModalCrearCarpetaComponent,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  // Inyección de servicios
  protected menuService: MenuService = inject(MenuService);
  private carpetaService: CarpetaService = inject(CarpetaService);
  private carpetaActualService: CarpetaActualService =
    inject(CarpetaActualService);
  private router: Router = inject(Router);

  // Definición de variables
  public dropdownOpen: boolean = false;
  public isOpenCrearCarpetaModal: boolean = false;
  public carpetaActual: Carpeta | null = null;
  public carpetaPadreIdParaCrear: number = 0;

  // Indicadores de estado
  private destroy$: Subject<void> = new Subject<void>();

  /**
   * Inicializa el componente
   */
  ngOnInit(): void {
    // Inicializar del dropdown y modal cerrado
    this.dropdownOpen = false;
    this.isOpenCrearCarpetaModal = false;

    // Suscribirse a la carpeta actual para obtener su ID
    this.carpetaActualService.carpetaActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((carpeta: Carpeta | null): void => {
        this.carpetaActual = carpeta;
      });
  }

  /**
   * Alterna el estado del sidebar
   */
  public toggleSidebar(): void {
    this.menuService.toggleSidebar();
    // Cerrar el dropdown cuando se colapsa el sidebar
    if (!this.menuService.showSideBar) {
      this.dropdownOpen = false;
    }
  }

  /**
   * Alterna el estado del dropdown
   */
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Modal de creación de carpeta
  abrirModalDesdeDropdown(carpetaPadreId: number): void {
    this.carpetaPadreIdParaCrear = carpetaPadreId; // Asignar el ID de la carpeta padre
    console.log('Crear carpeta en carpeta padre con ID:', carpetaPadreId);
    this.isOpenCrearCarpetaModal = true; // Abrir el modal
  }

  cerrarModalDesdeDropdown(): void {
    this.isOpenCrearCarpetaModal = false;
  }

  onCarpetaCreada(carpeta: Carpeta): void {
    this.cerrarModalDesdeDropdown();
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
