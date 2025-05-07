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
import { DocumentosPreviewModalComponent } from '../../../documentos/components/documentos-preview-modal/documentos-preview-modal.component';
import { MarcarElementoFavoritoRequest } from '../../../../core/models/request/elemento-request.model';
import { ApiError } from '../../../../core/models/errors/api-error.model';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

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
    this.ruta = []; // Limpiar la ruta al cargar favoritos inicialmente

    this.elementoService.obtenerFavoritos().subscribe({
      next: (elementos: ElementoFavorito[]) => {
        this.elementosOriginales = elementos;

        if (elementos.length === 0) {
          this.isLoading = false;
          return;
        }

        this.elementosTabla =
          this.transformacionService.transformarFavoritosATabla(elementos);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.error =
          'Ocurrió un problema al cargar los favoritos. Intenta de nuevo más tarde.';
      },
    });
  }

  eliminarElementosFavoritos(): void {
    console.log('Eliminar:', this.elementosSeleccionados);
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

            // Actualizar la ruta
            this.ruta.push({
              nombre: elemento.columnas['nombre'],
              elementoId: elemento.columnas['elementoId'],
              elemento: 'CARPETA',
            });

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

  cargarContenido(carpetaId: number, nombre?: string): void {
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.elementosTabla = []; // Limpia la tabla al entrar

    this.elementoService.obtenerContenidoCarpeta(carpetaId).subscribe({
      next: (elementos: Elemento[]) => {
        this.elementosOriginales = elementos as ElementoFavorito[];

        if (elementos.length === 0) {
          this.isLoading = false;
          return;
        }

        this.elementosTabla =
          this.transformacionService.transformarFavoritosATabla(
            elementos as ElementoFavorito[]
          );
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.error =
          'Ocurrió un problema al cargar los favoritos. Intenta de nuevo más tarde.';
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
        // Recargar la lista de favoritos
        this.cargarFavoritos();
      },
      error: (error: ApiError) => {
        console.error('Error al cambiar estado de favorito:', error.message);
        this.isError = true;
        this.error = 'No se pudo actualizar el estado de favorito';
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

  cargarContenidoRaiz(): void {
    // Limpiar selección al volver a la raíz
    this.limpiarSeleccion();

    // Cargar favoritos en lugar del contenido de documentos
    this.cargarFavoritos();

    // Reiniciar la carpeta actual
    this.carpetaActualService.reiniciarCarpetaActual();
  }
}
