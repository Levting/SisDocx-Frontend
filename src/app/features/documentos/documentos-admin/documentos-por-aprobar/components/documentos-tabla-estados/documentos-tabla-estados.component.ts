import { NgClass } from '@angular/common';
import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

import {
  catchError,
  filter,
  forkJoin,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TablaEstadoComponent } from '../../../../../../shared/components/tabla-estado/tabla-estado.component';
import { BreadcrumbComponent } from '../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ElementoTabla } from '../../../../../../shared/models/table/elemento-tabla.model';
import { DocumentosPreviewModalComponent } from '../../../components/documentos-preview-modal/documentos-preview-modal.component';
import { Elemento } from '../../../../../../core/models/documentos/elemento.model';
import { ElementoService } from '../../../../../../core/services/elemento.service';
import { CarpetaActualService } from '../../../../../../core/services/carpeta-actual.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { TransformacionService } from '../../../../../../core/services/transformacion.service';
import { ConfirmModalService } from '../../../../../../shared/services/confirm-modal.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { ApiError } from '../../../../../../core/models/errors/api-error.model';
import { Carpeta } from '../../../../../../core/models/documentos/carpeta.model';
import { RenombrarElementoRequest } from '../../../../../../core/models/request/elemento-request.model';
import { DescargarElementoRequest } from '../../../../../../core/models/documentos/descargar-elemento-request.model';
import { RevisionService } from '../../../../../../core/services/revision.service';
import { RevisionDesicion } from '../../../../../../core/models/revision/revision-desicion.model';
import { Revision } from '../../../../../../core/models/revision/elemento-revision.model';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import { ToastService } from '../../../../../../core/services/toast.service';

interface ColumnaConfig {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'status' | 'actions';
  badgeColor?: string;
  badgeTextColor?: string;
  hidden?: boolean;
}

@Component({
  selector: 'app-documentos-tabla-estados',
  standalone: true,
  imports: [
    NgIf,
    SvgIconComponent,
    TablaEstadoComponent,
    NgClass,
    BreadcrumbComponent,
    DocumentosPreviewModalComponent,
    TableComponent,
  ],
  templateUrl: './documentos-tabla-estados.component.html',
})
export class DocumentosTablaEstadosComponent implements OnInit {
  public elementosTabla: ElementoTabla[] = [];
  public elementosOriginales: Elemento[] = [];

  public cabeceras: string[] = [
    'Remitente',
    'Provincia',
    'Fecha de envio',
    'Equipo de distribución',
    'Tamaño',
  ];

  public columnas: string[] = [
    'remitente',
    'provincia',
    'fechaEnvio',
    'equipoDistribucion',
    'tamano',
  ];

  /* public columnasConfig: ColumnaConfig[] = [
    {
      key: 'remitente',
      label: 'Remitente',
      type: 'text',
    },
    {
      key: 'provincia',
      label: 'Provincia',
      type: 'badge',
      badgeColor: 'bg-blue-100',
      badgeTextColor: 'text-blue-800',
    },
    {
      key: 'fechaEnvio',
      label: 'Fecha de envio',
      type: 'text',
    },
    {
      key: 'equipoDistribucion',
      label: 'Equipo de distribución',
      type: 'badge',
      badgeColor: 'bg-green-300',
      badgeTextColor: 'text-green-700',
    },
    {
      key: 'tamano',
      label: 'Tamaño',
      type: 'text',
    },
    {
      key: 'estadoRevision',
      label: 'Estado Revisión',
      type: 'status',
    },
    {
      key: 'acciones',
      label: 'Acciones',
      type: 'actions',
    },
  ]; */

  // public columnas: string[] = this.columnasConfig.map((col) => col.key);

