import { CarpetaActualService } from './../../../core/services/carpeta-actual.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MenuService } from '../../../core/services/menu.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarHeaderComponent } from './components/sidebar-header/sidebar-header.component';
import { SidebarNavComponent } from './components/sidebar-nav/sidebar-nav.component';
import { SidebarFooterComponent } from './components/sidebar-footer/sidebar-footer.component';
import { Carpeta } from '../../../core/models/documentos/carpeta.model';
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

    // Suscribirse a los cambios de la carpeta actual
    this.carpetaActualService.carpetaActual$.subscribe((carpeta) => {
      if (carpeta) {
        this.carpetaPadreId = carpeta.elementoId;
      }
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
    // Asegurarse de que siempre tengamos un ID válido
    console.log('Abriendo modal crear carpeta abierto en ', carpetaPadreId);
    this.isOpenCrearCarpetaModal = true;
  }

  // Modal de subida de archivo
  abrirModalCargaArchivos(carpetaPadreId: number): void {
    // Asegurarse de que siempre tengamos un ID válido
    this.carpetaPadreId = carpetaPadreId;
    console.log(
      'Abriendo modal subir archivos en carpeta padre:',
      this.carpetaPadreId
    );
    this.isOpenSubirArchivoModal = true;
  }

  // Modal de subida de carpeta
  abrirModalCargaCarpetas(carpetaPadreId: number): void {
    // Asegurarse de que siempre tengamos un ID válido
    this.carpetaPadreId = carpetaPadreId;
    console.log(
      'Abriendo modal subir carpetas en carpeta padre:',
      this.carpetaPadreId
    );
    this.isOpenSubirCarpetaModal = true;
  }

  // Cerrar modal de creación de carpeta
  cerrarModalCrearCarpeta(): void {
    this.isOpenCrearCarpetaModal = false;
  }

  // Cerrar modal de subida de archivo
  cerrarModalSubirArchivo(): void {
    this.isOpenSubirArchivoModal = false;
  }

  // Cerrar modal de subida de carpeta
  cerrarModalSubirCarpeta(): void {
    this.isOpenSubirCarpetaModal = false;
  }

  // Evento de subida de carpeta
  onCarpetaCreada(): void {
    this.isOpenCrearCarpetaModal = false;
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
      this.carpetaActualService.notificarRecargarContenido(
        carpetaActual.elementoId
      );
    }
  }

  // Evento de subida de carpeta
  onCarpetasSubidas(): void {
    this.isOpenSubirCarpetaModal = false;
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
