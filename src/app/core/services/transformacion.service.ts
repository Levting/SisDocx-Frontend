import { inject, Injectable } from '@angular/core';
import { ElementoTabla } from '../../shared/models/table/elemento-tabla.model';
import { Elemento } from '../models/documentos/elemento.model';
import { ElementoFavorito } from '../models/documentos/elemento-favorito-reponse.model';
import { ElementoPapelera } from '../models/documentos/elemento-papelera-response.model';
import { UserService } from './user.service';
import { FechaUtilsService } from '../utils/fecha-utils.service';
import { Observable, forkJoin, map, of } from 'rxjs';
import { Archivo } from '../models/documentos/archivo.model';
import { Carpeta } from '../models/documentos/carpeta.model';
import { Revision } from '../models/revision/elemento-revision.model';
import { CampanaMedicion } from '../models/documentos/campana-medicion.model';
@Injectable({
  providedIn: 'root',
})
export class TransformacionService {
  // Inyectar el servicio de usuario y el servicio de fecha
  private fechaUtils = inject(FechaUtilsService);

  transformarDocumentosATabla(
    elementos: Elemento[]
  ): Observable<ElementoTabla[]> {
    return of(
      elementos.map((elemento) => this.transformarDocumentoATabla(elemento))
    );
  }

  transformarDocumentoATabla(elemento: Elemento): ElementoTabla {
    return {
      columnas: {
        elementoId: elemento.elementoId,
        elemento: elemento.elemento,
        nombre: elemento.nombre,
        carpetaPadreId: elemento.carpetaPadreId,
        carpetaPadre: elemento.carpetaPadre,
        creadoPorId: elemento.creadoPorId,
        creadoPor: elemento.creadoPor,
        creadoEl: elemento.creadoEl
          ? this.fechaUtils.formatear(elemento.creadoEl)
          : 'N/A',
        estado: elemento.estado,
        equipoDistribucion: elemento.equipoDistribucion,
        ruta: elemento.ruta.join(' / '),
        estadoVisibilidad: elemento.estadoVisibilidad,

        ...(elemento.elemento === 'CARPETA'
          ? {
              tamano: (elemento as unknown as Carpeta).cantidadElementos,
            }
          : {}),
        ...(elemento.elemento === 'ARCHIVO'
          ? {
              extension: (elemento as unknown as Archivo).extension,
              tamano: this.formatearTamano(
                (elemento as unknown as Archivo).tamano
              ),
              tipoFusion: (elemento as unknown as Archivo).tipoFusion,
              tipoContenido: (elemento as unknown as Archivo).tipoContenido,
            }
          : {}),
      },
      seleccionado: false,
    };
  }

  transformarFavoritosATabla(elementos: ElementoFavorito[]): ElementoTabla[] {
    return elementos.map((elemento) =>
      this.transformarFavoritoATabla(elemento)
    );
  }

  transformarFavoritoATabla(elemento: ElementoFavorito): ElementoTabla {
    return {
      columnas: {
        elementoId: elemento.elementoId,
        elemento: elemento.elemento,
        nombre: elemento.nombre,
        fechaFavorito:
          this.fechaUtils.formatear(elemento.fechaFavorito) || 'N/A',
        carpetaPadreId: elemento.carpetaPadreId,
        estado: elemento.estado,
        ...(elemento.elemento === 'CARPETA'
          ? {
              cantidadElementos: (elemento as unknown as Carpeta)
                .cantidadElementos,
            }
          : {}),
        ...(elemento.elemento === 'ARCHIVO'
          ? {
              extension: (elemento as unknown as Archivo).extension,
              tamano: (elemento as unknown as Archivo).tamano,
              tipoFusion: (elemento as unknown as Archivo).tipoFusion,
              tipoContenido: (elemento as unknown as Archivo).tipoContenido,
            }
          : {}),
      },
      seleccionado: false,
    };
  }

  transformarPapelerasATabla(
    elementos: ElementoPapelera[]
  ): Observable<ElementoTabla[]> {
    return of(
      elementos.map((elemento) => this.transformarATablaPapelera(elemento))
    );
  }

  transformarATablaPapelera(elemento: ElementoPapelera): ElementoTabla {
    return {
      columnas: {
        elementoId: elemento.elementoId,
        elemento: elemento.elemento,
        nombre: elemento.nombre,
        carpetaPadreId: elemento.carpetaPadreId,
        carpetaPadre: elemento.carpetaPadre,
        creadoPorId: elemento.creadoPorId,
        creadoPor: elemento.creadoPor,
        creadoEl: elemento.creadoEl
          ? this.fechaUtils.formatear(elemento.creadoEl)
          : 'N/A',
        estado: elemento.estado,
        equipoDistribucion: elemento.equipoDistribucion,
        ruta: elemento.ruta.join(' / '),
        estadoVisibilidad: elemento.estadoVisibilidad || 'N/A',

        ...(elemento.elemento === 'CARPETA'
          ? {
              tamano: (elemento as unknown as Carpeta).cantidadElementos,
            }
          : {}),
        ...(elemento.elemento === 'ARCHIVO'
          ? {
              extension: (elemento as unknown as Archivo).extension,
              tamano: this.formatearTamano(
                (elemento as unknown as Archivo).tamano
              ),
              tipoFusion: (elemento as unknown as Archivo).tipoFusion,
              tipoContenido: (elemento as unknown as Archivo).tipoContenido,
            }
          : {}),

        fechaPapelera: elemento.fechaPapelera
          ? this.fechaUtils.formatear(elemento.fechaPapelera)
          : 'N/A',
        eliminadoPorId: elemento.eliminadoPorId,
        eliminadoPor: elemento.eliminadoPor,
      },
      seleccionado: false,
    };
  }

