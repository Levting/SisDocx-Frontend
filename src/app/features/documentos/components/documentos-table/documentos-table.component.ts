import { Component, inject } from '@angular/core';
import { DocumentosDropdownComponent } from '../documentos-dropdown/documentos-dropdown.component';
import { NgClass, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoService } from '../../../../core/services/elemento.service';
import { Elemento } from '../../../../core/models/documentos/elemento';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ElementoTabla } from '../../../../core/models/table/elementoTabla';
import { DocumentosBreadcrumComponent } from '../documentos-breadcrum/documentos-breadcrum.component';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { FechaUtilsService } from '../../../../core/utils/fecha-utils.service';
import { CarpetaService } from '../../../../core/services/carpeta.service';
import { CarpetaActualService } from '../../../../core/services/carpeta-actual.service';
import { Carpeta } from '../../../../core/models/documentos/carpeta';

@Component({
  selector: 'app-documentos-table',
  standalone: true,
  imports: [
    DocumentosDropdownComponent,
    NgClass,
    NgIf,
    SvgIconComponent,
    TableComponent,
    DocumentosBreadcrumComponent,
  ],
  templateUrl: './documentos-table.component.html',
})
export class DocumentosTableComponent {
  // Propiedades del componente
  public elementosTabla: ElementoTabla[] = []; // Datos de la tabla
  public elementosOriginales: Elemento[] = []; // Elementos originales
  public cabeceras: string[] = [
    'Nombre',
    'Creado por',
    'Creado el',
    'Ubicación',
  ];
  public columnas: string[] = ['nombre', 'creadoPor', 'creadoEl', 'ruta'];

  // Inyección de servicios
  private elementoService: ElementoService = inject(ElementoService);
  private carpetaService: CarpetaService = inject(CarpetaService);
  private usuarioService: UserService = inject(UserService);
  private fechaUtils: FechaUtilsService = inject(FechaUtilsService);
  private carpetaActualService: CarpetaActualService =
    inject(CarpetaActualService);

  // Propiedades para la selección de elementos
  public elementosSeleccionados: ElementoTabla[] = [];

  // Navegacion
  public ruta: { nombre: string; elementoId: number; elemento: 'CARPETA' }[] = [];

  // Indicadores de estado
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

