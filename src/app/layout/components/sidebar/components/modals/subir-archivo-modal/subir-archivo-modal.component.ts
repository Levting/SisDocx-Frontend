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
import { ApiError } from '../../../../../../core/models/errors/api-error.model';
import { Elemento } from '../../../../../../core/models/documentos/elemento.model';
import { SubirElementoRequest } from '../../../../../../core/models/documentos/subir-elemento-request.model';
import { ToastService } from '../../../../../../core/services/toast.service';

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
  public carpetas: File[] = [];

  private readonly MAX_ARCHIVO_SIZE = 30 * 1024 * 1024; // 30MB
  private readonly VALID_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.jpeg',
    '.jpg',
    '.png',

    // Analizadores
    '.pqm702',
  ];

  private destroy$ = new Subject<void>();
  private elementoService = inject(ElementoService);
  private carpetaActualService = inject(CarpetaActualService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.setupSubscriptions();
    if (this.carpetaActual && this.isCarpetaDisabled(this.carpetaActual)) {
      this.toastService.showWarning(
        'No se pueden subir archivos en una carpeta enviada o aceptada'
      );
      this.onClose();
    }
  }

  private setupSubscriptions(): void {
    this.carpetaActualService.carpetaActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((carpeta) => {
        this.carpetaActual = carpeta;
      });
  }

  private isCarpetaDisabled(carpeta: Carpeta): boolean {
    const estadoVisibilidad = carpeta.estadoVisibilidad
      ?.toString()
      .toUpperCase();
    if (!estadoVisibilidad) return false;
    return estadoVisibilidad === 'ENVIADO' || estadoVisibilidad === 'ACEPTADO';
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
    this.carpetas = [];
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
      // Limpiar el input para permitir seleccionar los mismos archivos nuevamente
      input.value = '';
    }
  }

  onFolderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      // Llena el array carpetas con los archivos raíz de cada carpeta seleccionada
      // (esto es solo para mostrar los nombres, la subida real es recursiva)
      this.carpetas = [];
      const files = Array.from(input.files);
      // Agrupa por carpeta raíz
      const carpetasSet = new Set<string>();
      files.forEach((file) => {
        // file.webkitRelativePath = "carpeta/subcarpeta/archivo.txt"
        const rootFolder = file.webkitRelativePath.split('/')[0];
        carpetasSet.add(rootFolder);
      });
      this.carpetas = Array.from(carpetasSet).map((name) => new File([], name));
    }
  }

  private handleFileSelection(files: File[]): void {
    const errores: string[] = [];
    const archivosValidos: File[] = [];

    files.forEach((file) => {
      const error = this.validateFile(file);
      if (error) {
        errores.push(error);
      } else {
        archivosValidos.push(file);
      }
    });

    if (errores.length > 0) {
      this.errorMessage = errores.join('\n');
    }

    if (archivosValidos.length > 0) {
      // Agregar solo los archivos válidos
      this.archivos = [...this.archivos, ...archivosValidos];
      this.errorMessage = null;
    }
  }

  private validateFile(file: File): string | null {
    if (!file) {
      return 'No se ha seleccionado ningún archivo';
    }

    // Verificar si el archivo ya está en la lista
    if (this.archivos.some((f) => f.name === file.name)) {
      return `El archivo ${file.name} ya ha sido seleccionado`;
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

    if (this.carpetaActual && this.isCarpetaDisabled(this.carpetaActual)) {
      this.toastService.showWarning(
        'No se pueden subir archivos en una carpeta enviada o aceptada'
      );
      this.onClose();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.contadorArchivosSubidos = 0;
    this.totalArchivos = this.archivos.length;

    // Usar la carpeta actual o la carpeta padre proporcionada
    const carpetaPadreId =
      this.carpetaActual?.elementoId || this.carpetaPadreId;

    if (!carpetaPadreId) {
      this.errorMessage = 'No se pudo determinar la carpeta destino';
      this.isLoading = false;
      return;
    }

    // Subir archivos secuencialmente
    const subirArchivo = (index: number) => {
      if (index >= this.archivos.length) {
        this.isLoading = false;
        this.onArchivosSubidos.emit();
        this.onSubidaCompletada.emit();

        // Notificar la recarga del contenido
        if (this.carpetaActual) {
          this.carpetaActualService.notificarRecargarContenido(
            this.carpetaActual.elementoId
          );
        } else {
          // Si no hay carpeta actual, recargar la raíz
          this.elementoService
            .obtenerRaiz()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: ({ carpetaRaiz }) => {
                this.carpetaActualService.notificarRecargarContenido(
                  carpetaRaiz.elementoId
                );
              },
              error: (error: ApiError) => {
                console.error(
                  'Error al obtener carpeta raíz para recarga:',
                  error
                );
              },
            });
        }

        this.onClose();
        return;
      }

      const request: SubirElementoRequest = {
        carpetaPadreId: carpetaPadreId,
        elemento: this.archivos[index],
      };

      this.elementoService
        .subirElemento(request)
        .pipe(
          finalize(() => {
            this.contadorArchivosSubidos++;
            subirArchivo(index + 1);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response: Elemento) => {
            console.log('Archivo subido exitosamente:', response);
          },
          error: (error: ApiError) => {
            console.error('Error al subir archivo:', error.message);
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