  transformarDocumentosPersonalATabla(
    elementos: Elemento[]
  ): Observable<ElementoTabla[]> {
    return forkJoin(
      elementos.map((elemento) =>
        this.transformarDocumentoPersonalATabla(elemento)
      )
    );
  }

  transformarDocumentoPersonalATabla(elemento: Elemento): ElementoTabla {
    return {
      columnas: {
        elementoId: elemento.elementoId,
        elemento: elemento.elemento,
        nombre: elemento.nombre,
        creadoPor: elemento.creadoPor,
        creadoEl: this.fechaUtils.formatear(elemento.creadoEl) || 'N/A',
        estado: elemento.estado,
        ruta: elemento.ruta.join(' / '),
        estadoVisibilidad: elemento.estadoVisibilidad || 'N/A',
        ...(elemento.elemento === 'CARPETA'
          ? { cantidadElementos: (elemento as Carpeta).cantidadElementos }
          : {}),
        ...(elemento.elemento === 'ARCHIVO'
          ? {
              extension: (elemento as Archivo).extension,
              tamano: this.formatearTamano((elemento as Archivo).tamano),
              tipoFusion: (elemento as unknown as Archivo).tipoFusion,
              tipoContenido: (elemento as unknown as Archivo).tipoContenido,
            }
          : {}),
      },
      seleccionado: false,
    };
  }

  transformarRevisionesATabla(
    elementos: Revision[]
  ): Observable<ElementoTabla[]> {
    return of(
      elementos.map((elemento) => this.transformarATablaRevision(elemento))
    );
  }

  transformarATablaRevision(elemento: Revision): ElementoTabla {
    return {
      columnas: {
        id: elemento.id,
        elementoId: elemento.elementoId,
        elemento: elemento.elemento,
        nombre: elemento.nombre,
        remitenteId: elemento.remitenteId,
        remitente: elemento.remitente,
        provinciaId: elemento.provinciaId,
        provincia: elemento.provincia,
        revisorId: elemento.revisorId,
        revisor: elemento.revisor,
        fechaEnvio: elemento.fechaEnvio
          ? this.fechaUtils.formatear(elemento.fechaEnvio)
          : 'N/A',
        fechaRevision: elemento.fechaRevision
          ? this.fechaUtils.formatear(elemento.fechaRevision)
          : 'N/A',
        equipoDistribucion: elemento.equipoDistribucion,
        ...(elemento.elemento === 'CARPETA'
          ? {
              tamano: (elemento as unknown as Carpeta).cantidadElementos,
            }
          : {}),
        ...(elemento.elemento === 'ARCHIVO'
          ? {
              extension: (elemento as unknown as Archivo).extension,
              tamano: this.formatearTamano(
                (elemento as unknown as Archivo).tamano
              ),
              tipoFusion: (elemento as unknown as Archivo).tipoFusion,
              tipoContenido: (elemento as unknown as Archivo).tipoContenido,
            }
          : {}),
        estadoRevision: elemento.estadoRevision,
        observaciones: elemento.observaciones,
      },
      seleccionado: false,
    };
  }


  transformarCampanasMedicionATabla(
    elementos: CampanaMedicion[]
  ): Observable<ElementoTabla[]> {
    return of(
      elementos.map((elemento) => this.transformarCampanaMedicionATabla(elemento))
    );
  }

  transformarCampanaMedicionATabla(elemento: CampanaMedicion): ElementoTabla {
    return {
      columnas: {
        campanaMedicionId: elemento.campanaMedicionId,
        anio: elemento.anio,
        estadoProcesamiento: elemento.estadoProcesamiento,
        fechaInicioProcesamiento: elemento.fechaInicioProcesamiento
          ? this.fechaUtils.formatear(elemento.fechaInicioProcesamiento)
          : 'N/A',
        mensajeError: elemento.mensajeError,
        vigencia: elemento.vigencia,

        elementoId: elemento.elementoId,
        elemento: elemento.elemento,
        nombre: elemento.nombre,


        creadoPorId: elemento.creadoPorId,
        creadoPor: elemento.creadoPor,
        creadoEl: elemento.creadoEl
          ? this.fechaUtils.formatear(elemento.creadoEl)
          : 'N/A',
        estado: elemento.estado,

        ruta: elemento.ruta.join(' / '),
        estadoVisibilidad: elemento.estadoVisibilidad,


        ...(elemento.elemento === 'ARCHIVO'
          ? {
              extension: (elemento as unknown as Archivo).extension,
              tamano: this.formatearTamano(
                (elemento as unknown as Archivo).tamano
              ),
              tipoFusion: (elemento as unknown as Archivo).tipoFusion,
              tipoContenido: (elemento as unknown as Archivo).tipoContenido,
            }
          : {}),
      },
      seleccionado: false,
    };
  }

  private formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
