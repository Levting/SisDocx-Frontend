import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElementoService } from '../../../../../../core/services/elemento.service';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta';
import { SubirCarpetaRequest } from '../../../../../../core/models/documentos/subirCarpetaRequest';

@Component({
  selector: 'app-subir-carpeta-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subir-carpeta-modal.component.html',
})
export class SubirCarpetaModalComponent {
  @Input() isOpen: boolean = false;
  @Input() carpetaPadreId: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() carpetasSubidas = new EventEmitter<void>();
  @Output() onSubidaCompletada = new EventEmitter<void>();

  public carpetaActual: Carpeta | null = null;
  public carpetas: File[] = [];
  public isDragging: boolean = false;
  public contadorCarpetasSubidas: number = 0;
  public totalCarpetas: number = 0;

  private elementoService = inject(ElementoService);

  isLoading = false;
  errorMessage: string | null = null;

  onClose(): void {
    this.close.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.items) {
      const items = event.dataTransfer.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry?.isDirectory) {
            this.handleDirectory(entry);
          }
        }
      }
    }
  }

  private async handleDirectory(entry: any): Promise<void> {
    const reader = entry.createReader();
    const readEntries = () => {
      return new Promise((resolve) => {
        reader.readEntries((entries: any[]) => {
          resolve(entries);
        });
      });
    };

    const entries = await readEntries();
    /* if (entries.length > 0) {
      this.carpetas.push(new File([], entry.name, { type: 'directory' }));
    } */
  }

  onFolderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type === '') {
          // Es un directorio
          this.carpetas.push(file);
        }
      }
    }
  }

  removeFolder(index: number): void {
    this.carpetas.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    if (!this.carpetaPadreId || this.carpetas.length === 0) {
      this.errorMessage = 'Por favor, selecciona una carpeta para subir';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.totalCarpetas = this.carpetas.length;
    this.contadorCarpetasSubidas = 0;

    try {
      for (const carpeta of this.carpetas) {
        const request: SubirCarpetaRequest = {
          carpetaPadreId: this.carpetaPadreId,
        };

        await this.elementoService.subirCarpeta(request).toPromise();
        this.contadorCarpetasSubidas++;
      }

      this.carpetasSubidas.emit();
      this.onClose();
    } catch (error) {
      this.errorMessage =
        'Error al subir las carpetas. Por favor, intenta nuevamente.';
      console.error('Error al subir carpetas:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
