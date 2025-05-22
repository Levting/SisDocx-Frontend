import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElementoService } from '../../../../../../core/services/elemento.service';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta.model';
import { CarpetaActualService } from '../../../../../../core/services/carpeta-actual.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ApiError } from '../../../../../../core/models/errors/api-error.model';

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
export class SubirCarpetaModalComponent implements OnInit, OnDestroy {
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
  private destroy$ = new Subject<void>();

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
    if (this.isLoading || this.carpetas.length === 0) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.erroresPorCarpeta = [];
    this.totalCarpetas = this.carpetas.length;
    this.contadorCarpetasSubidas = 0;

    // Usar la carpeta actual o la carpeta padre proporcionada
    const carpetaPadreId =
      this.carpetaActual?.elementoId || this.carpetaPadreId;

    if (!carpetaPadreId) {
      this.errorMessage = 'No se pudo determinar la carpeta destino';
      this.isLoading = false;
      return;
    }

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
            carpetaPadreId,
            carpetaRaiz,
            filesDeCarpeta
          );
          this.contadorCarpetasSubidas++;
        } catch (error: any) {
          console.error(`Error al subir la carpeta ${carpetaRaiz}:`, error);
          this.erroresPorCarpeta.push({
            carpeta: carpetaRaiz,
            error: error?.message || 'Error desconocido al subir la carpeta.',
          });
          throw error;
        }
      }

      // Si llegamos aquí, todo se subió correctamente
      this.carpetasSubidas.emit();
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
    } catch (error: any) {
      this.errorMessage =
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
    // Estructura para mantener registro de elementos creados
    const elementosCreados: { id: number; tipo: 'CARPETA' | 'ARCHIVO' }[] = [];

    try {
      // 1. Crear la carpeta raíz - Usar solo el nombre de la carpeta, no la ruta completa
      const nombreCarpetaRaiz = carpetaRaiz.split('/').pop() || carpetaRaiz;
      const folderFile = new File([], nombreCarpetaRaiz);
      const carpetaResponse = await firstValueFrom(
        this.elementoService.subirElemento({
          carpetaPadreId,
          elemento: folderFile,
        })
      );

      if (!carpetaResponse) {
        throw new Error('No se pudo crear la carpeta en el backend');
      }

      elementosCreados.push({
        id: carpetaResponse.elementoId,
        tipo: 'CARPETA',
      });

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

      const carpetasCreadas = new Map<string, number>();

      try {
        for (const nivel of niveles) {
          const archivosDelNivel = archivosPorNivel.get(nivel)!;

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
                  elementosCreados.push({
                    id: carpetaCreada.elementoId,
                    tipo: 'CARPETA',
                  });
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
              const archivoSubido = await firstValueFrom(
                this.elementoService.subirElemento({
                  carpetaPadreId: carpetaPadreIdActual,
                  elemento: fileToUpload,
                })
              );
              elementosCreados.push({
                id: archivoSubido.elementoId,
                tipo: 'ARCHIVO',
              });
            } else {
              // Crear un nuevo File con solo el nombre del archivo
              const fileToUpload = new File([file], nombreArchivo, {
                type: file.type,
                lastModified: file.lastModified,
              });

              // Subir el archivo directamente en la carpeta raíz
              const archivoSubido = await firstValueFrom(
                this.elementoService.subirElemento({
                  carpetaPadreId: carpetaResponse.elementoId,
                  elemento: fileToUpload,
                })
              );
              elementosCreados.push({
                id: archivoSubido.elementoId,
                tipo: 'ARCHIVO',
              });
            }
          }
        }
      } catch (error: any) {
        // Si ocurre un error, intentar revertir los cambios
        console.error('Error durante la subida:', error);

        // Realizar rollback de los elementos creados
        await this.realizarRollback(elementosCreados);

        throw new Error(
          `Error al subir la carpeta ${carpetaRaiz}: ${error.message}`
        );
      }
    } catch (error) {
      console.error('Error en uploadFolderStructure:', error);
      throw error;
    }
  }

  private async realizarRollback(
    elementosCreados: { id: number; tipo: 'CARPETA' | 'ARCHIVO' }[]
  ): Promise<void> {
    console.log('Iniciando rollback de elementos:', elementosCreados);

    // Eliminar elementos en orden inverso (primero los archivos, luego las carpetas)
    const elementosOrdenados = [...elementosCreados].reverse();

    for (const elemento of elementosOrdenados) {
      try {
        await firstValueFrom(
          this.elementoService.eliminarElemento({
            elementoId: elemento.id,
            elemento: elemento.tipo,
          })
        );
        console.log(
          `Elemento eliminado exitosamente: ${elemento.tipo} ${elemento.id}`
        );
      } catch (error) {
        console.error(
          `Error al eliminar elemento durante rollback: ${elemento.tipo} ${elemento.id}`,
          error
        );
        // Continuamos con el rollback aunque falle algún elemento
      }
    }
  }
}
