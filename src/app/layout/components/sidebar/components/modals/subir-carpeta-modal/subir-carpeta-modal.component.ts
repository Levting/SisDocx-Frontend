import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElementoService } from '../../../../../../core/services/elemento.service';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta.model';
import { CarpetaActualService } from '../../../../../../core/services/carpeta-actual.service';
import { firstValueFrom } from 'rxjs';
import { Elemento } from '../../../../../../core/models/documentos/elemento.model';

interface FileWithPath extends File {
  webkitRelativePath: string;
}

interface ProgresoSubida {
  totalArchivos: number;
  archivosSubidos: number;
  carpetaActual: string;
  archivoActual: string;
  porcentaje: number;
}

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
  public erroresPorCarpeta: { carpeta: string; error: string }[] = [];
  public isLoading = false;
  public errorMessage: string | null = null;
  public progreso: ProgresoSubida = {
    totalArchivos: 0,
    archivosSubidos: 0,
    carpetaActual: '',
    archivoActual: '',
    porcentaje: 0,
  };

  private elementoService = inject(ElementoService);
  private carpetaActualService = inject(CarpetaActualService);
  private archivosSeleccionados: FileWithPath[] = [];

  onClose(): void {
    this.close.emit();
    this.resetState();
  }

  private resetState(): void {
    this.carpetas = [];
    this.archivosSeleccionados = [];
    this.isLoading = false;
    this.errorMessage = null;
    this.erroresPorCarpeta = [];
    this.contadorCarpetasSubidas = 0;
    this.totalCarpetas = 0;
    this.progreso = {
      totalArchivos: 0,
      archivosSubidos: 0,
      carpetaActual: '',
      archivoActual: '',
      porcentaje: 0,
    };
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
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFolderFiles(Array.from(files) as FileWithPath[]);
    }
  }

  onFolderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFolderFiles(Array.from(input.files) as FileWithPath[]);
    }
  }

  private handleFolderFiles(files: FileWithPath[]): void {
    this.archivosSeleccionados = files;
    const carpetasSet = new Set<string>();
    files.forEach((file) => {
      const rootFolder = file.webkitRelativePath.split('/')[0];
      carpetasSet.add(rootFolder);
    });
    this.carpetas = Array.from(carpetasSet).map((name) => new File([], name));
  }

  removeFolder(index: number): void {
    const folderName = this.carpetas[index].name;
    this.archivosSeleccionados = this.archivosSeleccionados.filter(
      (file) => file.webkitRelativePath.split('/')[0] !== folderName
    );
    this.carpetas.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    if (
      !this.carpetaPadreId ||
      this.carpetas.length === 0 ||
      this.archivosSeleccionados.length === 0
    ) {
      this.errorMessage = 'Por favor, selecciona una carpeta para subir';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.erroresPorCarpeta = [];
    this.totalCarpetas = this.carpetas.length;
    this.contadorCarpetasSubidas = 0;

    // Calcular el total de archivos a subir
    this.progreso.totalArchivos = this.archivosSeleccionados.length;
    this.progreso.archivosSubidos = 0;
    this.progreso.porcentaje = 0;

    try {
      const carpetasRaiz = Array.from(
        new Set(
          this.archivosSeleccionados.map(
            (f) => f.webkitRelativePath.split('/')[0]
          )
        )
      );

      for (const carpetaRaiz of carpetasRaiz) {
        this.progreso.carpetaActual = carpetaRaiz;
        const filesDeCarpeta = this.archivosSeleccionados.filter((f) =>
          f.webkitRelativePath.startsWith(carpetaRaiz + '/')
        );

        try {
          await this.uploadFolderStructure(
            this.carpetaPadreId,
            carpetaRaiz,
            filesDeCarpeta
          );
          this.contadorCarpetasSubidas++;
          // Pequeña pausa entre carpetas para evitar sobrecarga
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error: any) {
          this.erroresPorCarpeta.push({
            carpeta: carpetaRaiz,
            error:
              error?.error?.message ||
              error?.message ||
              'Error desconocido al subir la carpeta.',
          });
        }
      }

      if (this.erroresPorCarpeta.length === 0) {
        this.carpetasSubidas.emit();
        this.carpetaActualService.notificarRecargarContenido(
          this.carpetaPadreId
        );
        this.onClose();
      } else {
        this.errorMessage =
          'Algunas carpetas no pudieron ser subidas. Revisa los detalles.';
      }
    } catch (error: any) {
      this.errorMessage =
        error?.error?.message ||
        error?.message ||
        'Error al subir las carpetas. Por favor, intenta nuevamente.';
      console.error('Error al subir carpetas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private actualizarProgreso(archivoActual: string): void {
    this.progreso.archivosSubidos++;
    this.progreso.archivoActual = archivoActual;
    this.progreso.porcentaje = Math.round(
      (this.progreso.archivosSubidos / this.progreso.totalArchivos) * 100
    );
  }

  private async uploadFolderStructure(
    carpetaPadreId: number,
    carpetaRaiz: string,
    files: FileWithPath[]
  ): Promise<void> {
    // 1. Crear la carpeta raíz
    const folderFile = new File([], carpetaRaiz);
    const carpetaResponse = await firstValueFrom(
      this.elementoService.subirElemento({
        carpetaPadreId,
        elemento: folderFile,
      })
    );

    if (!carpetaResponse) {
      throw new Error('No se pudo crear la carpeta en el backend');
    }

    // 2. Organizar archivos por nivel
    const archivosPorNivel = new Map<string, FileWithPath[]>();
    for (const file of files) {
      const relativePath = file.webkitRelativePath.substring(
        carpetaRaiz.length + 1
      );
      if (!relativePath) continue;

      const partes = relativePath.split('/');
      const nivel = partes.length;
      if (!archivosPorNivel.has(nivel.toString())) {
        archivosPorNivel.set(nivel.toString(), []);
      }
      archivosPorNivel.get(nivel.toString())!.push(file);
    }

    // 3. Subir archivos nivel por nivel
    const niveles = Array.from(archivosPorNivel.keys()).sort(
      (a, b) => Number(a) - Number(b)
    );

    for (const nivel of niveles) {
      const archivosDelNivel = archivosPorNivel.get(nivel)!;
      const carpetasCreadas = new Map<string, number>();

      for (const file of archivosDelNivel) {
        const relativePath = file.webkitRelativePath.substring(
          carpetaRaiz.length + 1
        );
        const partes = relativePath.split('/');
        const nombreArchivo = partes[partes.length - 1];
        const rutaCarpeta = partes.slice(0, -1).join('/');

        this.actualizarProgreso(nombreArchivo);

        // Si hay subcarpetas, asegurarse de que existan
        if (rutaCarpeta) {
          const carpetas = rutaCarpeta.split('/');
          let carpetaPadreIdActual = carpetaResponse.elementoId;

          for (const carpeta of carpetas) {
            const rutaCompleta = carpetas
              .slice(0, carpetas.indexOf(carpeta) + 1)
              .join('/');

            if (!carpetasCreadas.has(rutaCompleta)) {
              const carpetaFile = new File([], carpeta);
              const carpetaCreada = await firstValueFrom(
                this.elementoService.subirElemento({
                  carpetaPadreId: carpetaPadreIdActual,
                  elemento: carpetaFile,
                })
              );
              carpetasCreadas.set(rutaCompleta, carpetaCreada.elementoId);
              carpetaPadreIdActual = carpetaCreada.elementoId;
            } else {
              carpetaPadreIdActual = carpetasCreadas.get(rutaCompleta)!;
            }
          }

          // Crear un nuevo File con solo el nombre del archivo
          const fileToUpload = new File([file], nombreArchivo, {
            type: file.type,
            lastModified: file.lastModified,
          });

          // Subir el archivo en la carpeta correspondiente
          await firstValueFrom(
            this.elementoService.subirElemento({
              carpetaPadreId: carpetaPadreIdActual,
              elemento: fileToUpload,
            })
          );
        } else {
          // Crear un nuevo File con solo el nombre del archivo
          const fileToUpload = new File([file], nombreArchivo, {
            type: file.type,
            lastModified: file.lastModified,
          });

          // Subir el archivo directamente en la carpeta raíz
          await firstValueFrom(
            this.elementoService.subirElemento({
              carpetaPadreId: carpetaResponse.elementoId,
              elemento: fileToUpload,
            })
          );
        }
      }
    }
  }
}