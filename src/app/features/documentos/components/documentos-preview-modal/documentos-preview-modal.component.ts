import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';
import { ElementoService } from '../../../../core/services/elemento.service';
import { PrevisualizarArchivoRequest } from '../../../../core/models/documentos/previsualizar-archivo.model';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeHtml,
} from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiError } from '../../../../core/models/errors/api-error.model';

@Component({
  selector: 'app-documentos-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  public downloadUrl: string | null = null;

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
      next: async (blob) => {
        try {
          this.pdfBlob = blob;

          if (this.esExcel() || this.esWord()) {
            // Para archivos Office, solo creamos la URL para descarga
            const url = URL.createObjectURL(blob);
            this.downloadUrl = url;
          } else {
            // Procesamiento normal para PDFs e imágenes
            let blobToUse = blob;
            if (
              this.elemento?.columnas['nombre']
                ?.toLowerCase()
                .endsWith('.pdf') &&
              (!blob.type || blob.type !== 'application/pdf')
            ) {
              blobToUse = new Blob([blob], { type: 'application/pdf' });
            }
            const url = URL.createObjectURL(blobToUse);
            this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.fileUrlString = url;
          }

          this.isLoading = false;
        } catch (err) {
          console.error('Error al procesar el archivo:', err);
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

  abrirEnNuevaPestana(): void {
    if (this.downloadUrl) {
      window.open(this.downloadUrl, '_blank');
    }
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

  esExcel(): boolean {
    const nombre = this.elemento?.columnas['nombre']?.toLowerCase() ?? '';
    return nombre.endsWith('.xls') || nombre.endsWith('.xlsx');
  }

  esWord(): boolean {
    const nombre = this.elemento?.columnas['nombre']?.toLowerCase() ?? '';
    return nombre.endsWith('.doc') || nombre.endsWith('.docx');
  }
}
