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
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CarpetaActualService } from '../../../../../../core/services/carpeta-actual.service';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta.model';
import { ElementoService } from '../../../../../../core/services/elemento.service';
import { CrearCarpetaRequest } from '../../../../../../core/models/documentos/crear-carpeta-request.model';
import { ApiError } from '../../../../../../core/models/errors/api-error.model';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { Elemento } from '../../../../../../core/models/documentos/elemento.model';

@Component({
  selector: 'app-crear-carpeta-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-carpeta-modal.component.html',
})
export class CrearCarpetaModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() carpetaPadreId: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() carpetaCreada = new EventEmitter<void>();

  public carpetaActual: Carpeta | null = null;
  public nombreCarpeta: string = '';
  public isLoading: boolean = false;
  public errorMessage: string | null = null;
  private carpetaRaiz: Elemento | null = null;

  private readonly MAX_NOMBRE_LENGTH = 100;
  private readonly MIN_NOMBRE_LENGTH = 1;

  private destroy$ = new Subject<void>();

  private elementoService = inject(ElementoService);
  private carpetaActualService = inject(CarpetaActualService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.setupSubscriptions();
    this.obtenerCarpetaRaiz();
  }

  private setupSubscriptions(): void {
    this.carpetaActualService.carpetaActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((carpeta) => {
        this.carpetaActual = carpeta;
      });
  }

  private obtenerCarpetaRaiz(): void {
    this.elementoService
      .obtenerRaiz()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ carpetaRaiz }) => {
          this.carpetaRaiz = carpetaRaiz;
        },
        error: (error: ApiError) => {
          console.error('Error al obtener carpeta raíz:', error.message);
          this.errorMessage = error.message;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.close.emit();
    this.resetState();
  }

  private resetState(): void {
    this.errorMessage = null;
    this.isLoading = false;
    this.nombreCarpeta = '';
  }

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

    const caracteresEspeciales = /[<>:"/\\|?*]/;
    if (caracteresEspeciales.test(nombreTrimmed)) {
      return 'El nombre de la carpeta no puede contener caracteres especiales (< > : " / \\ | ? *)';
    }

    return null;
  }

  onSubmit(): void {
    const errorValidacion = this.validarNombreCarpeta(this.nombreCarpeta);
    if (errorValidacion) {
      this.errorMessage = errorValidacion;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Obtener la carpeta actual del servicio
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();

    // Si no hay carpeta actual, usar la carpeta raíz del usuario
    if (!carpetaActual) {
      if (!this.carpetaRaiz) {
        this.errorMessage =
          'No se pudo obtener la carpeta raíz. Por favor, intente nuevamente.';
        this.isLoading = false;
        return;
      }

      const crearCarpetaRequest: CrearCarpetaRequest = {
        nombre: this.nombreCarpeta,
        carpetaPadreId: this.carpetaRaiz.elementoId,
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
            this.toastService.show({
              type: 'success',
              message:
                'Carpeta ' + carpetaCreada.nombre + ' creada exitosamente',
              duration: 3000,
            });

            // Actualizar el contenido de la carpeta actual
            this.carpetaActualService.actualizarCarpetaActual(carpetaCreada);
            // Notificar para recargar el contenido de la carpeta raíz
            this.carpetaActualService.notificarRecargarContenido(
              this.carpetaRaiz!.elementoId
            );

            this.carpetaCreada.emit();
            this.onClose();
          },
          error: (error: ApiError) => {
            console.error('Error al crear la carpeta:', error.message);
            this.errorMessage = this.obtenerMensajeError(error);
          },
        });
      return;
    }

    // Si hay carpeta actual, usar esa
    const crearCarpetaRequest: CrearCarpetaRequest = {
      nombre: this.nombreCarpeta,
      carpetaPadreId: carpetaActual.elementoId,
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
          this.toastService.show({
            type: 'success',
            message: 'Carpeta creada exitosamente',
            duration: 3000,
          });

          // Notificar la recarga usando la carpeta actual
          this.carpetaActualService.notificarRecargarContenido(
            carpetaActual.elementoId
          );
          this.carpetaCreada.emit();
          this.onClose();
        },
        error: (error: ApiError) => {
          this.toastService.show({
            type: 'error',
            message: error.message,
            duration: 3000,
          });

          console.error('Error al crear la carpeta:', error);
          this.errorMessage = error.message
        },
      });
  }

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
