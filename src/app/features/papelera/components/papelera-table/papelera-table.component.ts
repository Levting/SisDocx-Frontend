import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ElementoPapelera } from '../../../../core/models/documentos/elemento-papelera-response.model';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';
import { UserService } from '../../../../core/services/user.service';
import { FechaUtilsService } from '../../../../core/utils/fecha-utils.service';
import { ElementoService } from '../../../../core/services/elemento.service';
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { catchError, forkJoin, of, filter, switchMap, take } from 'rxjs';
import { ApiError } from '../../../../core/models/errors/api-error.model';
import { ConfirmModalService } from '../../../../shared/services/confirm-modal.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-papelera-table',
  standalone: true,
  imports: [NgIf, SvgIconComponent, TableComponent, NgClass],
  templateUrl: './papelera-table.component.html',
})
export class PapeleraTableComponent implements OnInit, OnDestroy {
  public elementosTablaPapelera: ElementoTabla[] = [];
  public elementosPapeleraOriginales: ElementoPapelera[] = [];
  public cabeceras: string[] = [
    'Nombre',
    'Fecha Eliminado',
    'Eliminado',
    'Creado por',
    'Ubicación',
  ];
  public columnas: string[] = [
    'nombre',
    'fechaPapelera',
    'eliminadoPor',
    'creadoPor',
    'ruta',
  ];

  // Inyección de servicios
  public elementoService: ElementoService = inject(ElementoService);
  public usuarioService: UserService = inject(UserService);
  public fechaUtils: FechaUtilsService = inject(FechaUtilsService);
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );
  private confirmModalService: ConfirmModalService =
    inject(ConfirmModalService);
  private logger: LoggerService = inject(LoggerService);
  private authService: AuthService = inject(AuthService);

  public elementosSeleccionados: ElementoTabla[] = []; // Elementos seleccionados
  public isLoading: boolean = false; // Indicador de carga
  public isError: boolean = false;
  public error: string | null = null;

  ngOnInit(): void {
    this.logger.debug('Inicializando componente PapeleraTable');
    this.cargarPapelera();
  }

  ngOnDestroy(): void {
    this.logger.debug('Destruyendo componente PapeleraTable');
  }

  // Método para manejar el evento de selección de elementos
  onSeleccionCambiada(seleccionados: ElementoTabla[]): void {
    this.elementosSeleccionados = seleccionados;
  }

  // Limpiar la selección
  limpiarSeleccion(): void {
    this.elementosSeleccionados = [];
    this.elementosTablaPapelera.forEach((elemento) => {
      elemento.seleccionado = false; // Limpiar la selección de cada elemento
    });
  }

  cargarPapelera(): void {
    this.isLoading = true;
    this.isError = false;
    this.elementosTablaPapelera = [];

    this.authService.userLoginOn
      .pipe(
        filter((isLoggedIn) => isLoggedIn === true),
        take(1),
        switchMap(() => this.elementoService.obtenerPapelera())
      )
      .subscribe({
        next: (elementos: ElementoPapelera[]) => {
          this.elementosPapeleraOriginales = elementos;

          if (elementos.length === 0) {
            this.isLoading = false;
            return;
          }

          this.transformacionService
            .transformarPapelerasATabla(elementos)
            .subscribe({
              next: (elementosTransformados) => {
                this.elementosTablaPapelera = elementosTransformados;
                this.isLoading = false;
              },
              error: (err: ApiError) => {
                this.isLoading = false;
                this.isError = true;
                this.error =
                  err.message || 'No se pudieron transformar los elementos';
                this.logger.error('Error al transformar elementos:', err);
              },
            });
        },
        error: (err: ApiError) => {
          this.isLoading = false;
          this.isError = true;

          if (err.status === 401) {
            this.error =
              'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            this.logger.warn('Sesión expirada al cargar papelera');
          } else {
            this.error = err.message || 'No se pudo cargar la papelera';
            this.logger.error('Error al cargar papelera:', err);
          }
        },
      });
  }

  // Vaciar papelera
  vaciarPapelera(): void {
    const config = {
      title: 'Vaciar papelera',
      message:
        '¿Estás seguro de que deseas vaciar la papelera? Esta acción eliminará permanentemente todos los elementos y no se puede deshacer.',
      confirmText: 'Vaciar papelera',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config, () => {
      const requests = this.elementosTablaPapelera.map((elemento) => ({
        elementoId: elemento.columnas['elementoId'],
        elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      }));

      forkJoin(
        requests.map((request) =>
          this.elementoService.eliminarElemento(request).pipe(
            catchError((error: ApiError) => {
              this.logger.error(
                `Error al eliminar elemento ${request.elementoId}:`,
                error
              );
              return of(null);
            })
          )
        )
      ).subscribe({
        next: () => {
          this.limpiarSeleccion();
          this.cargarPapelera();
          this.logger.debug('Papelera vaciada correctamente');
        },
        error: (error: ApiError) => {
          this.isError = true;
          this.error = error.message || 'No se pudo vaciar la papelera';
          this.logger.error('Error al vaciar papelera:', error);
        },
      });
    });
  }

  // Restaurar elementos seleccionados
  restaurarSeleccionados(): void {
    this.restaurarElementosSeleccionados();
  }

  // Eliminar elementos seleccionados
  eliminarSeleccionados(): void {
    if (this.elementosSeleccionados.length === 0) return;

    const config = {
      title: 'Eliminar permanentemente',
      message: `¿Estás seguro de que deseas eliminar permanentemente ${this.elementosSeleccionados.length} elemento(s)? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config, () => {
      const requests = this.elementosSeleccionados.map((elemento) => ({
        elementoId: elemento.columnas['elementoId'],
        elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
      }));

      forkJoin(
        requests.map((request) =>
          this.elementoService.eliminarElemento(request).pipe(
            catchError((error) => {
              console.error(
                `Error al eliminar elemento ${request.elementoId}:`,
                error
              );
              return of(null);
            })
          )
        )
      ).subscribe({
        next: () => {
          this.limpiarSeleccion();
          this.cargarPapelera();
        },
        error: (error) => {
          this.isError = true;
          this.error = 'No se pudieron eliminar los elementos';
          console.error('Error al eliminar elementos:', error);
        },
      });
    });
  }

  /* Operaciones con los elementos desde el menu de acciones */

  restaurarElementosSeleccionados() {
    const request = this.elementosSeleccionados.map((elemento) => ({
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    }));

    forkJoin(
      request.map((request) => this.elementoService.restaurarElemento(request))
    ).subscribe({
      next: () => {
        this.limpiarSeleccion();
        this.cargarPapelera();
        this.logger.debug('Elementos restaurados correctamente');
      },
      error: (error: ApiError) => {
        this.isError = true;
        this.error = error.message || 'No se pudieron restaurar los elementos';
        this.logger.error('Error al restaurar elementos:', error);
      },
    });
  }
}
