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
import { Carpeta } from '../../../../../core/models/documentos/carpeta';
import { CarpetaService } from '../../../../../core/services/carpeta.service';
import { CarpetaActualService } from '../../../../../core/services/carpeta-actual.service';
import { ApiError } from '../../../../../core/models/errors/apiError';
import { ElementoService } from '../../../../../core/services/elemento.service';
import { CrearCarpetaRequest } from '../../../../../core/models/documentos/crearCarpetaRequest';
import { ModalComponent } from '../../../../components/modal/modal.component';

@Component({
  selector: 'app-sidebar-modal-crear-carpeta',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './sidebar-modal-crear-carpeta.component.html',
})
export class SidebarModalCrearCarpetaComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() carpetaPadreId: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() carpetaCreada = new EventEmitter<Carpeta>();

  public carpetaActual: Carpeta | null = null;
  public nombreCarpeta: string = '';

  public isLoading: boolean = false;
  public errorMessage: string | null = null;

  private readonly MAX_NOMBRE_LENGTH = 100;
  private readonly MIN_NOMBRE_LENGTH = 1;

  private destroy$ = new Subject<void>();

  private elementoService = inject(ElementoService);
  private carpetaService = inject(CarpetaService);
  private carpetaActualService = inject(CarpetaActualService);
  private router = inject(Router);

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

  onConfirm(nombre: string): void {
    const errorValidacion = this.validarNombreCarpeta(nombre);
    if (errorValidacion) {
      this.errorMessage = errorValidacion;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const carpetaPadreId =
      this.carpetaPadreId > 0
        ? this.carpetaPadreId
        : this.carpetaActualService.obtenerCarpetaActual()?.elementoId || 1;

    const crearCarpetaRequest: CrearCarpetaRequest = {
      nombre: nombre,
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
          this.carpetaActualService.recargarContenidoActual();
          this.carpetaService.notificarRecargarContenido(carpetaPadreId);
          this.onClose();
        },
        error: (error: ApiError) => {
          console.error('Error al crear la carpeta:', error);
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