  // Inyección de servicios
  private carpetaActualService: CarpetaActualService =
    inject(CarpetaActualService);
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );
  private confirmModalService: ConfirmModalService =
    inject(ConfirmModalService);
  private logger: LoggerService = inject(LoggerService);
  private authService: AuthService = inject(AuthService);
  private elementoService: ElementoService = inject(ElementoService);
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

  public revisiones: Revision[] = [];

  // Pagination properties
  public currentPage: number = 0;
  public pageSize: number = 20;
  public totalElements: number = 0;
  public totalPages: number = 0;
  public isLoadingMore: boolean = false;
  public hasMoreItems: boolean = true;

  constructor() {
    // Suscribirse a los cambios del rol y provincia
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    this.authService.userProvincia$.subscribe((provincia) => {
      this.userProvincia = provincia;
    });
  }

  /* Inicializador del Componente */
  ngOnInit(): void {
    this.authService.userLoginOn
      .pipe(
        filter((isLoggedIn) => isLoggedIn === true),
        take(1),
        tap(() => {
          this.logger.debug('Usuario autenticado, cargando contenido raíz');
          this.cargarRaiz();
        })
      )
      .subscribe();

    // Suscribirse a eventos de recarga de contenido
    this.carpetaActualService.recargarContenido$
      .pipe(
        tap((carpetaId) => {
          this.logger.debug('Recargando contenido para carpeta:', carpetaId);
        })
      )
      .subscribe((carpetaId) => {
        const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();

        // Si no hay carpeta actual o estamos en la raíz, cargar la raíz
        if (!carpetaActual || this.ruta.length === 0) {
          this.cargarRaiz();
          return;
        }

        // Si el ID de la carpeta coincide con la actual, recargar su contenido
        if (carpetaId === carpetaActual.elementoId) {
          this.cargarContenido(carpetaId, carpetaActual.nombre);
          return;
        }

        // Si estamos en una subcarpeta y el ID no coincide, volver a la raíz
        this.cargarRaiz();
      });

    this.cargarRevisionesPendientes();
  }

  cargarRaiz(): void {
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.elementosTabla = [];
    this.ruta = [];

    this.logger.debug('Iniciando carga de revisiones pendientes');

    this.revisionService.obtenerRevisionesPendientes().subscribe({
      next: (revisiones) => {
        if (revisiones.length === 0) {
          this.isLoading = false;
          return;
        }

        this.transformacionService
          .transformarRevisionesATabla(revisiones)
          .subscribe({
            next: (elementosTransformados) => {
              this.elementosTabla = elementosTransformados;
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
        this.error = 'Error al cargar las revisiones pendientes';
        this.logger.error('Error al cargar revisiones:', err.message);
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

  cargarContenido(carpetaId: number, nombre?: string): void {
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.elementosTabla = [];
    this.currentPage = 0;

    this.authService.userLoginOn
      .pipe(
        filter((isLoggedIn) => isLoggedIn === true),
        take(1),
        switchMap(() =>
          this.elementoService.obtenerContenidoCarpeta(
            carpetaId,
            this.currentPage,
            this.pageSize
          )
        )
      )
      .subscribe({
        next: (response) => {
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

          this.elementosOriginales = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;

          if (response.content.length === 0) {
            this.isLoading = false;
            return;
          }

          this.transformacionService
            .transformarDocumentosATabla(response.content)
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

  cargarMasElementos(): void {
    if (this.isLoadingMore) return;

    this.isLoadingMore = true;
    this.currentPage++;

    this.revisionService.obtenerRevisionesPendientes().subscribe({
      next: (revisiones) => {
        if (revisiones.length === 0) {
          this.isLoadingMore = false;
          return;
        }

        this.transformacionService
          .transformarRevisionesATabla(revisiones)
          .subscribe({
            next: (elementosTransformados) => {
              this.elementosTabla = [
                ...this.elementosTabla,
                ...elementosTransformados,
              ];
              this.isLoadingMore = false;
            },
            error: (err: ApiError) => {
              this.isLoadingMore = false;
              this.isError = true;
              this.error = 'Error al transformar los elementos para la tabla';
              this.logger.error('Error al transformar elementos:', err.message);
            },
          });
      },
      error: (err: ApiError) => {
        this.isLoadingMore = false;
        this.isError = true;
        this.error = 'Error al cargar las revisiones pendientes';
        this.logger.error('Error al cargar revisiones:', err.message);
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
  private esCarpetaProtegida(nombre: string): boolean {
    // Validar años (2024, 2025, etc.)
    if (/^\d{4}$/.test(nombre)) {
      return true;
    }

    // Validar meses (01 Enero, 02 Febrero, etc.)
    const meses = [
      '01 Enero',
      '02 Febrero',
      '03 Marzo',
      '04 Abril',
      '05 Mayo',
      '06 Junio',
      '07 Julio',
      '08 Agosto',
      '09 Septiembre',
      '10 Octubre',
      '11 Noviembre',
      '12 Diciembre',
    ];
    if (meses.includes(nombre)) {
      return true;
    }

    // Validar nombres específicos
    const nombresProtegidos = [
      'Barras',
      'Transformadores',
      'Trafos',
      'UBV',
      'UMAV',
    ];
    if (nombresProtegidos.includes(nombre)) {
      return true;
    }

    return false;
  }

  papeleraSeleccionados(): void {
    if (this.elementosSeleccionados.length === 0) return;

    // Filtrar elementos que no son carpetas protegidas
    const elementosPermitidos = this.elementosSeleccionados.filter(
      (elemento) => {
        if (elemento.columnas['elemento'] === 'CARPETA') {
          return !this.esCarpetaProtegida(elemento.columnas['nombre']);
        }
        return true;
      }
    );

    // Si no hay elementos permitidos después del filtrado
    if (elementosPermitidos.length === 0) {
      this.logger.warn('No se pueden mover carpetas protegidas a la papelera');
      this.toastService.showInfo(
        'No se pueden mover carpetas protegidas a la papelera',
        'Estas carpetas son protegidas y no pueden ser movidas a la papelera'
      );
      return;
    }

    const config = {
      title: 'Mover a papelera',
      message: `¿Estás seguro de que deseas mover ${elementosPermitidos.length} elemento(s) a la papelera?`,
      confirmText: 'Mover a papelera',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        const requests = elementosPermitidos.map((elemento) => ({
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
      }
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

  // Métodos para acciones individuales desde el dropdown
  onPapeleraIndividual(elemento: ElementoTabla): void {
    // Verificar si es una carpeta protegida
    if (
      elemento.columnas['elemento'] === 'CARPETA' &&
      this.esCarpetaProtegida(elemento.columnas['nombre'])
    ) {
      this.logger.warn('No se puede mover esta carpeta a la papelera');
      this.toastService.showInfo(
        'No se puede mover esta carpeta a la papelera',
        'Esta carpeta es protegida y no puede ser movida a la papelera'
      );
      return;
    }

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
      }
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

  // Métodos para manejar la aprobación y rechazo de documentos
  onAprobar(elemento: ElementoTabla): void {
    const config = {
      title: 'Aprobar revisión',
      message: `¿Estás seguro de que deseas aprobar la revisión de "${elemento.columnas['nombre']}"?`,
      confirmText: 'Aprobar',
      cancelText: 'Cancelar',
      type: 'warning' as const,
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        const request: RevisionDesicion = {
          revisionId: elemento.columnas['id'],
          estadoRevision: 'APROBADO',
          observaciones: elemento.columnas['observaciones'],
        };

        this.revisionService.revisar(request).subscribe({
          next: () => {
            this.logger.info(
              'Aprobando revisión:',
              elemento.columnas['nombre']
            );
            this.cargarRevisionesPendientes();
          },
          error: (error) => {
            this.isError = true;
            this.error = 'Error al aprobar la revisión';
            this.logger.error('Error al aprobar revisión:', error);
          },
        });
      }
    });
  }

  onRechazar(elemento: ElementoTabla): void {
    const config = {
      title: 'Rechazar revisión',
      message: `¿Estás seguro de que deseas rechazar la revisión de "${elemento.columnas['nombre']}"?`,
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        const request: RevisionDesicion = {
          revisionId: elemento.columnas['id'],
          estadoRevision: 'RECHAZADO',
          observaciones: elemento.columnas['observaciones'],
        };

        this.revisionService.revisar(request).subscribe({
          next: () => {
            this.cargarRevisionesPendientes();
          },
          error: (error) => {
            this.isError = true;
            this.error = 'Error al rechazar la revisión';
            this.logger.error('Error al rechazar revisión:', error);
          },
        });
      }
    });
  }

  onAprobarSeleccionados(elementos: ElementoTabla[]): void {
    const config = {
      title: 'Aprobar documentos',
      message: `¿Estás seguro de que deseas aprobar ${elementos.length} documento(s)?`,
      confirmText: 'Aprobar',
      cancelText: 'Cancelar',
      type: 'warning' as const,
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        // Aquí iría la llamada al servicio para aprobar los documentos
        console.log('Aprobando documentos:', elementos);
        // Actualizar el estado de los documentos
        elementos.forEach((elemento) => {
          elemento.columnas['estado'] = 'Aprobado';
        });
        // Recargar la tabla
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      }
    });
  }

  onRechazarSeleccionados(elementos: ElementoTabla[]): void {
    const config = {
      title: 'Rechazar documentos',
      message: `¿Estás seguro de que deseas rechazar ${elementos.length} documento(s)?`,
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        // Aquí iría la llamada al servicio para rechazar los documentos
        console.log('Rechazando documentos:', elementos);
        // Actualizar el estado de los documentos
        elementos.forEach((elemento) => {
          elemento.columnas['estado'] = 'Rechazado';
        });
        // Recargar la tabla
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      }
    });
  }

  cargarRevisionesPendientes(): void {
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.currentPage = 0;
    this.hasMoreItems = true;

    this.revisionService.obtenerRevisionesPendientes().subscribe({
      next: (revisiones) => {
        this.revisiones = revisiones;
        this.transformacionService
          .transformarRevisionesATabla(revisiones)
          .subscribe({
            next: (elementosTransformados) => {
              this.elementosTabla = elementosTransformados;
              this.hasMoreItems = revisiones.length === this.pageSize;
              this.isLoading = false;
            },
            error: (err) => {
              this.isLoading = false;
              this.isError = true;
              this.error = 'Error al transformar los elementos para la tabla';
              this.logger.error('Error al transformar elementos:', err);
            },
          });
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.error = 'Error al cargar las revisiones pendientes';
        this.logger.error('Error al cargar revisiones:', err);
      },
    });
  }

  onEnviarSolicitud(elemento: ElementoTabla): void {
    // Implementar la lógica para enviar solicitud
    console.log('Enviando solicitud para:', elemento);
  }

  onTableScroll(event: any): void {
    if (this.isLoadingMore || !this.hasMoreItems) return;

    this.isLoadingMore = true;
    this.currentPage++;

    this.revisionService.obtenerRevisionesPendientes().subscribe({
      next: (revisiones) => {
        if (revisiones.length === 0) {
          this.hasMoreItems = false;
          this.isLoadingMore = false;
          return;
        }

        this.transformacionService
          .transformarRevisionesATabla(revisiones)
          .subscribe({
            next: (elementosTransformados) => {
              this.elementosTabla = [
                ...this.elementosTabla,
                ...elementosTransformados,
              ];
              this.hasMoreItems = revisiones.length === this.pageSize;
              this.isLoadingMore = false;
            },
            error: (err) => {
              this.isLoadingMore = false;
              this.isError = true;
              this.error = 'Error al transformar los elementos para la tabla';
              this.logger.error('Error al transformar elementos:', err);
            },
          });
      },
      error: (err) => {
        this.isLoadingMore = false;
        this.isError = true;
        this.error = 'Error al cargar las revisiones pendientes';
        this.logger.error('Error al cargar revisiones:', err);
      },
    });
  }
}
