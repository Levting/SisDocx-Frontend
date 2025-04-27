import { FechaUtilsService } from './../../../../core/utils/fecha-utils.service';
import { ElementoTabla } from '../../../../core/models/table/elementoTabla';
import { Component, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { FavoritosDropdownComponent } from '../favoritos-dropdown/favoritos-dropdown.component';
import { ElementoService } from '../../../../core/services/elemento.service';
import { ElementoFavorito } from '../../../../core/models/documentos/elementoFavoritoReponse';
import { of } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-favoritos-table',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    SvgIconComponent,
    TableComponent,
    FavoritosDropdownComponent,
  ],
  templateUrl: './favoritos-table.component.html',
})
export class FavoritosTableComponent {
  public elementosTablaFavorito: ElementoTabla[] = [];
  public elementosFavoritosOriginal: ElementoFavorito[] = [];
  public cabeceras: string[] = ['Nombre', 'Añadido el', 'Modificada'];
  public columnas: string[] = ['nombre', 'creadoEl', 'modificadoEl'];

  // Inyección de Servicios
  public elementoService: ElementoService = inject(ElementoService);
  public fechaUtilsService: FechaUtilsService = inject(FechaUtilsService);

  // Estado de carga
  public isLoading: boolean = false; // Indicador de carga
  public isError: boolean = false; // Indicador de error
  public errorMessage: string | null = null; // Mensaje de error

  // Variables de componente
  public elementosSeleccionados: ElementoTabla[] = []; // Elementos seleccionados

  ngOnInit(): void {
    this.cargarElementosFavoritos(); // Cargar elementos de favoritos al iniciar
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
  }

  cargarElementosFavoritos(): void {
    this.isLoading = true;
    this.isError = false;
    this.errorMessage = null;

    this.elementoService.obtenerFavoritos().subscribe({
      next: (elementosFavorito: ElementoFavorito[]) => {
        this.elementosFavoritosOriginal = elementosFavorito;

        this.transformarFavoritosEnTablaFilas(elementosFavorito).subscribe({
          next: (filas: ElementoTabla[]) => {
            this.elementosTablaFavorito = filas; // Asignar filas a la tabla
          },
          error: () => {
            this.isLoading = false; // Finalizar carga
            this.isError = true; // Indicar error
            this.errorMessage = 'Error al cargar los elementos favoritos'; // Mensaje de error
          },
        });
        this.isLoading = false; // Finalizar carga
      },
      error: (error) => {
        this.isLoading = false; // Finalizar carga
        this.isError = true; // Indicar error
        this.errorMessage = 'Error al cargar los elementos favoritos'; // Mensaje de error
      },
    });
  }

  eliminarElementosFavoritos(): void {
    console.log('Eliminar:', this.elementosSeleccionados);
  }

  private transformarFavoritosEnTablaFilas(
    elementos: ElementoFavorito[]
  ): Observable<ElementoTabla[]> {
    const filas: ElementoTabla[] = elementos.map((elemento) => {
      return {
        columnas: {
          elementoId: elemento.elementoId,
          elemento: elemento.elemento,
          nombre: elemento.nombre,
          fechaFavorito: this.fechaUtilsService.formatear(
            elemento.fechaFavorito
          ),
        },
        seleccionado: false,
      };
    });

    // Retornamos un Observable con los resultados de las filas.
    return of(filas);
  }
}
