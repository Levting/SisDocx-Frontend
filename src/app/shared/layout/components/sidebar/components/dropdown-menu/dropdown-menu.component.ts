import { SvgIconComponent } from 'angular-svg-icon';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta';
import { CarpetaActualService } from '../../../../../../core/services/carpeta-actual.service';
import { Subject, takeUntil } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Componente que representa el menú desplegable en la barra lateral.
 * Proporciona opciones para crear carpetas y otras acciones.
 */
@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [NgIf, SvgIconComponent, NgClass],
  templateUrl: './dropdown-menu.component.html',
})
export class DropdownMenuComponent implements OnInit, OnDestroy {
  @Input() showSideBar: boolean = true;
  @Input() carpetaActual: Carpeta | null = null;
  @Input() dropdownOpen: boolean = false;

  /** Evento que se emite cuando se alterna el estado del dropdown */
  @Output() toggleDropdown = new EventEmitter<void>();

  @Output() abrirModalCrearCarpeta: EventEmitter<number> =
    new EventEmitter<number>();
  @Output() abrirModalCargaArchivos: EventEmitter<number> =
    new EventEmitter<number>();
  @Output() abrirModalCargaCarpetas: EventEmitter<number> =
    new EventEmitter<number>();

  /** Estado del modal de creación de carpeta */
  public isModalCrearCarpetaOpen: boolean = false;
  /** Carpeta seleccionada para acciones */
  public carpetaSeleccionada: Carpeta | null = null;
  /** Indica si estamos en la página de documentos */
  private enPaginaDocumentos: boolean = false;

  /** Subject para limpiar suscripciones */
  private destroy$ = new Subject<void>();

  // Inyección de servicios
  private carpetaActualService = inject(CarpetaActualService);
  private router = inject(Router);

  /** Estado del modal de carga de archivos */
  public isModalCargaArchivosOpen: boolean = false;
  public isModalCargaCarpetasOpen: boolean = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de ruta para detectar si estamos en la página de documentos
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        // Verificar si estamos en la página de documentos
        this.enPaginaDocumentos = event.url.includes('/documentos');

        // Si salimos de la página de documentos, resetear la carpeta actual a null
        if (!this.enPaginaDocumentos) {
          this.carpetaActual = null;
        }
      });

    // Comprobar la ruta actual durante la inicialización
    this.enPaginaDocumentos = this.router.url.includes('/documentos');
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  obtenerIdCarpetaPadreActual(): number {
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
    return carpetaActual ? carpetaActual.carpetaPadreId : -1; // o null si prefieres
  }

  onCarpetaCreada(): void {
    this.carpetaActualService.notificarRecargarContenido(); // Emitir evento para recargar contenido
    this.isModalCrearCarpetaOpen = false;
    this.toggleDropdown.emit();
  }

  /**
   * Abre el modal de creación de carpeta.
   * Si estamos en la página de inicio, establece la carpeta raíz antes de abrir el modal.
   */
  abrirModalCrearCarpetaHandler(): void {
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
    const carpetaPadreId = carpetaActual ? carpetaActual.elementoId : 1;
    this.abrirModalCrearCarpeta.emit(carpetaPadreId);
    this.toggleDropdown.emit();
  }

  abrirModalCargaArchivosHandler(): void {
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
    const carpetaPadreId = carpetaActual ? carpetaActual.elementoId : 1;
    this.abrirModalCargaArchivos.emit(carpetaPadreId);
    this.toggleDropdown.emit();
  }

  abrirModalCargaCarpetasHandler(): void {
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
    const carpetaPadreId = carpetaActual ? carpetaActual.elementoId : 1;
    this.abrirModalCargaCarpetas.emit(carpetaPadreId);
    this.toggleDropdown.emit();
  }

  /**
   * Cierra el modal de creación de carpeta
   */
  onModalCrearCarpetaCerrar(): void {
    this.isModalCrearCarpetaOpen = false;
  }

  cerrarModalCargaArchivosHandler(): void {
    this.isModalCargaArchivosOpen = false;
  }

  cerrarModalCargaCarpetasHandler(): void {
    this.isModalCargaCarpetasOpen = false;
  }

  // 👇 Detecta clic fuera del componente y cierra el dropdown
  @HostListener('document:click', ['$event.target'])
  public onClickOutside(targetElement: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside && this.dropdownOpen) {
      this.toggleDropdown.emit();
    }
  }
}
