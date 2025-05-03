import { Component, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { FavoritosDropdownComponent } from '../favoritos-dropdown/favoritos-dropdown.component';
import { ElementoService } from '../../../../core/services/elemento.service';
import { ElementoFavorito } from '../../../../core/models/documentos/elemento-favorito-reponse.model';
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';

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
  public elementosTabla: ElementoTabla[] = [];
  public elementosOriginales: ElementoFavorito[] = [];
  public cabeceras: string[] = ['Nombre', 'Fecha de favorito', 'Tipo'];
  public columnas: string[] = ['nombre', 'fechaFavorito', 'elemento'];

  // Inyección de servicios
  private elementoService: ElementoService = inject(ElementoService);
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );

  // Propiedades para la selección de elementos
  public elementosSeleccionados: ElementoTabla[] = [];

  // Indicadores de estado
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

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
}
