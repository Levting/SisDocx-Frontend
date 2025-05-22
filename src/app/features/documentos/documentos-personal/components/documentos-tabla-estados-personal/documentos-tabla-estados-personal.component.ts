import { NgClass } from '@angular/common';
import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

import { catchError, filter, forkJoin, of, switchMap, take } from 'rxjs';
import { BreadcrumbComponent } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { DocumentosPreviewModalComponent } from '../../../documentos-admin/components/documentos-preview-modal/documentos-preview-modal.component';
import { ElementoTabla } from '../../../../../shared/models/table/elemento-tabla.model';
import { Elemento } from '../../../../../core/models/documentos/elemento.model';
import { ElementoService } from '../../../../../core/services/elemento.service';
import { CarpetaActualService } from '../../../../../core/services/carpeta-actual.service';
import { ConfirmModalService } from '../../../../../shared/services/confirm-modal.service';
import { LoggerService } from '../../../../../core/services/logger.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { TransformacionService } from '../../../../../core/services/transformacion.service';
import { ApiError } from '../../../../../core/models/errors/api-error.model';
import { Carpeta } from '../../../../../core/models/documentos/carpeta.model';
import { RenombrarElementoRequest } from '../../../../../core/models/request/elemento-request.model';
import { DescargarElementoRequest } from '../../../../../core/models/documentos/descargar-elemento-request.model';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { RevisionService } from '../../../../../core/services/revision.service';

@Component({
  selector: 'app-documentos-tabla-estados-personal',
  standalone: true,
  imports: [
    NgIf,
    SvgIconComponent,
    NgClass,
    BreadcrumbComponent,
    DocumentosPreviewModalComponent,
    TableComponent,
  ],
  templateUrl: './documentos-tabla-estados-personal.component.html',
})
export class DocumentosTablaEstadosPersonalComponent {
  public carpetaRaiz: Carpeta | null = null;
  public contenidoCarpetaRaiz: Elemento[] = [];
  public elementosOriginales: Elemento[] = [];

  public elementosTabla: ElementoTabla[] = [];

  public cabeceras: string[] = [
    'Nombre',
    'Creado por',
    'Modificado por',
    'Creado el',
    'Última modificación',
    'Equipo de distribución',
    'Tamano',
    'Visible para Admin',
  ];
  public columnas: string[] = [
    'nombre',
    'creadoPor',
    'modificadoPor',
    'creadoEl',
    'modificadoEl',
    'equipoDistribucion',
    'tamano',
    'visibleParaAdmin',
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
  private logger: LoggerService = inject(LoggerService);
  private authService: AuthService = inject(AuthService);
  private revisionService: RevisionService = inject(RevisionService);

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

  // Propiedades para manejo de roles
  private userRole: string | null = null;
  private userProvincia: string | null = null;

  constructor() {
    // Suscribirse a los cambios del rol
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    // Suscribirse a los cambios de la provincia
    this.authService.userProvincia$.subscribe((provincia) => {
      this.userProvincia = provincia;
    });
  }

  ngOnInit(): void {
    // Inicializar la carga de la raiz
    this.cargarRaiz();
  }

  cargarRaiz(): void {
    // Inicializar los indicadores de estado
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.elementosTabla = [];
    this.ruta = [];

    // Obtener la raiz usando el servicio de elementos
    this.elementoService.obtenerRaiz().subscribe({
      next: (response) => {
        this.carpetaRaiz = response.carpetaRaiz as Carpeta;
        this.contenidoCarpetaRaiz = response.contenido;

        // Si no hay contenido, no hacer nada
        if (response.contenido.length === 0) {
          this.isLoading = false;
          return;
        }

        // Transformar los datos para la tabla
        this.transformacionService
          .transformarDocumentosATabla(response.contenido)
          .subscribe({
            next: (filas) => {
              this.elementosTabla = filas;
              this.isLoading = false;
            },
            error: (err: ApiError) => {
              this.isLoading = false;
              this.isError = true;
              this.error = 'Error al transformar los elementos para la tabla';
              this.logger.error('Error al transformar elementos:', err.message);
            },
          });
      },
      error: (err: ApiError) => {
        this.isLoading = false;
        this.isError = true;
        this.error = 'Error al cargar el contenido raíz';
        this.logger.error('Error al cargar contenido raíz:', err.message);
      },
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

  // Método para cargar el contenido de una carpeta
  cargarContenido(carpetaId: number, nombre?: string): void {
    // Inicializar los indicadores de estado
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.elementosTabla = [];

    this.authService.userLoginOn
      .pipe(
        filter((isLoggedIn) => isLoggedIn === true),
        take(1),
        switchMap(() => this.elementoService.obtenerContenidoCarpeta(carpetaId))
      )
      .subscribe({
        next: (elementos: Elemento[]) => {
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
              error: (err: ApiError) => {
                this.isLoading = false;
                this.isError = true;
                this.error = 'Error al transformar los elementos para la tabla';
                this.logger.error(
                  'Error al transformar elementos:',
                  err.message
                );
              },
            });
        },
        error: (err: ApiError) => {
          this.isLoading = false;
          this.isError = true;
          if (err.status === 401) {
            this.error =
              'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            this.logger.warn('Sesión expirada al cargar contenido');
          } else {
            this.error =
              err.message ||
              'Ocurrió un problema al cargar los archivos. Intenta de nuevo más tarde.';
            this.logger.error('Error al cargar contenido:', err.message);
          }
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

  // Método para cerrar el modal de previsualización
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
          this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId);
        },
        error: (error) => {
          this.isError = true;
          this.error = 'No se pudieron mover los elementos a la papelera';
          console.error('Error al mover elementos a papelera:', error);
        },
      });
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
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId);
      },
      error: (error) => {
        this.isError = true;
        this.error = 'No se pudieron descargar los elementos';
        console.error('Error al descargar elementos:', error);
      },
    });
  }

  enviarSolicitudSeleccionados(): void {
    if (this.elementosSeleccionados.length === 0) return;

    const config = {
      title: 'Solicitar revisión',
      message: `¿Estás seguro de que deseas solicitar una revisión para ${this.elementosSeleccionados.length} elemento(s)?`,
      confirmText: 'Solicitar revisión',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config, () => {
      const requests = this.elementosSeleccionados.map((elemento) => ({
        elementoId: elemento.columnas['elementoId'],
        elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      }));

      forkJoin(
        requests.map((request) =>
          this.revisionService.solicitarRevision(request).pipe(
            catchError((error) => {
              console.error(
                `Error al solicitar revisión para elemento ${request.elementoId}:`,
                error
              );
              return of(null);
            })
          )
        )
      ).subscribe({
        next: () => {
          this.limpiarSeleccion();
          this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId);
        },
        error: (error: ApiError) => {
          this.isError = true;
          this.error = 'No se pudo enviar la solicitud';
          console.error('Error al enviar solicitud:', error);
        },
      });
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

  onEnviarSolicitudIndividual(elemento: ElementoTabla): void {
    const config = {
      title: 'Solicitar revisión',
      message: `¿Estás seguro de que deseas solicitar una revisión para "${elemento.columnas['nombre']}"?`,
      confirmText: 'Solicitar revisión',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config, () => {
      const request = {
        elementoId: elemento.columnas['elementoId'],
        elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      };

      this.revisionService.solicitarRevision(request).subscribe({
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
          this.error = error.message || 'No se pudo enviar la solicitud';
          console.error('Error al enviar solicitud:', error);
        },
      });
    });
  }
}
