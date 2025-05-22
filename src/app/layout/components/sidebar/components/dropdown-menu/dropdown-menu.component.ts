import { ElementoService } from './../../../../../core/services/elemento.service';
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
import { Subject, takeUntil } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { Carpeta } from '../../../../../core/models/documentos/carpeta.model';
import { CarpetaActualService } from '../../../../../core/services/carpeta-actual.service';

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

  public isModalCrearCarpetaOpen: boolean = false;
  public carpetaSeleccionada: Carpeta | null = null;
  private enPaginaDocumentos: boolean = false;
  private rutaActual: string = '';
  private carpetaRaiz: Carpeta | null = null;

  /** Subject para limpiar suscripciones */
  private destroy$ = new Subject<void>();

  // Inyección de servicios
  private carpetaActualService = inject(CarpetaActualService);
  private router = inject(Router);
  private elementoService = inject(ElementoService);

  /** Estado del modal de carga de archivos */
  public isModalCargaArchivosOpen: boolean = false;
  public isModalCargaCarpetasOpen: boolean = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.carpetaActualService.obtenerCarpetaActual();
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCarpetaCreada(): void {
    // Emitir evento para recargar contenido
    this.carpetaActualService.notificarRecargarContenido(
      this.carpetaRaiz!.elementoId
    );
    this.isModalCrearCarpetaOpen = false;
    this.toggleDropdown.emit();
  }

  /**
   * Determina el ID de la carpeta padre basado en la ruta actual
   */
  private obtenerCarpetaPadreId(): number {
    // Si estamos en documentos, usar la carpeta actual
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();

    // Si la carpeta padre de la carpeta actual es 0, estamos en la raíz
    if (carpetaActual?.carpetaPadreId !== null) {
      console.log('Carpeta actual:', carpetaActual);
      return carpetaActual?.carpetaPadreId || 0;
    } else {
      console.log('No se obtubo la carpeta actual, cambiando a raíz');
      return 0;
    }
  }

  /**
   * Abre el modal de creación de carpeta.
   * Si estamos en la página de inicio, establece la carpeta raíz antes de abrir el modal.
   */
  abrirModalCrearCarpetaHandler(): void {
    const carpetaPadreId = this.obtenerCarpetaPadreId();
    this.abrirModalCrearCarpeta.emit(carpetaPadreId);
    this.toggleDropdown.emit();
  }

  abrirModalCargaArchivosHandler(): void {
    const carpetaPadreId = this.obtenerCarpetaPadreId();
    this.abrirModalCargaArchivos.emit(carpetaPadreId);
    this.toggleDropdown.emit();
  }

  abrirModalCargaCarpetasHandler(): void {
    const carpetaPadreId = this.obtenerCarpetaPadreId();
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
