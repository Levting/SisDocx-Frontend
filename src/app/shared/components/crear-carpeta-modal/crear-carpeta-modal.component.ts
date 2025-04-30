import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Carpeta } from '../../../core/models/documentos/carpeta';
import { CarpetaService } from '../../../core/services/carpeta.service';
import { CarpetaActualService } from '../../../core/services/carpeta-actual.service';
import { ApiError } from '../../../core/models/errors/apiError';
import { ElementoService } from '../../../core/services/elemento.service';
import { CrearCarpetaRequest } from '../../../core/models/documentos/crearCarpetaRequest';

/**
 * Componente que representa el modal para crear una nueva carpeta.
 * Permite al usuario ingresar el nombre de la carpeta y crearla en la ubicación actual.
 *
 */
@Component({
  selector: 'app-crear-carpeta-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-carpeta-modal.component.html',
})
export class CrearCarpetaModalComponent implements OnInit, OnDestroy {
  /** Indica si el modal está abierto */
  @Input() isOpen: boolean = false;
  @Input() carpetaPadreId: number = 0;

  /** Evento que se emite cuando se cierra el modal */
  @Output() close = new EventEmitter<void>();
  /** Evento que se emite cuando se crea una carpeta exitosamente */
  @Output() carpetaCreada = new EventEmitter<Carpeta>();

  /** Nombre de la carpeta a crear */
  public nombreCarpeta: string = '';
  /** Carpeta actual seleccionada */
  public carpetaActual: Carpeta | null = null;

  // Indicadores de estado
  public isLoading: boolean = false;
  public errorMessage: string | null = null;

  /** Longitud máxima permitida para el nombre de la carpeta */
  private readonly MAX_NOMBRE_LENGTH = 100;
  /** Longitud mínima permitida para el nombre de la carpeta */
  private readonly MIN_NOMBRE_LENGTH = 1;

  /** Subject para limpiar suscripciones */
  private destroy$ = new Subject<void>();

  // Inyección de servicios
  private elementoService = inject(ElementoService);
  private carpetaService = inject(CarpetaService);
  private carpetaActualService = inject(CarpetaActualService);
  private router = inject(Router);

  /**
   * Inicializa el componente y configura las suscripciones necesarias
   */
  ngOnInit(): void {
    this.setupSubscriptions();
  }

  /**
   * Configura las suscripciones a los servicios
   * @private
   */
  private setupSubscriptions(): void {
    this.carpetaActualService.carpetaActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((carpeta) => {
        this.carpetaActual = carpeta;
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
   * Cierra el modal y resetea el estado
   */
  onClose(): void {
    this.close.emit();
    this.resetState();
  }

  /**
   * Resetea el estado del componente
   * @private
   */
  private resetState(): void {
    this.nombreCarpeta = '';
    this.errorMessage = null;
    this.isLoading = false;
  }

  /**
   * Valida el nombre de la carpeta
   * @param nombre Nombre a validar
   * @returns Mensaje de error si la validación falla, null si es válido
   * @private
   */
  private validarNombreCarpeta(nombre: string): string | null {
    const nombreTrimmed = nombre.trim();

    if (!nombreTrimmed) {
      return 'El nombre de la carpeta no puede estar vacío';
    }

    if (nombreTrimmed.length < this.MIN_NOMBRE_LENGTH) {
      return 'El nombre de la carpeta es demasiado corto';
    }

    if (nombreTrimmed.length > this.MAX_NOMBRE_LENGTH) {
      return `El nombre de la carpeta no puede exceder los ${this.MAX_NOMBRE_LENGTH} caracteres`;
    }

    // Validar caracteres especiales
    const caracteresEspeciales = /[<>:"/\\|?*]/;
    if (caracteresEspeciales.test(nombreTrimmed)) {
      return 'El nombre de la carpeta no puede contener caracteres especiales (< > : " / \\ | ? *)';
    }

    return null;
  }

  /**
   * Maneja la confirmación de creación de carpeta
   */
  onConfirm(): void {
    const errorValidacion = this.validarNombreCarpeta(this.nombreCarpeta);
    if (errorValidacion) {
      this.errorMessage = errorValidacion;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Usar el carpetaPadreId recibido como input si está disponible
    // De lo contrario, obtenerlo del servicio
    const carpetaPadreId = this.carpetaPadreId > 0
      ? this.carpetaPadreId
      : (this.carpetaActualService.obtenerCarpetaActual()?.elementoId || 1);

    const crearCarpetaRequest: CrearCarpetaRequest = {
      nombre: this.nombreCarpeta,
      carpetaPadreId: carpetaPadreId,
    };

    this.elementoService
      .crearCarpeta(crearCarpetaRequest)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (carpetaCreada: Carpeta) => {
          this.carpetaCreada.emit(carpetaCreada);

          // Emitir un evento para recargar el contenido de la carpeta actual
          this.carpetaActualService.recargarContenidoActual();

          // Notificar al servicio de carpetas que debe recargar el contenido
          this.carpetaService.notificarRecargarContenido(carpetaPadreId);

          this.onClose();
        },
        error: (error : ApiError) => {
          console.error('Error al crear la carpeta:', error);
          this.errorMessage = this.obtenerMensajeError(error);
        },
      });
  }

  /**
   * Obtiene un mensaje de error amigable basado en el error recibido
   * @param error Error recibido del servicio
   * @returns Mensaje de error formateado
   * @private
   */
  private obtenerMensajeError(error: any): string {
    if (error.status === 409) {
      return 'Ya existe una carpeta con ese nombre en esta ubicación';
    }
    if (error.status === 403) {
      return 'No tienes permisos para crear carpetas en esta ubicación';
    }
    return 'Ocurrió un error al crear la carpeta. Por favor, inténtelo de nuevo.';
  }
}
