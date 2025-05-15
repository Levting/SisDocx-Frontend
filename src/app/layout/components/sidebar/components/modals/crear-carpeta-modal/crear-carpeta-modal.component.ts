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
import { finalize, switchMap, take } from 'rxjs/operators';
import { CarpetaActualService } from '../../../../../../core/services/carpeta-actual.service';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta.model';
import { ElementoService } from '../../../../../../core/services/elemento.service';
import { CrearCarpetaRequest } from '../../../../../../core/models/documentos/crear-carpeta-request.model';
import { ApiError } from '../../../../../../core/models/errors/api-error.model';
import { ToastService } from '../../../../../../shared/services/toast.service';

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

  private readonly MAX_NOMBRE_LENGTH = 100;
  private readonly MIN_NOMBRE_LENGTH = 1;

  private destroy$ = new Subject<void>();

  private elementoService = inject(ElementoService);
  private carpetaActualService = inject(CarpetaActualService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.carpetaActualService.carpetaActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((carpeta) => {
        this.carpetaActual = carpeta;
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

    const carpetaPadreId = this.carpetaActualService.obtenerCarpetaActual()?.elementoId || 1;

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
          this.toastService.show({
            type: 'success',
            message: 'Carpeta creada exitosamente',
            duration: 3000,
          });
          this.carpetaActualService.notificarRecargarContenido(carpetaPadreId);
          this.carpetaCreada.emit();
          this.onClose();
        },
        error: (error: ApiError) => {
          console.error('Error al crear la carpeta:', error.message);
          this.errorMessage = this.obtenerMensajeError(error);
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
