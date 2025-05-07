import { Component, inject, OnInit } from '@angular/core';
import { DocumentosDropdownComponent } from '../documentos-dropdown/documentos-dropdown.component';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoService } from '../../../../core/services/elemento.service';
import { Elemento } from '../../../../core/models/documentos/elemento.model';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { catchError, forkJoin, of } from 'rxjs';
import {
  MarcarElementoFavoritoRequest,
  RenombrarElementoRequest,
} from '../../../../core/models/request/elemento-request.model';
import { ApiError } from '../../../../core/models/errors/api-error.model';
import { ConfirmModalService } from '../../../../shared/services/confirm-modal.service';
import { DocumentosModalRenombrarComponent } from '../documentos-modal-renombrar/documentos-modal-renombrar.component';
import { Carpeta } from '../../../../core/models/documentos/carpeta.model';
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { CarpetaActualService } from '../../../../core/services/carpeta-actual.service';
import { DocumentosPreviewModalComponent } from '../documentos-preview-modal/documentos-preview-modal.component';
import { DescargarElementoRequest } from '../../../../core/models/documentos/descargar-elemento-request.model';

@Component({
  selector: 'app-documentos-table',
  standalone: true,
  imports: [
    DocumentosDropdownComponent,
    NgClass,
    NgIf,
    SvgIconComponent,
    TableComponent,
    BreadcrumbComponent,
    DocumentosModalRenombrarComponent,
    DocumentosPreviewModalComponent,
  ],
  templateUrl: './documentos-table.component.html',
})
export class DocumentosTableComponent implements OnInit {
  public elementosTabla: ElementoTabla[] = [];
  public elementosOriginales: Elemento[] = [];
  public cabeceras: string[] = [
    'Nombre',
    'Modificado por',
    'Modificado el',
    'Tamaño',
    'Actividad',
  ];
  public columnas: string[] = [
    'nombre',
    'creadoPor',
    'creadoEl',
    'cantidadElementos',
    'estado',
  ];

