import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { CarpetaService } from '../../../../core/services/carpeta.service';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ElementoPapelera } from '../../../../core/models/documentos/elementoPapeleraResponse';
import { ElementoTabla } from '../../../../core/models/documentos/elementoTabla';
import { UserService } from '../../../../core/services/user.service';
import { FechaUtilsService } from '../../../../core/utils/fecha-utils.service';
import { ElementoService } from '../../../../core/services/elemento.service';

@Component({
  selector: 'app-papelera-table',
  standalone: true,
  imports: [NgIf, SvgIconComponent, TableComponent, NgClass],
  templateUrl: './papelera-table.component.html',
})
export class PapeleraTableComponent implements OnInit, OnDestroy {
  public elementosTablaPapelera: ElementoTabla[] = [];
  private elementosPapeleraOriginales: ElementoPapelera[] = [];

  public cabeceras: string[] = [
    'Nombre',
    'Eliminado el',
    'Eliminado por',
    'Creado por',
    'Ubicacion Original',
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
  public carpetaService: CarpetaService = inject(CarpetaService); // Servicio de carpeta
  public usuarioService: UserService = inject(UserService); // Servicio de usuario
  public fechaUtils: FechaUtilsService = inject(FechaUtilsService);

  public elementosSeleccionados: ElementoTabla[] = []; // Elementos seleccionados
  public isLoading: boolean = false; // Indicador de carga

  ngOnInit(): void {
    this.cargarElementosPapelera(); // Cargar elementos de la papelera al iniciar
  }

  ngOnDestroy(): void {}

  // Método para manejar el evento de selección de elementos
  onSeleccionCambiada(seleccionados: ElementoTabla[]): void {
    this.elementosSeleccionados = seleccionados;
  }

  // Restaurar elementos seleccionados
  restaurarSeleccionados(): void {
    this.restaurarElementosSeleccionados(); // Llamar al método para restaurar elementos seleccionados
  }

  // Eliminar elementos seleccionados
  eliminarSeleccionados(): void {
    this.eliminarElementosSeleccionados(); // Llamar al método para eliminar elementos seleccionados
  }

  // Limpiar la selección
  limpiarSeleccion(): void {
    this.elementosSeleccionados = [];
    this.elementosTablaPapelera.forEach((elemento) => {
      elemento.seleccionado = false; // Limpiar la selección de cada elemento
    });
  }

  vaciarPapelera(): void {
    console.log('Vaciar papelera');
  }

  /**
   * Cargar elementos de la papelera desde el servicio
   */

  cargarElementosPapelera(): void {
    this.isLoading = true;

    this.elementoService.obtenerPapelera().subscribe({
      next: (elementosPapalera: ElementoPapelera[]) => {
        //1. Guarda los originales si los necesitas
        this.elementosPapeleraOriginales = elementosPapalera;

        //2. Convierte al tipo que maneja la tabla
        this.transformarPapeleraEnTablaFilas(elementosPapalera).subscribe(
          (filas) => {
            this.elementosTablaPapelera = filas;
            this.isLoading = false;
          }
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  /**
   * Eliminar los elementos seleccionados de la papelera
   * @param elementos - Elementos a eliminar
   */
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
        this.cargarElementosPapelera(); // 🔄 Recargar lista
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
    console.log('Restaurar:', this.elementosTablaPapelera);
  }

  private transformarPapeleraEnTablaFilas(
    elementos: ElementoPapelera[]
  ): Observable<ElementoTabla[]> {
    const observables = elementos.map((elemento) => {
      const obsEliminadoPor = this.usuarioService
        .obtenerUsuarioId(elemento.eliminadoPor)
        .pipe(
          map((u) => `${u.nombre} ${u.apellido}`),
          catchError(() => of('Desconocido'))
        );

      const obsCreadoPor = this.usuarioService
        .obtenerUsuarioId(elemento.creadoPor)
        .pipe(
          map((u) => `${u.nombre} ${u.apellido}`),
          catchError(() => of('Desconocido'))
        );

      const obsRuta = this.construirRutaDesdeIds(elemento.ruta.map(Number));

      return forkJoin([obsEliminadoPor, obsCreadoPor, obsRuta]).pipe(
        map(([eliminadoPor, creadoPor, ruta]) => ({
          columnas: {
            elementoId: elemento.elementoId,
            nombre: elemento.nombre,
            fechaPapelera: this.fechaUtils.formatear(elemento.fechaPapelera),
            eliminadoPor,
            creadoPor,
            ruta,
          },
          seleccionado: false,
        }))
      );
    });

    return forkJoin(observables);
  }

  private construirRutaDesdeIds(ids: number[]) {
    if (!ids || ids.length === 0) return of('Ubicación desconocida');

    const observables = ids.map((id) =>
      this.carpetaService.obtenerCarpetaPorId(id).pipe(
        map((carpeta) => carpeta?.nombre || 'Desconocido'),
        catchError(() => of('Desconocido'))
      )
    );

    return forkJoin(observables).pipe(map((nombres) => nombres.join(' / ')));
  }
}
