import { NgClass } from '@angular/common';
import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { ColumnaConfig } from '../../../../../shared/components/tabla-estado/tabla-estado.component';

import {
  catchError,
  filter,
  forkJoin,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
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
import {
  MarcarElementoFavoritoRequest,
  RenombrarElementoRequest,
} from '../../../../../core/models/request/elemento-request.model';
import { DescargarElementoRequest } from '../../../../../core/models/documentos/descargar-elemento-request.model';
import { RevisionService } from '../../../../../core/services/revision.service';
import { TablaEstadoComponent } from '../../../../../shared/components/tabla-estado/tabla-estado.component';
import { DocumentosModalRenombrarComponent } from '../../../documentos-admin/components/documentos-modal-renombrar/documentos-modal-renombrar.component';
import { DocumentosTablaEstadosDropdownComponent } from '../documentos-tabla-estados-dropdown/documentos-tabla-estados-dropdown.component';
import { SolicitarRevisionRequest } from '../../../../../core/models/revision/revision-request.model';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-documentos-tabla-estados-personal',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    BreadcrumbComponent,
    DocumentosPreviewModalComponent,
    TablaEstadoComponent,
    DocumentosModalRenombrarComponent,
    DocumentosTablaEstadosDropdownComponent,
  ],
  templateUrl: './documentos-tabla-estados-personal.component.html',
})
export class DocumentosTablaEstadosPersonalComponent {
  public carpetaRaiz: Carpeta | null = null;
  public contenidoCarpetaRaiz: Elemento[] = [];
  public elementosOriginales: Elemento[] = [];

  public elementosTabla: ElementoTabla[] = [];

  public columnasConfig: ColumnaConfig[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      width: '200px',
      sortable: true,
    },
    {
      key: 'creadoPor',
      label: 'Creado por',
      type: 'text',
      width: '150px',
      sortable: true,
    },
    /* {
      key: 'modificadoPor',
      label: 'Modificado por',
      type: 'text',
      width: '150px',
    }, */
    /* {
      key: 'creadoEl',
      label: 'Creado el',
      type: 'text',
      width: '120px',
    }, */
    /*  {
      key: 'modificadoEl',
      label: 'Última modificación',
      type: 'text',
      width: '120px',
    }, */
    {
      key: 'equipoDistribucion',
      label: 'Equipo de distribución',
      type: 'badge',
      badgeColor: 'bg-purple-100',
      badgeTextColor: 'text-purple-800',
      width: '150px',
      sortable: true,
    },
    {
      key: 'tamano',
      label: 'Tamaño',
      type: 'text',
      width: '150px',
      sortable: true,
    },
    {
      key: 'estadoVisibilidadAdmin',
      label: 'Visible para Admin',
      type: 'status-dot',
      width: '150px',
      sortable: false,
    },
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
  private toastService: ToastService = inject(ToastService);

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

  // Propiedades para el modal de confirmación
  private destroy$ = new Subject<void>();

  constructor() {
    // Suscribirse a los cambios del rol y provincia
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    this.authService.userProvincia$.subscribe((provincia) => {
      this.userProvincia = provincia;
    });
  }

  ngOnInit(): void {
    // Cargar contenido, si no hay contenido cargar la carpeta raíz
    this.cargarRaiz();

    // Suscribirse a las notificaciones de recarga de contenido
    this.carpetaActualService.recargarContenido$
      .pipe(takeUntil(this.destroy$))
      .subscribe((carpetaId) => {
        if (carpetaId) {
          this.cargarContenido(carpetaId);
        } else {
          this.cargarRaiz();
        }
      });
  }

