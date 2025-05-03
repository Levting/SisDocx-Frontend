import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta.model';
import { ElementoService } from '../../../../../../core/services/elemento.service';
import { CarpetaActualService } from '../../../../../../core/services/carpeta-actual.service';
import { SubirArchivoRequest } from '../../../../../../core/models/documentos/subir-archivo-request.model';

@Component({
  selector: 'app-subir-archivo-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subir-archivo-modal.component.html',
})
export class SubirArchivoModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() carpetaPadreId: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() onArchivosSubidos = new EventEmitter<void>();
  @Output() onSubidaCompletada = new EventEmitter<void>();

  public carpetaActual: Carpeta | null = null;
  public archivos: File[] = [];
  public isLoading: boolean = false;
  public errorMessage: string | null = null;
  public isDragging: boolean = false;
  public contadorArchivosSubidos: number = 0;
  public totalArchivos: number = 0;

  private readonly MAX_ARCHIVO_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly VALID_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.jpeg',
    '.jpg',
    '.png',
  ];

  private destroy$ = new Subject<void>();
  private elementoService = inject(ElementoService);
  private carpetaActualService = inject(CarpetaActualService);

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
    this.archivos = [];
    this.isDragging = false;
    this.contadorArchivosSubidos = 0;
    this.totalArchivos = 0;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(Array.from(files));
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(Array.from(input.files));
    }
  }

  private handleFileSelection(files: File[]): void {
    const errores: string[] = [];

    files.forEach((file) => {
      const error = this.validateFile(file);
      if (error) {
        errores.push(error);
      }
    });

    if (errores.length > 0) {
      this.errorMessage = errores.join('\n');
      return;
    }

    this.archivos = [...this.archivos, ...files];
    this.errorMessage = null;
  }

  private validateFile(file: File): string | null {
    if (!file) {
      return 'No se ha seleccionado ningún archivo';
    }

    if (file.size > this.MAX_ARCHIVO_SIZE) {
      return `El archivo ${file.name} no puede exceder los ${
        this.MAX_ARCHIVO_SIZE / (1024 * 1024)
      }MB`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.VALID_EXTENSIONS.includes(extension)) {
      return `El archivo ${file.name} debe tener una extensión válida (pdf, doc, docx, xls, xlsx, jpg, jpeg, png)`;
    }

    return null;
  }

  removeFile(index: number): void {
    this.archivos.splice(index, 1);
  }

  onSubmit(): void {
    if (this.isLoading || this.archivos.length === 0) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.contadorArchivosSubidos = 0;
    this.totalArchivos = this.archivos.length;

    const carpetaPadreId =
      this.carpetaPadreId || this.carpetaActual?.elementoId || 1;

    // Subir archivos secuencialmente
    const subirArchivo = (index: number) => {
      if (index >= this.archivos.length) {
        this.isLoading = false;
        this.onArchivosSubidos.emit();
        this.onSubidaCompletada.emit();
        this.carpetaActualService.notificarRecargarContenido();
        this.onClose();
        return;
      }

      const request: SubirArchivoRequest = {
        carpetaPadreId: carpetaPadreId,
        archivo: this.archivos[index],
      };

      this.elementoService
        .subirArchivo(request)
        .pipe(
          finalize(() => {
            this.contadorArchivosSubidos++;
            subirArchivo(index + 1);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response) => {
            console.log('Archivo subido exitosamente:', response);
          },
          error: (error) => {
            console.error('Error al subir archivo:', error);
            this.errorMessage = this.obtenerMensajeError(error);
          },
        });
    };

    subirArchivo(0);
  }

  private obtenerMensajeError(error: any): string {
    if (error.status === 404) {
      return 'No se encontró la carpeta destino';
    }
    return error.message || 'Error al subir los archivos';
  }
}
