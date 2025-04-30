import { Component, inject, OnInit, TemplateRef } from '@angular/core';
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
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import {
  MoverElementoPapeleraRequest,
  MarcarElementoFavoritoRequest,
  RenombrarElementoRequest,
} from '../../../../core/models/request/elemento-request';
import { ApiError } from '../../../../core/models/errors/apiError';

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
    ModalComponent,
  ],
  templateUrl: './documentos-table.component.html',
})
export class DocumentosTableComponent implements OnInit {
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
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );

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
          this.ruta.push({
            nombre,
            elementoId: carpetaId,
            elemento: 'CARPETA',
          });
        } else if (carpetaId === 1) {
          this.ruta = [];
        }

        this.elementosOriginales = elementos;

        // Si está vacío, terminar de una vez
        if (elementos.length === 0) {
          this.isLoading = false;
          return;
        }

        this.transformacionService
          .transformarDocumentosATabla(elementos)
          .subscribe((filas) => {
            this.elementosTabla = filas;
            this.isLoading = false;
          });
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
    const carpeta = this.ruta[index];
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
    const requests = this.elementosSeleccionados.map((elemento) => ({
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    }));

    // Ejecutar todas las peticiones en paralelo
    forkJoin(
      requests.map((request) =>
        this.elementoService.moverElementoPapelera(request)
      )
    ).subscribe({
      next: () => {
        this.limpiarSeleccion();
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      },
      error: (error) => {
        this.isError = true;
        this.error = 'No se pudieron mover los elementos a la papelera';
        console.error('Error al mover elementos a papelera:', error);
      },
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
    // Implementar lógica de descarga múltiple
    console.log(
      'Descargar elementos seleccionados:',
      this.elementosSeleccionados
    );
  }

  moverSeleccionados(): void {
    // TODO: Implementar lógica de mover elementos
    console.log('Mover elementos seleccionados:', this.elementosSeleccionados);
  }

  copiarSeleccionados(): void {
    // TODO: Implementar lógica de copiar elementos
    console.log('Copiar elementos seleccionados:', this.elementosSeleccionados);
  }

  // Manejar el evento de ir a la raíz
  cargarContenidoRaiz(): void {
    // Limpiar selección al volver a la raíz
    this.limpiarSeleccion();

    // Cargar contenido de la carpeta raíz (ID 1)
    this.cargarContenido(1);

    // Obtener la carpeta raíz y actualizar la carpeta actual
    this.elementoService
      .obtenerDetallesElemento(1, 'CARPETA')
      .subscribe((elemento) => {
        if (elemento) {
          this.carpetaActualService.actualizarCarpetaActual(
            elemento as Carpeta
          );
        }
      });
  }

  // Métodos para acciones individuales desde el dropdown
  onPapeleraIndividual(elemento: ElementoTabla): void {
    console.log('Mover a Papelera Individual:', elemento);

    const request: MoverElementoPapeleraRequest = {
      elementoId: elemento.columnas['elementoId'],
      elemento: elemento.columnas['elemento'] as 'CARPETA' | 'ARCHIVO',
    };

    this.elementoService.moverElementoPapelera(request).subscribe({
      next: () => {
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
      },
      error: (error: ApiError) => {
        this.isError = true;
        this.error = error.message;
        console.error('Error al mover a papelera:', error);
        console.log('Error:', error.error);
      },
    });
  }

  onFavoritoIndividual(elemento: ElementoTabla): void {
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

  onDescargarIndividual(elemento: ElementoTabla): void {
    // Implementar lógica de descarga
    console.log('Descargar elemento:', elemento);
  }

  onCambiarNombreIndividual(elemento: ElementoTabla): void {
    this.elementoARenombrar = elemento;
    this.isOpenRenombrarModal = true;
  }

  onRenombrarSubmit(nuevoNombre: string): void {
    if (!this.elementoARenombrar) return;

    const request: RenombrarElementoRequest = {
      elementoId: this.elementoARenombrar.columnas['elementoId'],
      elemento: this.elementoARenombrar.columnas['elemento'] as
        | 'CARPETA'
        | 'ARCHIVO',
      nuevoNombre: nuevoNombre,
    };

    this.elementoService.renombrarElemento(request).subscribe({
      next: () => {
        this.cargarContenido(this.ruta[this.ruta.length - 1]?.elementoId || 1);
        this.isOpenRenombrarModal = false;
        this.elementoARenombrar = null;
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
}
