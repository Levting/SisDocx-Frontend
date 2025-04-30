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
import { ApiError } from '../../../../core/models/errors/apiError';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Elemento } from '../../../../core/models/documentos/elemento';
import { ElementoService } from '../../../../core/services/elemento.service';
import { RenombrarElementoRequest } from '../../../../core/models/documentos/renombrarElementoRequiest';

@Component({
  selector: 'app-documentos-modal-renombrar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './documentos-modal-renombrar.component.html',
})
export class DocumentosModalRenombrarComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() elemento: Elemento | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() elementoRenombrado = new EventEmitter<Elemento>();

  public nuevoNombre: string = '';
  public isLoading: boolean = false;
  public errorMessage: string | null = null;

  private readonly MAX_NOMBRE_LENGTH = 100;
  private readonly MIN_NOMBRE_LENGTH = 1;

  private destroy$ = new Subject<void>();
  private elementoService = inject(ElementoService);

  ngOnInit(): void {
    if (this.elemento) {
      this.nuevoNombre = this.elemento.nombre;
    }
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
    this.nuevoNombre = this.elemento?.nombre || '';
  }

  private validarNombre(nombre: string): string | null {
    const nombreTrimmed = nombre.trim();

    if (!nombreTrimmed) {
      return 'El nombre no puede estar vacío';
    }

    if (nombreTrimmed.length < this.MIN_NOMBRE_LENGTH) {
      return 'El nombre es demasiado corto';
    }

    if (nombreTrimmed.length > this.MAX_NOMBRE_LENGTH) {
      return `El nombre no puede exceder los ${this.MAX_NOMBRE_LENGTH} caracteres`;
    }

    const caracteresEspeciales = /[<>:"/\\|?*]/;
    if (caracteresEspeciales.test(nombreTrimmed)) {
      return 'El nombre no puede contener caracteres especiales (< > : " / \\ | ? *)';
    }

    return null;
  }

  onConfirm(nombre: string): void {
    if (!this.elemento) return;

    const errorValidacion = this.validarNombre(nombre);
    if (errorValidacion) {
      this.errorMessage = errorValidacion;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const request: RenombrarElementoRequest = {
      elementoId: this.elemento.elementoId,
      elemento: this.elemento.elemento as 'CARPETA' | 'ARCHIVO',
      nuevoNombre: nombre,
    };

    this.elementoService
      .renombrarElemento(request)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (elementoActualizado: Elemento) => {
          this.elementoRenombrado.emit(elementoActualizado);
          this.onClose();
        },
        error: (error: ApiError) => {
          console.error('Error al renombrar el elemento:', error);
          this.errorMessage = this.obtenerMensajeError(error);
        },
      });
  }

  private obtenerMensajeError(error: any): string {
    if (error.status === 409) {
      return 'Ya existe un elemento con ese nombre en esta ubicación';
    }
    if (error.status === 403) {
      return 'No tienes permisos para renombrar este elemento';
    }
    return 'Ocurrió un error al renombrar el elemento. Por favor, inténtelo de nuevo.';
  }
}