  /* Inicializador del Componente */
  ngOnInit(): void {
    if (this.elementosTabla.length === 0) {
      this.cargarContenido(1); // Cargar contenido inicial (raiz)
    }

    // Suscribirse a eventos de recarga de contenido
    this.carpetaActualService.recargarContenido$.pipe().subscribe(() => {
      const carpetaActual = this.carpetaActualService.obtenerCarpetaActual();
      if (carpetaActual) {
        this.cargarContenido(carpetaActual.elementoId);
      }
    });

    // Suscribirse a eventos de recarga de contenido de una carpeta específica
    this.carpetaService.recargarContenido$
      .pipe()
      .subscribe((carpetaId: number) => {
        // Si estamos viendo la carpeta que debemos recargar
        if (
          this.ruta.length > 0 &&
          this.ruta[this.ruta.length - 1].elementoId === carpetaId
        ) {
          this.cargarContenido(carpetaId);
        }
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
    this.elementosTabla = []; // <<-- Limpia la tabla al entrar

    this.elementoService.obtenerContenidoCarpeta(carpetaId).subscribe({
      next: (elementos: Elemento[]) => {
        if (nombre) {
          this.ruta.push({ nombre, elementoId: carpetaId, elemento: 'CARPETA' });
        } else if (carpetaId === 1) {
          this.ruta = [];
        }

        this.elementosOriginales = elementos;

        // Si está vacío, terminar de una vez
        if (elementos.length === 0) {
          this.isLoading = false;
          return;
        }

        this.transformarElementoEnTablaElemento(elementos).subscribe(
          (filas) => {
            this.elementosTabla = filas;
            this.isLoading = false;
          }
        );
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.error =
          'Ocurrió un problema al cargar los archivos. Intenta de nuevo más tarde.';
      },
    });
  }

  navegarA(index: number): void {
    const carpeta  = this.ruta[index];
    this.ruta = this.ruta.slice(0, index + 1); // Truncar ruta

    // Limpiar selección al navegar usando el breadcrumb
    this.limpiarSeleccion();

    // Cargar contenido de esa carpeta
    this.cargarContenido(carpeta.elementoId, carpeta.nombre); 

    // Actualizar la carpeta actual en el servicio cuando se navega por el breadcrumb
    this.elementoService
      .obtenerDetallesElemento(carpeta.elementoId, carpeta.elemento)
      .subscribe((elemento) => {
        if (elemento) {
          // Cast elemento to Carpeta since we know it's a folder in this context
          const carpeta = elemento as Carpeta;
          this.carpetaActualService.actualizarCarpetaActual(carpeta);
        }
      });
  }

  onDobleClickElemento(elemento: ElementoTabla): void {
    if (elemento.columnas['elemento'] === 'CARPETA') {
      console.log('Doble clic en carpeta:', elemento.columnas);

      // Limpiar selección al cambiar de carpeta
      this.limpiarSeleccion();

      this.cargarContenido(
        elemento.columnas['elementoId'],
        elemento.columnas['nombre']
      );

      // Actualizar la carpeta actual en el servicio
      this.carpetaActualService.actualizarCarpetaActual(
        elemento.columnas as Carpeta
      );
    } else {
      // Aquí se manejaría la previsualización del archivo
      console.log('Previsualizar archivo:', elemento);
      // Aquí podrías disparar un modal, abrir un visor, etc.
    }
  }

  private transformarElementoEnTablaElemento(
    elementos: Elemento[]
  ): Observable<ElementoTabla[]> {
    const observables = elementos.map((elemento) => {
      const obsCreadoPor = this.usuarioService
        .obtenerUsuarioId(elemento.creadoPor)
        .pipe(
          map((u) => `${u.nombre} ${u.apellido}`),
          catchError(() => of('Desconocido'))
        );

      const obsRuta = this.construirRutaDesdeIds(elemento.ruta.map(Number));

      return forkJoin([obsCreadoPor, obsRuta]).pipe(
        map(([creadoPor, ruta]) => ({
          columnas: {
            elementoId: elemento.elementoId,
            elemento: elemento.elemento,
            nombre: elemento.nombre,
            carpetaPadreId: elemento.carpetaPadreId,
            creadoPor,
            creadoEl: this.fechaUtils.formatear(elemento.creadoEl),
            estado: elemento.estado,
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
      this.elementoService.obtenerDetallesElemento(id, 'CARPETA').pipe(
        map((carpeta) => carpeta?.nombre || 'Desconocido'),
        catchError(() => of('Desconocido'))
      )
    );

    return forkJoin(observables).pipe(map((nombres) => nombres.join(' / ')));
  }

  /* Operaciones con Elementos */
  papeleraSeleccionados(): void {
    this.papeleraElementosSeleccionados();
  }

  favoritoSeleccionados(): void {
    this.favoritoElementosSeleccionados();
  }

  descargarSeleccionados(): void {
    this.descargarElementosSeleccionados();
  }

  moverSeleccionados(): void {
    this.moverElementosSeleccionados();
  }

  copiarSeleccionados(): void {
    this.copiarElementosSeleccionados();
  }

  // Funciones de acciones de los elementos seleccionados

  papeleraElementosSeleccionados(): void {
    console.log('Papelera:', this.elementosSeleccionados);
  }

  favoritoElementosSeleccionados(): void {
    console.log('Favorito:', this.elementosSeleccionados);
  }

  descargarElementosSeleccionados(): void {
    console.log('Descargar:', this.elementosSeleccionados);
  }

  moverElementosSeleccionados(): void {
    console.log('Mover:', this.elementosSeleccionados);
  }

  copiarElementosSeleccionados(): void {
    console.log('Copiar:', this.elementosSeleccionados);
  }

  // Manejar el evento de ir a la raíz
  cargarContenidoRaiz(): void {
    // Limpiar selección al volver a la raíz
    this.limpiarSeleccion();

    // Cargar contenido de la carpeta raíz (ID 1)
    this.cargarContenido(1);

    // Obtener la carpeta raíz y actualizar la carpeta actual
    this.elementoService.obtenerDetallesElemento(1, 'CARPETA').subscribe((elemento) => {
      if (elemento) {
        this.carpetaActualService.actualizarCarpetaActual(elemento as Carpeta);
      }
    });
  }
}
