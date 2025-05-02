import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ElementoPapelera } from '../../../../core/models/documentos/elementoPapeleraResponse';
import { ElementoTabla } from '../../../../core/models/table/elementoTabla';
import { UserService } from '../../../../core/services/user.service';
import { FechaUtilsService } from '../../../../core/utils/fecha-utils.service';
import { ElementoService } from '../../../../core/services/elemento.service';
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { forkJoin } from 'rxjs';
import { ApiError } from '../../../../core/models/errors/apiError';

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
  public elementoService: ElementoService = inject(ElementoService); // Servicio de elemento
  public usuarioService: UserService = inject(UserService); // Servicio de usuario
  public fechaUtils: FechaUtilsService = inject(FechaUtilsService);
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );

  public elementosSeleccionados: ElementoTabla[] = []; // Elementos seleccionados
  public isLoading: boolean = false; // Indicador de carga
  public isError: boolean = false;
  public error: string | null = null;

  ngOnInit(): void {
    this.cargarPapelera();
  }

  ngOnDestroy(): void {}

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
    this.elementosTablaPapelera = []; // Limpia la tabla al entrar

    this.elementoService.obtenerPapelera().subscribe({
      next: (elementos: ElementoPapelera[]) => {
        this.elementosPapeleraOriginales = elementos;

        // Si está vacío, terminar de una vez
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
            error: (err) => {
              this.isLoading = false;
              this.isError = true;
              this.error =
                'Ocurrió un problema al transformar los elementos. Intenta de nuevo más tarde.';
            },
          });
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.error =
          'Ocurrió un problema al cargar la papelera. Intenta de nuevo más tarde.';
      },
    });
  }

  // Vaciar papelera
  vaciarPapelera(): void {
    this.vaciarElementosPapelera();
  }

  // Restaurar elementos seleccionados
  restaurarSeleccionados(): void {
    this.restaurarElementosSeleccionados();
  }

  // Eliminar elementos seleccionados
  eliminarSeleccionados(): void {
    this.eliminarElementosSeleccionados();
  }

  /* Operaciones con los elementos desde el menu de acciones */

  vaciarElementosPapelera(): void {
    console.log('Vaciar:', this.elementosTablaPapelera);
  }

  eliminarElementosSeleccionados(): void {
    /* if (this.elementosSeleccionados.length === 0) return;

    this.isLoading = true;

    const eliminaciones = this.elementosSeleccionados.map((elementoPapelera) =>
      this.carpetaService.eliminarCarpetaId(
        elementoPapelera.columnas['elementoId']
      )
    );

    forkJoin(eliminaciones).subscribe({
      next: () => {
        console.log('Todos los elementos eliminados');
        this.limpiarSeleccion(); // 🧼 Limpiar selección
        this.cargarPapelera(); // 🔄 Recargar lista
      },
      error: (error) => {
        console.error('Error al eliminar elementos:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    }); */

    console.log('Eliminar:', this.elementosSeleccionados);
  }

  restaurarElementosSeleccionados() {
    console.log('Restaurar:', this.elementosSeleccionados);
    const request = this.elementosSeleccionados.map((elemento) => ({
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    }));

    // Ejecutar todas las peticiones en paralelo
    forkJoin(
      request.map((request) => this.elementoService.restaurarElemento(request))
    ).subscribe({
      next: () => {
        this.limpiarSeleccion();
        this.cargarPapelera();
      },
      error: (error: ApiError) => {
        console.log(error.message);
      },
    });
  }
}
