import { Component, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { FavoritosDropdownComponent } from '../favoritos-dropdown/favoritos-dropdown.component';
import { ElementoService } from '../../../../core/services/elemento.service';
import { ElementoFavorito } from '../../../../core/models/documentos/elemento-favorito-reponse.model';
import { Elemento } from '../../../../core/models/documentos/elemento.model';
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';
import { CarpetaActualService } from '../../../../core/services/carpeta-actual.service';
import { Carpeta } from '../../../../core/models/documentos/carpeta.model';
import { MarcarElementoFavoritoRequest } from '../../../../core/models/request/elemento-request.model';
import { ApiError } from '../../../../core/models/errors/api-error.model';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { LoggerService } from '../../../../core/services/logger.service';
import { AuthService } from '../../../../core/services/auth.service';
import { filter, switchMap, take } from 'rxjs';
import { DocumentosPreviewModalComponent } from '../../../documentos/documentos-admin/components/documentos-preview-modal/documentos-preview-modal.component';

@Component({
  selector: 'app-favoritos-table',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    SvgIconComponent,
    TableComponent,
    FavoritosDropdownComponent,
    DocumentosPreviewModalComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './favoritos-table.component.html',
})
export class FavoritosTableComponent {
  public elementosTabla: ElementoTabla[] = [];
  public elementosOriginales: ElementoFavorito[] = [];
  public cabeceras: string[] = ['Nombre', 'Fecha de favorito', 'Tipo'];
  public columnas: string[] = ['nombre', 'fechaFavorito', 'elemento'];

  // Inyección de servicios
  private elementoService: ElementoService = inject(ElementoService);
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );
  private carpetaActualService: CarpetaActualService =
    inject(CarpetaActualService);
  private logger: LoggerService = inject(LoggerService);
  private authService: AuthService = inject(AuthService);

  // Propiedades para la selección de elementos
  public elementosSeleccionados: ElementoTabla[] = [];

  // Indicadores de estado
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

  // Propiedades para el modal de previsualización
  public isOpenPreviewModal: boolean = false;
  public elementoAPrevisualizar: ElementoTabla | null = null;

  // Navegacion
  public ruta: { nombre: string; elementoId: number; elemento: 'CARPETA' }[] =
    [];

  /* Inicializador del Componente */
  ngOnInit(): void {
    this.cargarFavoritos();
  }

  ngOnDestroy(): void {}

  // Método para manejar el evento de selección de elementos
  onSeleccionCambiada(seleccionados: ElementoTabla[]): void {
    this.elementosSeleccionados = seleccionados;
  }

  eliminarFavoritos(): void {
    this.eliminarElementosFavoritos();
  }

  // Limpiar la selección
  limpiarSeleccion(): void {
    this.elementosSeleccionados = [];
    this.elementosTabla.forEach((elemento) => {
      elemento.seleccionado = false;
    });
  }

  cargarFavoritos(): void {
    this.isLoading = true;
    this.isError = false;
    this.elementosTabla = [];
    this.ruta = [];

    this.authService.userLoginOn
      .pipe(
        filter((isLoggedIn) => isLoggedIn === true),
        take(1),
        switchMap(() => this.elementoService.obtenerFavoritos())
      )
      .subscribe({
        next: (elementos: ElementoFavorito[]) => {
          this.elementosOriginales = elementos;
          this.elementosTabla =
            this.transformacionService.transformarFavoritosATabla(elementos);
          this.isLoading = false;
        },
        error: (err: ApiError) => {
          this.isLoading = false;
          this.isError = true;
          this.error = 'No se pudieron cargar los favoritos';
          this.logger.error('Error al cargar favoritos:', err);
        },
      });
  }

  eliminarElementosFavoritos(): void {
    console.log('Eliminar:', this.elementosSeleccionados);
  }

  onDobleClickElemento(elemento: ElementoTabla): void {
    if (elemento.columnas['elemento'] === 'CARPETA') {
      this.limpiarSeleccion();

      this.elementoService
        .obtenerDetallesElemento(elemento.columnas['elementoId'], 'CARPETA')
        .subscribe({
          next: (carpetaDetalles) => {
            this.carpetaActualService.actualizarCarpetaActual(
              carpetaDetalles as Carpeta
            );
            this.ruta.push({
              nombre: elemento.columnas['nombre'],
              elementoId: elemento.columnas['elementoId'],
              elemento: 'CARPETA',
            });
            this.cargarContenido(
              elemento.columnas['elementoId'],
              elemento.columnas['nombre']
            );
          },
          error: (error) => {
            this.isError = true;
            this.error = 'No se pudo acceder a la carpeta';
            this.logger.error('Error al acceder a carpeta:', error);
          },
        });
    } else {
      this.elementoAPrevisualizar = elemento;
      this.isOpenPreviewModal = true;
    }
  }

  onPreviewClose(): void {
    this.isOpenPreviewModal = false;
    this.elementoAPrevisualizar = null;
  }

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
          this.elementosOriginales = elementos as ElementoFavorito[];
          this.elementosTabla =
            this.transformacionService.transformarFavoritosATabla(
              elementos as ElementoFavorito[]
            );
          this.isLoading = false;
        },
        error: (err: ApiError) => {
          this.isLoading = false;
          this.isError = true;
          this.error = 'No se pudo cargar el contenido de la carpeta';
          this.logger.error('Error al cargar contenido:', err);
        },
      });
  }

  onToggleFavorito(elemento: ElementoTabla): void {
    const request: MarcarElementoFavoritoRequest = {
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    };

    this.elementoService.marcarElementoFavorito(request).subscribe({
      next: () => {
        this.cargarFavoritos();
      },
      error: (error: ApiError) => {
        this.isError = true;
        this.error = 'No se pudo actualizar el estado de favorito';
        this.logger.error('Error al actualizar favorito:', error);
      },
    });
  }

  navegarA(index: number): void {
    if (index >= this.ruta.length || index === this.ruta.length - 1) {
      return;
    }

    const carpeta = this.ruta[index];
    this.ruta = this.ruta.slice(0, index + 1);
    this.limpiarSeleccion();

    this.elementoService
      .obtenerDetallesElemento(carpeta.elementoId, 'CARPETA')
      .subscribe({
        next: (carpetaDetalles) => {
          this.carpetaActualService.actualizarCarpetaActual(
            carpetaDetalles as Carpeta
          );
          this.cargarContenido(carpeta.elementoId, carpeta.nombre);
        },
        error: (error) => {
          this.isError = true;
          this.error = 'No se pudo acceder a la carpeta';
          this.logger.error('Error al navegar a carpeta:', error);
        },
      });
  }

  cargarContenidoRaiz(): void {
    // Limpiar selección al volver a la raíz
    this.limpiarSeleccion();

    // Cargar favoritos en lugar del contenido de documentos
    this.cargarFavoritos();

    // Reiniciar la carpeta actual
    this.carpetaActualService.reiniciarCarpetaActual();
  }
}
