import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ElementoService } from '../../../../../core/services/elemento.service';
import { ElementoTabla } from '../../../../../shared/models/table/elemento-tabla.model';
import { RenombrarElementoRequest } from '../../../../../core/models/request/elemento-request.model';
import { ApiError } from '../../../../../core/models/errors/api-error.model';


@Component({
  selector: 'app-documentos-modal-renombrar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos-modal-renombrar.component.html',
})
export class DocumentosModalRenombrarComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() elemento!: ElementoTabla;
  @Input() isFile: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() elementoRenombrado = new EventEmitter<ElementoTabla>();

  public nuevoNombre: string = '';
  public isLoading: boolean = false;
  public errorMessage: string | null = null;

  private readonly MAX_NOMBRE_LENGTH = 100;
  private readonly MIN_NOMBRE_LENGTH = 1;

  private destroy$ = new Subject<void>();
  private elementoService = inject(ElementoService);

  @ViewChild('modalContent') modalContent!: ElementRef;

  ngOnInit(): void {
    if (this.elemento) {
      this.nuevoNombre = this.isFile
        ? this.elemento.columnas['nombre'].substring(
            0,
            this.elemento.columnas['nombre'].lastIndexOf('.')
          )
        : this.elemento.columnas['nombre'];
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
    this.nuevoNombre = '';
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

  onSubmit(): void {
    const errorValidacion = this.validarNombre(this.nuevoNombre);
    if (errorValidacion) {
      this.errorMessage = errorValidacion;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const nombreCompleto = this.isFile
      ? this.nuevoNombre +
        this.elemento.columnas['nombre'].substring(
          this.elemento.columnas['nombre'].lastIndexOf('.')
        )
      : this.nuevoNombre;

    const request: RenombrarElementoRequest = {
      elementoId: this.elemento.columnas['elementoId'],
      elemento: this.elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      nuevoNombre: nombreCompleto,
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
        next: (elementoActualizado: any) => {
          this.elemento.columnas['nombre'] = nombreCompleto;
          this.elementoRenombrado.emit(this.elemento);
          this.onClose();
        },
        error: (error: ApiError) => {
          console.error('Error al renombrar el elemento:', error.message);
          this.errorMessage = error.message;
        },
      });
  }

  @HostListener('click', ['$event'])
  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('dblclick', ['$event'])
  onModalDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    if (this.isOpen) {
      event.preventDefault();
      event.stopPropagation();
      this.onClose();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;

    const modal = document.getElementById('renombrar-modal');
    if (modal && !modal.contains(event.target as Node)) {
      event.preventDefault();
      event.stopPropagation();
      this.onClose();
    }
  }

  @HostListener('document:dblclick', ['$event'])
  onDocumentDoubleClick(event: MouseEvent): void {
    if (!this.isOpen) return;

    const modal = document.getElementById('renombrar-modal');
    if (modal && !modal.contains(event.target as Node)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