  /**
   * Carga el contenido de una carpeta basado en el ID de la carpeta
   * @param carpetaId - El ID de la carpeta a cargar
   * @param nombre - El nombre de la carpeta a cargar
   */
  cargarContenido(carpetaId: number, nombre?: string): void {
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

  /**
   * Carga el contenido de la carpeta raíz
   * @returns void
   */
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

        // Actualizar la carpeta actual a la raíz
        this.carpetaActualService.actualizarCarpetaActual(this.carpetaRaiz);

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

  /**
   * Navega a una carpeta específica
   * @param index - El índice de la carpeta a la que se navegará
   * @returns void
   */
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
    if (
      this.elementosSeleccionados.length === 0 ||
      this.hasDisabledSelectedElements()
    )
      return;

    const config = {
      title: 'Mover a papelera',
      message: `¿Estás seguro de que deseas mover ${this.elementosSeleccionados.length} elemento(s) a la papelera?`,
      confirmText: 'Mover a papelera',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
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
            this.actualizarContenidoActual();
            this.toastService.showSuccess(
              `Elementos ${this.elementosSeleccionados.length} movidos a papelera correctamente`
            );
            this.limpiarSeleccion();
          },
          error: (error) => {
            this.isError = true;
            this.error = 'No se pudieron mover los elementos a la papelera';
            this.toastService.showError(error.message);
          },
        });
      }
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
        // Obtener la carpeta actual
        const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
        if (carpetaActual) {
          // Recargar el contenido de la carpeta actual
          this.cargarContenido(carpetaActual.elementoId);
        } else {
          // Si no hay carpeta actual, obtener la raíz
          this.elementoService.obtenerRaiz().subscribe({
            next: ({ carpetaRaiz }) => {
              this.carpetaActualService.actualizarCarpetaActual(
                carpetaRaiz as Carpeta
              );
              this.cargarContenido(carpetaRaiz.elementoId);
            },
            error: (error: ApiError) => {
              this.isError = true;
              this.error = 'Error al cargar la carpeta raíz';
              console.error('Error al cargar carpeta raíz:', error);
            },
          });
        }
      },
      error: (error) => {
        this.isError = true;
        this.error = 'No se pudieron descargar los elementos';
        console.error('Error al descargar elementos:', error);
      },
    });
  }

  // Método para actualizar el contenido de la carpeta actual
  private actualizarContenidoActual(): void {
    const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
    if (carpetaActual) {
      this.cargarContenido(carpetaActual.elementoId);
    } else {
      this.cargarRaiz();
    }
  }

  onSolicitudIndividual(elemento: ElementoTabla): void {
    const config = {
      title: 'Solicitar revisión',
      message: `¿Estás seguro de que deseas solicitar la revisión de "${elemento.columnas['nombre']}"?`,
      confirmText: 'Solicitar revisión',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        const request: SolicitarRevisionRequest = {
          elementoId: elemento.columnas['elementoId'],
          elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
        };

        this.revisionService.solicitarRevision(request).subscribe({
          next: () => {
            // Actualizar el estado del elemento inmediatamente
            const index = this.elementosTabla.findIndex(
              (e) =>
                e.columnas['elementoId'] === elemento.columnas['elementoId']
            );

            if (index !== -1) {
              // Actualizar el estado del elemento
              this.elementosTabla[index] = {
                ...this.elementosTabla[index],
                columnas: {
                  ...this.elementosTabla[index].columnas,
                  estadoRevision: 'PENDIENTE',
                  estadoVisibilidadAdmin: 'PENDIENTE',
                },
              };
              // Forzar la detección de cambios
              this.elementosTabla = [...this.elementosTabla];
              // Limpiar la selección
              this.limpiarSeleccion();
            }

            this.toastService.showSuccess('Revisión solicitada correctamente');
          },
          error: (error: ApiError) => {
            this.isError = true;
            this.error = error.message || 'No se pudo solicitar la revisión';
            this.toastService.showError('Error al solicitar revisión');
          },
        });
      }
    });
  }

  solicitudSeleccionados(): void {
    if (this.elementosSeleccionados.length === 0) return;

    const config = {
      title: 'Solicitar revisión',
      message: `¿Estás seguro de que deseas solicitar la revisión de ${this.elementosSeleccionados.length} elemento(s)?`,
      confirmText: 'Solicitar revisión',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        const requests: SolicitarRevisionRequest[] =
          this.elementosSeleccionados.map((elemento) => ({
            elementoId: elemento.columnas['elementoId'],
            elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
          }));

        forkJoin(
          requests.map((request) =>
            this.revisionService.solicitarRevision(request).pipe(
              catchError((error) => {
                console.error('Error al enviar revisión:', error);
                return of(null);
              })
            )
          )
        ).subscribe({
          next: () => {
            // Actualizar el estado de los elementos seleccionados inmediatamente
            this.elementosSeleccionados.forEach((elemento) => {
              const index = this.elementosTabla.findIndex(
                (e) =>
                  e.columnas['elementoId'] === elemento.columnas['elementoId']
              );

              if (index !== -1) {
                // Actualizar el estado del elemento
                this.elementosTabla[index] = {
                  ...this.elementosTabla[index],
                  columnas: {
                    ...this.elementosTabla[index].columnas,
                    estadoRevision: 'PENDIENTE',
                    estadoVisibilidadAdmin: 'PENDIENTE',
                  },
                };
              }
            });

            // Forzar la detección de cambios
            this.elementosTabla = [...this.elementosTabla];
            // Limpiar la selección
            this.limpiarSeleccion();
            this.toastService.showSuccess('Revisión solicitada correctamente');
          },
          error: (error: ApiError) => {
            this.isError = true;
            this.error = 'No se pudo solicitar la revisión';
            this.toastService.showError('Error al solicitar revisión');
            console.error('Error al solicitar revisión:', error);
          },
        });
      }
    });
  }

  // Métodos para acciones individuales desde el dropdown
  onPapeleraIndividual(elemento: ElementoTabla): void {
    if (this.isElementoDisabled(elemento)) return;

    const config = {
      title: 'Mover a papelera',
      message: `¿Estás seguro de que deseas mover "${elemento.columnas['nombre']}" a la papelera?`,
      confirmText: 'Mover a papelera',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        const request = {
          elementoId: elemento.columnas['elementoId'],
          elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
        };

        this.elementoService.moverElementoPapelera(request).subscribe({
          next: () => {
            this.actualizarContenidoActual();
            this.toastService.showSuccess(
              'Elemento movido a papelera correctamente'
            );
          },
          error: (error: ApiError) => {
            this.isError = true;
            this.error =
              error.message || 'No se pudo mover el elemento a la papelera';
            console.error('Error al mover a papelera:', error);
          },
        });
      }
    });
  }

  onFavoritoIndividual(elemento: ElementoTabla): void {
    if (this.isElementoDisabled(elemento)) return;

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
    if (this.isElementoDisabled(elemento)) return;

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
    if (this.isElementoDisabled(elemento)) return;

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
    if (this.isElementoDisabled(elemento)) return;

    const request: DescargarElementoRequest = {
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    };

    this.elementoService.descargarElementos([request]).subscribe({
      next: () => {
        // La descarga se maneja automáticamente en el servicio
        // Obtener la carpeta actual
        const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
        if (carpetaActual) {
          // Recargar el contenido de la carpeta actual
          this.cargarContenido(carpetaActual.elementoId);
        } else {
          // Si no hay carpeta actual, obtener la raíz
          this.elementoService.obtenerRaiz().subscribe({
            next: ({ carpetaRaiz }) => {
              this.carpetaActualService.actualizarCarpetaActual(
                carpetaRaiz as Carpeta
              );
              this.cargarContenido(carpetaRaiz.elementoId);
            },
            error: (error: ApiError) => {
              this.isError = true;
              this.error = 'Error al cargar la carpeta raíz';
              console.error('Error al cargar carpeta raíz:', error);
            },
          });
        }
      },
      error: (error: ApiError) => {
        this.isError = true;
        this.error = 'No se pudo descargar el elemento';
        console.error('Error al descargar elemento:', error.message);
      },
    });
  }

  // Método para verificar si un elemento está deshabilitado
  public isElementoDisabled(elemento: ElementoTabla): boolean {
    const estadoVisibilidad = elemento.columnas['estadoVisibilidadAdmin']
      ?.toString()
      .toUpperCase();
    const estadoRevision = elemento.columnas['estadoRevision']
      ?.toString()
      .toUpperCase();

    return (
      estadoVisibilidad === 'PENDIENTE' ||
      estadoVisibilidad === 'VISIBLE' ||
      estadoRevision === 'PENDIENTE'
    );
  }

  // Método para verificar si hay elementos seleccionados deshabilitados
  public hasDisabledSelectedElements(): boolean {
    return this.elementosSeleccionados.some((elemento) =>
      this.isElementoDisabled(elemento)
    );
  }
}