  // Inyección de servicios
  private elementoService: ElementoService = inject(ElementoService);
  private carpetaActualService: CarpetaActualService =
    inject(CarpetaActualService);
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );
  private confirmModalService: ConfirmModalService =
    inject(ConfirmModalService);

  // Propiedades para la selección de elementos
  public elementosSeleccionados: ElementoTabla[] = [];

  // Navegacion
  public ruta: { nombre: string; elementoId: number; elemento: 'CARPETA' }[] =
    [];

  // Indicadores de estado
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

  // Propiedades para el modal de renombrar
  public isOpenRenombrarModal: boolean = false;
  public elementoARenombrar: ElementoTabla | null = null;

  // Propiedades para el modal de previsualización
  public isOpenPreviewModal: boolean = false;
  public elementoAPrevisualizar: ElementoTabla | null = null;

  constructor() {}

  /* Inicializador del Componente */
  ngOnInit(): void {
    if (this.elementosTabla.length === 0) {
      this.cargarContenido(1); // Cargar contenido inicial (raiz)
    }

    // Suscribirse a eventos de recarga de contenido
    this.carpetaActualService.recargarContenido$
      .pipe()
      .subscribe((carpetaId) => {
        // Si se especifica una carpeta específica y estamos en ella, recargar
        if (carpetaId !== null) {
          const carpetaActual =
            this.carpetaActualService.obtenerCarpetaActual();
          // Si estamos en la raíz (ruta vacía) y se recarga la raíz (ID 1)
          if (this.ruta.length === 0 && carpetaId === 1) {
            this.cargarContenido(1);
          }
          // Si estamos en una carpeta específica y coincide con la carpeta a recargar
          else if (carpetaActual && carpetaActual.elementoId === carpetaId) {
            this.cargarContenido(carpetaId);
          }
        } else {
          // Si no se especifica carpeta, recargar la carpeta actual
          const carpetaActual =
            this.carpetaActualService.obtenerCarpetaActual();
          if (carpetaActual) {
            this.cargarContenido(carpetaActual.elementoId);
          } else if (this.ruta.length === 0) {
            // Si estamos en la raíz y no hay carpeta actual
            this.cargarContenido(1);
          }
        }
      });

    this.carpetaActualService.carpetaActual$.pipe().subscribe((carpeta) => {
      if (carpeta) {
        this.cargarContenido(carpeta.elementoId);
      } else if (this.ruta.length === 0) {
        // Si estamos en la raíz y no hay carpeta actual
        this.cargarContenido(1);
      }
    });
  }

  // Método para manejar el evento de selección de elementos
  onSeleccionCambiada(seleccionados: ElementoTabla[]): void {
    this.elementosSeleccionados = seleccionados;
  }

  limpiarSeleccion(): void {
    this.elementosSeleccionados = [];
    this.elementosTabla.forEach((elemento) => {
      elemento.seleccionado = false; // Limpiar la selección de cada elemento
    });
  }

  cargarContenido(carpetaId: number, nombre?: string): void {
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.elementosTabla = []; // Limpia la tabla al entrar

    this.elementoService.obtenerContenidoCarpeta(carpetaId).subscribe({
      next: (elementos: Elemento[]) => {
        // Solo actualizar la ruta si estamos navegando a una nueva carpeta
        if (
          nombre &&
          (this.ruta.length === 0 ||
            this.ruta[this.ruta.length - 1].elementoId !== carpetaId)
        ) {
          this.ruta.push({
            nombre,
            elementoId: carpetaId,
            elemento: 'CARPETA',
          });
        } else if (carpetaId === 1) {
          this.ruta = [];
        }

        this.elementosOriginales = elementos;

        // Si está vacío, terminar de una vez
        if (elementos.length === 0) {
          this.isLoading = false;
          return;
        }

        this.transformacionService
          .transformarDocumentosATabla(elementos)
          .subscribe({
            next: (filas) => {
              this.elementosTabla = filas;
              this.isLoading = false;
            },
            error: (err) => {
              this.isLoading = false;
              this.isError = true;
              this.error = 'Error al transformar los elementos para la tabla';
              console.error('Error al transformar elementos:', err);
            },
          });
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.error =
          'Ocurrió un problema al cargar los archivos. Intenta de nuevo más tarde.';
        console.error('Error al cargar contenido:', err);
      },
    });
  }

  navegarA(index: number): void {
    // Si el índice es mayor o igual que la longitud de la ruta, no hacer nada
    if (index >= this.ruta.length) {
      return;
    }

    // Obtener la carpeta a la que navegaremos
    const carpeta = this.ruta[index];

    // Si estamos intentando navegar a la carpeta actual, no hacer nada
    if (index === this.ruta.length - 1) {
      return;
    }

    // Truncar la ruta hasta el índice seleccionado
    this.ruta = this.ruta.slice(0, index + 1);

    // Limpiar selección al navegar usando el breadcrumb
    this.limpiarSeleccion();

    // Obtener los detalles completos de la carpeta
    this.elementoService
      .obtenerDetallesElemento(carpeta.elementoId, 'CARPETA')
      .subscribe({
        next: (carpetaDetalles) => {
          // Actualizar la carpeta actual con los detalles completos
          this.carpetaActualService.actualizarCarpetaActual(
            carpetaDetalles as Carpeta
          );

          // Cargar contenido de esa carpeta
          this.cargarContenido(carpeta.elementoId, carpeta.nombre);
        },
        error: (error) => {
          console.error('Error al obtener detalles de la carpeta:', error);
          this.isError = true;
          this.error = 'No se pudo cargar la carpeta';
        },
      });
  }

  onDobleClickElemento(elemento: ElementoTabla): void {
    if (elemento.columnas['elemento'] === 'CARPETA') {
      console.log('Doble clic en carpeta:', elemento.columnas);

      // Limpiar selección al cambiar de carpeta
      this.limpiarSeleccion();

      // Obtener los detalles completos de la carpeta
      this.elementoService
        .obtenerDetallesElemento(elemento.columnas['elementoId'], 'CARPETA')
        .subscribe({
          next: (carpetaDetalles) => {
            // Actualizar la carpeta actual con los detalles completos
            this.carpetaActualService.actualizarCarpetaActual(
              carpetaDetalles as Carpeta
            );

            // Cargar el contenido de la carpeta
            this.cargarContenido(
              elemento.columnas['elementoId'],
              elemento.columnas['nombre']
            );
          },
          error: (error) => {
            console.error('Error al obtener detalles de la carpeta:', error);
            this.isError = true;
            this.error = 'No se pudo cargar la carpeta';
          },
        });
    } else {
      // Abrir modal de previsualización para archivos
      console.log('Previsualizar archivo:', elemento);
      this.elementoAPrevisualizar = elemento;
      this.isOpenPreviewModal = true;
    }
  }

  onPreviewClose(): void {
    this.isOpenPreviewModal = false;
    this.elementoAPrevisualizar = null;
  }

  /* Operaciones con Elementos */
  papeleraSeleccionados(): void {
    if (this.elementosSeleccionados.length === 0) return;

    const config = {
      title: 'Mover a papelera',
      message: `¿Estás seguro de que deseas mover ${this.elementosSeleccionados.length} elemento(s) a la papelera?`,
      confirmText: 'Mover a papelera',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config, () => {
      const requests = this.elementosSeleccionados.map((elemento) => ({
        elementoId: elemento.columnas['elementoId'],
        elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      }));

      forkJoin(
        requests.map((request) =>
          this.elementoService.moverElementoPapelera(request).pipe(
            catchError((error) => {
              console.error(
                `Error al mover elemento ${request.elementoId} a papelera:`,
                error
              );
              return of(null);
            })
          )
        )
      ).subscribe({
        next: () => {
          this.limpiarSeleccion();
          this.cargarContenido(
            this.ruta[this.ruta.length - 1]?.elementoId || 1
          );
        },
        error: (error) => {
          this.isError = true;
          this.error = 'No se pudieron mover los elementos a la papelera';
          console.error('Error al mover elementos a papelera:', error);
        },
      });
    });
  }

  favoritoSeleccionados(): void {
    const requests = this.elementosSeleccionados.map((elemento) => ({
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    }));

    forkJoin(
      requests.map((request) =>
        this.elementoService.marcarElementoFavorito(request)
      )
    ).subscribe({
      next: () => {
        this.limpiarSeleccion();
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      },
      error: (error) => {
        this.isError = true;
        this.error = 'No se pudieron marcar los elementos como favoritos';
        console.error('Error al marcar favoritos:', error);
      },
    });
  }

  descargarSeleccionados(): void {
    if (this.elementosSeleccionados.length === 0) return;

    const requests = this.elementosSeleccionados.map((elemento) => ({
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    }));

    this.elementoService.descargarElementos(requests).subscribe({
      next: () => {
        // La descarga se maneja automáticamente en el servicio
        this.limpiarSeleccion();
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      },
      error: (error) => {
        this.isError = true;
        this.error = 'No se pudieron descargar los elementos';
        console.error('Error al descargar elementos:', error);
      },
    });
  }

  moverSeleccionados(): void {
    // TODO: Implementar lógica de mover elementos
    console.log('Mover elementos seleccionados:', this.elementosSeleccionados);
  }

  copiarSeleccionados(): void {
    // TODO: Implementar lógica de copiar elementos
    console.log('Copiar elementos seleccionados:', this.elementosSeleccionados);
  }

  // Manejar el evento de ir a la raíz
  cargarContenidoRaiz(): void {
    // Limpiar selección al volver a la raíz
    this.limpiarSeleccion();

    // Cargar contenido de la carpeta raíz (ID 1)
    this.cargarContenido(1);

    // Obtener la carpeta raíz y actualizar la carpeta actual
    this.elementoService
      .obtenerDetallesElemento(1, 'CARPETA')
      .subscribe((elemento) => {
        if (elemento) {
          this.carpetaActualService.actualizarCarpetaActual(
            elemento as Carpeta
          );
        }
      });
  }

  // Métodos para acciones individuales desde el dropdown
  onPapeleraIndividual(elemento: ElementoTabla): void {
    const config = {
      title: 'Mover a papelera',
      message: `¿Estás seguro de que deseas mover "${elemento.columnas['nombre']}" a la papelera?`,
      confirmText: 'Mover a papelera',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config, () => {
      const request = {
        elementoId: elemento.columnas['elementoId'],
        elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      };

      this.elementoService.moverElementoPapelera(request).subscribe({
        next: () => {
          const carpetaActual =
            this.carpetaActualService.obtenerCarpetaActual();
          if (carpetaActual) {
            this.carpetaActualService.notificarRecargarContenido(
              carpetaActual.elementoId
            );
          }
        },
        error: (error: ApiError) => {
          this.isError = true;
          this.error =
            error.message || 'No se pudo mover el elemento a la papelera';
          console.error('Error al mover a papelera:', error);
        },
      });
    });
  }

  onFavoritoIndividual(elemento: ElementoTabla): void {
    const request: MarcarElementoFavoritoRequest = {
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    };

    this.elementoService.marcarElementoFavorito(request).subscribe({
      next: () => {
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      },
      error: (error) => {
        this.isError = true;
        this.error = 'No se pudo marcar el elemento como favorito';
        console.error('Error al marcar favorito:', error);
      },
    });
  }

  onCambiarNombreIndividual(elemento: ElementoTabla): void {
    const isFile = elemento.columnas['elemento'] === 'ARCHIVO';
    const request: RenombrarElementoRequest = {
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      nuevoNombre: isFile ? 'Archivo' : 'Carpeta',
    };

    this.elementoService.renombrarElemento(request).subscribe({
      next: () => {
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      },
      error: (error: ApiError) => {
        this.isError = true;
        this.error = error.message;
        console.error('Error al cambiar nombre:', error);
      },
    });
  }

  onRenombrarClose(): void {
    this.isOpenRenombrarModal = false;
    this.elementoARenombrar = null;
  }

  onToggleFavorito(elemento: ElementoTabla): void {
    const request: MarcarElementoFavoritoRequest = {
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    };

    this.elementoService.marcarElementoFavorito(request).subscribe({
      next: () => {
        // Actualizar el estado del elemento en la tabla
        elemento.columnas['estado'] =
          elemento.columnas['estado'] === 'FAVORITO'
            ? 'DISPONIBLE'
            : 'FAVORITO';
      },
      error: (error: ApiError) => {
        console.error('Error al cambiar estado de favorito:', error.message);
      },
    });
  }

  onElementoRenombrado(elemento: ElementoTabla): void {
    // Actualizar el elemento en la tabla
    const index = this.elementosTabla.findIndex(
      (e) => e.columnas['elementoId'] === elemento.columnas['elementoId']
    );

    if (index !== -1) {
      this.elementosTabla[index] = { ...elemento };
      // Forzar la detección de cambios
      this.elementosTabla = [...this.elementosTabla];
    }

    // Obtener la carpeta actual
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
    if (carpetaActual) {
      // Notificar al servicio para recargar el contenido
      this.carpetaActualService.notificarRecargarContenido(
        carpetaActual.elementoId
      );
    }
  }

  onDescargarIndividual(elemento: ElementoTabla): void {
    const request: DescargarElementoRequest = {
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    };

    this.elementoService.descargarElementos([request]).subscribe({
      next: () => {
        // La descarga se maneja automáticamente en el servicio
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      },
      error: (error: ApiError) => {
        this.isError = true;
        this.error = 'No se pudo descargar el elemento';
        console.error('Error al descargar elemento:', error.message);
      },
    });
  }
}
