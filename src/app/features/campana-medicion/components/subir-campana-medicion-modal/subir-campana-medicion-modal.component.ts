import { ToastService } from './../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubirCampanaMedicionRequest } from '../../../../core/models/documentos/subir-campana-medicion-request.model';
import { CampanaMedicionService } from '../../../../core/services/campana-medicion.service';
import { ApiError } from '../../../../core/models/errors/api-error.model';

@Component({
  selector: 'app-subir-campana-medicion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subir-campana-medicion-modal.component.html',
})
export class SubirCampanaMedicionModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() campanaCreada = new EventEmitter<void>();

  // Inyección del servicio
  private campanaMedicionService: CampanaMedicionService = inject(
    CampanaMedicionService
  );
  private toastService: ToastService = inject(ToastService);

  // Variables de Estado
  public isLoading: boolean = false;
  public isDragging: boolean = false;
  public errorMessage: string | null = null;
  public archivo: File | null = null;
  private readonly VALID_EXTENSIONS = ['.xlsx', '.xls'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  ngOnInit(): void {
    this.resetState();
  }

  private resetState(): void {
    this.errorMessage = null;
    this.isLoading = false;
    this.archivo = null;
  }

  onClose(): void {
    this.close.emit();
    this.resetState();
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
      this.handleFileSelection(files[0]);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      input.value = '';
    }
  }

  private handleFileSelection(file: File): void {
    const error = this.validateFile(file);
    if (error) {
      this.errorMessage = error;
      return;
    }

    this.archivo = file;
    this.errorMessage = null;
  }

  private validateFile(file: File): string | null {
    if (!file) {
      return 'No se ha seleccionado ningún archivo';
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return `El archivo no puede exceder los ${
        this.MAX_FILE_SIZE / (1024 * 1024)
      }MB`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.VALID_EXTENSIONS.includes(extension)) {
      return 'El archivo debe ser de tipo Excel (XLSX o XLS)';
    }

    return null;
  }

  removeFile(): void {
    this.archivo = null;
  }

  onSubmit(): void {
    if (!this.archivo) {
      this.errorMessage = 'Por favor seleccione un archivo';
      this.toastService.showError(this.errorMessage);
      return;
    }

    // Validar el nombre del archivo
    const fileName = this.archivo.name;

    // Normalizamos el nombre: sin tildes y en minúsculas
    const normalizedFileName = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    // Patrón: debe contener "campaña", "medicion" y un año (ej. 2024, 2025, etc.)
    const pattern = /campana.*medicion.*(20\d{2})/;

    // Verificamos si el nombre del archivo coincide con el patrón
    const match = normalizedFileName.match(pattern);

    if (!match) {
      console.error(
        'Nombre de archivo no válido. Debe contener "Campaña", "medición" y un año como "2024".'
      );
      this.errorMessage =
        'Nombre de archivo inválido. Asegúrese de que incluya "Campaña", "medición" y un año.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const request: SubirCampanaMedicionRequest = {
      archivo: this.archivo,
    };

    this.campanaMedicionService.subirCampanaMedicion(request).subscribe({
      next: () => {
        this.campanaCreada.emit();
        this.onClose();
        this.toastService.showSuccess(
          `✅ Archivo válido: "${fileName}" con año ${match[1]}`
        );
      },
      error: (error: ApiError) => {
        this.errorMessage =
          error.message || 'Error al crear la campaña de medición';
        this.isLoading = false;
        this.toastService.showError(this.errorMessage);
      },
    });
  }
}
