import { CarpetaActualService } from './../../../../core/services/carpeta-actual.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MenuService } from '../../../../core/services/menu.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarHeaderComponent } from './components/sidebar-header/sidebar-header.component';
import { SidebarNavComponent } from './components/sidebar-nav/sidebar-nav.component';
import { SidebarFooterComponent } from './components/sidebar-footer/sidebar-footer.component';
import { Carpeta } from '../../../../core/models/documentos/carpeta';
import { Subject, takeUntil } from 'rxjs';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { CrearCarpetaModalComponent } from './components/modals/crear-carpeta-modal/crear-carpeta-modal.component';
import { SubirArchivoModalComponent } from './components/modals/subir-archivo-modal/subir-archivo-modal.component';
import { SubirCarpetaModalComponent } from './components/modals/subir-carpeta-modal/subir-carpeta-modal.component';
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
    CrearCarpetaModalComponent,
    SubirArchivoModalComponent,
    SubirCarpetaModalComponent,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  // Inyección de servicios
  protected menuService: MenuService = inject(MenuService);
  private carpetaActualService: CarpetaActualService =
    inject(CarpetaActualService);
  // Definición de variables
  public dropdownOpen: boolean = false;
  public carpetaPadreId: number = 0;
  public isOpenCrearCarpetaModal: boolean = false;
  public isOpenSubirArchivoModal: boolean = false;
  public isOpenSubirCarpetaModal: boolean = false;

  // Indicadores de estado
  private destroy$: Subject<void> = new Subject<void>();

  /**
   * Inicializa el componente
   */
  ngOnInit(): void {
    // Inicializar del dropdown y modal cerrado
    this.dropdownOpen = false;
    this.carpetaPadreId = 0;
    this.isOpenCrearCarpetaModal = false;
    this.isOpenSubirArchivoModal = false;
    this.isOpenSubirCarpetaModal = false;

    // Suscribirse a la carpeta actual para obtener su ID
    this.carpetaActualService.carpetaActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((carpeta: Carpeta | null): void => {
        this.carpetaPadreId = carpeta?.carpetaPadreId || 0;
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
  abrirModalCrearCarpeta(carpetaPadreId: number): void {
    this.carpetaPadreId = carpetaPadreId; // Asignar el ID de la carpeta padre
    console.log('Crear carpeta en carpeta padre con ID:', carpetaPadreId);
    this.isOpenCrearCarpetaModal = true;
  }

  // Modal de subida de archivo
  abrirModalCargaArchivos(carpetaPadreId: number): void {
    this.carpetaPadreId = carpetaPadreId;
    console.log('Subir archivo en carpeta padre con ID:', carpetaPadreId);
    this.isOpenSubirArchivoModal = true;
  }

  // Modal de subida de carpeta
  abrirModalCargaCarpetas(carpetaPadreId: number): void {
    this.carpetaPadreId = carpetaPadreId;
    console.log('Subir carpeta en carpeta padre con ID:', carpetaPadreId);
    this.isOpenSubirCarpetaModal = true;
  }

  // Cerrar modal de creación de carpeta
  cerrarModalCrearCarpeta(): void {
    this.isOpenCrearCarpetaModal = false;
    this.carpetaPadreId = 0;
  }

  // Cerrar modal de subida de archivo
  cerrarModalSubirArchivo(): void {
    this.isOpenSubirArchivoModal = false;
    this.carpetaPadreId = 0;
  }

  // Cerrar modal de subida de carpeta
  cerrarModalSubirCarpeta(): void {
    this.isOpenSubirCarpetaModal = false;
    this.carpetaPadreId = 0;
  }

  // Evento de subida de carpeta
  onCarpetaCreada(): void {
    this.isOpenCrearCarpetaModal = false;
    this.carpetaPadreId = 0;
  }

  // Evento de subida de archivo
  onArchivosSubidos(): void {
    // Este método se llama cuando se inicia la subida de archivos
    console.log('Iniciando subida de archivos...');
  }

  onSubidaCompletada(): void {
    // Este método se llama cuando se completan todas las subidas
    console.log('Subida de archivos completada');
    // Recargar el contenido de la carpeta actual
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
    if (carpetaActual) {
      this.carpetaActualService.notificarRecargarContenido();
    }
  }

  // Evento de subida de carpeta
  onCarpetasSubidas(): void {
    this.isOpenSubirCarpetaModal = false;
    this.carpetaPadreId = 0;
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
