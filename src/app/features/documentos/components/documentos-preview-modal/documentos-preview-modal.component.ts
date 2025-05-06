import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';
import { ElementoService } from '../../../../core/services/elemento.service';
import { PrevisualizarArchivoRequest } from '../../../../core/models/documentos/previsualizar-archivo.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiError } from '../../../../core/models/errors/api-error.model';

@Component({
  selector: 'app-documentos-preview-modal',
  standalone: true,
  imports: [CommonModule, NgxExtendedPdfViewerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './documentos-preview-modal.component.html',
})
export class DocumentosPreviewModalComponent implements OnInit, OnDestroy {
  @Input() elemento: ElementoTabla | null = null;
  @Output() cerrar = new EventEmitter<void>();

  public fileUrl: SafeResourceUrl | null = null;
  public fileUrlString: string | null = null;
  public pdfBlob: Blob | null = null;
  public isLoading: boolean = false;
  public error: string | null = null;

  constructor(
    private elementoService: ElementoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.elemento) {
      this.cargarArchivo();
    }
  }

  ngOnDestroy(): void {
    this.limpiarRecursos();
  }

  private limpiarRecursos(): void {
    if (this.fileUrlString) {
      URL.revokeObjectURL(this.fileUrlString);
    }
  }

  private cargarArchivo(): void {
    if (!this.elemento) return;

    this.isLoading = true;
    this.error = null;

    const request: PrevisualizarArchivoRequest = {
      id: this.elemento.columnas['elementoId'],
    };

    this.elementoService.previsualizarArchivo(request).subscribe({
      next: (blob) => {
        try {
          // Guardar el blob original
          this.pdfBlob = blob;

          // Crear una copia del blob con tipo explícito para PDF si es necesario
          let blobToUse = blob;

          // Si el tipo MIME no está establecido o es incorrecto para PDFs, y detectamos que es un PDF
          if (
            this.elemento?.columnas['nombre']?.toLowerCase().endsWith('.pdf') &&
            (!blob.type || blob.type !== 'application/pdf')
          ) {
            blobToUse = new Blob([blob], { type: 'application/pdf' });
          }

          // Crear la URL para el objeto blob
          const url = URL.createObjectURL(blobToUse);
          this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.fileUrlString = url;

          console.log('Archivo cargado correctamente', {
            tipo: blobToUse.type,
            tamaño: blobToUse.size,
            url: url,
          });

          this.isLoading = false;
        } catch (err) {
          console.error('Error al procesar el blob:', err);
          this.error = 'Error al procesar el archivo';
          this.isLoading = false;
        }
      },
      error: (error: ApiError) => {
        this.error = 'No se pudo cargar el archivo';
        this.isLoading = false;
        console.error('Error al cargar archivo:', error.message);
      },
    });
  }

  cerrarModal(): void {
    this.limpiarRecursos();
    this.cerrar.emit();
  }

  esPDF(): boolean {
    if (this.pdfBlob && this.pdfBlob.type === 'application/pdf') {
      return true;
    }
    return (
      this.elemento?.columnas['nombre']?.toLowerCase().endsWith('.pdf') ?? false
    );
  }

  esImagen(): boolean {
    if (this.pdfBlob && this.pdfBlob.type.startsWith('image/')) {
      return true;
    }

    const nombre = this.elemento?.columnas['nombre']?.toLowerCase() ?? '';
    return (
      nombre.endsWith('.jpg') ||
      nombre.endsWith('.jpeg') ||
      nombre.endsWith('.png') ||
      nombre.endsWith('.gif') ||
      nombre.endsWith('.webp')
    );
  }
}
