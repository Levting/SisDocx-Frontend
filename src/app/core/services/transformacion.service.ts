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
import { ElementoRevision } from '../models/revision/elemento-revision.model';

@Injectable({
  providedIn: 'root',
})
export class TransformacionService {
  // Inyectar el servicio de usuario y el servicio de fecha
  private userService = inject(UserService);
  private fechaUtils = inject(FechaUtilsService);

  transformarDocumentosATabla(
    elementos: Elemento[]
  ): Observable<ElementoTabla[]> {
    return forkJoin(
      elementos.map((elemento) => this.transformarDocumentoATabla(elemento))
    );
  }

  transformarDocumentoATabla(elemento: Elemento): Observable<ElementoTabla> {
    return this.userService.obtenerUsuarioId(elemento.creadoPorId).pipe(
      map((usuario) => {
        const baseColumnas = {
          elementoId: elemento.elementoId || 'N/A',
          elemento: elemento.elemento || 'N/A',
          nombre: elemento.nombre || 'N/A',
          carpetaPadreId: elemento.carpetaPadreId || 'N/A',
          carpetaPadre: elemento.carpetaPadre || 'N/A',
          creadoPorId: elemento.creadoPorId || 'N/A',
          creadoPor: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'N/A',
          creadoEl: elemento.creadoEl
            ? this.fechaUtils.formatear(elemento.creadoEl)
            : 'N/A',
          estado: elemento.estado || 'N/A',
          equipoDistribucion: elemento.equipoDistribucion || 'N/A',
          ruta: elemento.ruta.join(' / ') || 'N/A',
          visibleParaAdmin: elemento.visibleParaAdmin,
        };

        // Agregar propiedades específicas según el tipo de elemento
        if (elemento.elemento === 'CARPETA') {
          return {
            columnas: {
              ...baseColumnas,
              tamano: (elemento as Carpeta).cantidadElementos || 'N/A',
            },
            seleccionado: false,
          };
        } else if (elemento.elemento === 'ARCHIVO') {
          return {
            columnas: {
              ...baseColumnas,
              extension: (elemento as Archivo).extension || 'N/A',
              tamano: this.formatearTamano((elemento as Archivo).tamano) || 'N/A',
            },
            seleccionado: false,
          };
        }

        return {
          columnas: baseColumnas,
          seleccionado: false,
        };
      })
    );
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
        fechaFavorito: this.fechaUtils.formatear(elemento.fechaFavorito) || 'N/A',
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
            }
          : {}),
      },
      seleccionado: false,
    };
  }

  transformarPapelerasATabla(
    elementos: ElementoPapelera[]
  ): Observable<ElementoTabla[]> {
    return forkJoin(
      elementos.map((elemento) => this.transformarATablaPapelera(elemento))
    );
  }

  transformarATablaPapelera(
    elemento: ElementoPapelera
  ): Observable<ElementoTabla> {
    return this.userService.obtenerUsuarioId(elemento.creadoPorId).pipe(
      map((usuario) => {
        const baseColumnas = {
          elementoId: elemento.elementoId,
          elemento: elemento.elemento,
          nombre: elemento.nombre,
          carpetaPadreId: elemento.carpetaPadreId,
          carpetaPadre: elemento.carpetaPadre,
          creadoPorId: elemento.creadoPorId,
          creadoPor: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'N/A',
          creadoEl: elemento.creadoEl
            ? this.fechaUtils.formatear(elemento.creadoEl)
            : 'N/A',
          estado: elemento.estado,
          equipoDistribucion: elemento.equipoDistribucion,
          ruta: elemento.ruta.join(' / '),
          visibleParaAdmin: elemento.visibleParaAdmin,
          fechaPapelera: elemento.fechaPapelera
            ? this.fechaUtils.formatear(elemento.fechaPapelera)
            : 'N/A',
          eliminadoPorId: elemento.eliminadoPorId,
          eliminadoPor: elemento.eliminadoPor,
        };

        // Agregar propiedades específicas según el tipo de elemento
        if (elemento.elemento === 'CARPETA') {
          return {
            columnas: {
              ...baseColumnas,
              tamano: (elemento as unknown as Carpeta).cantidadElementos,
            },
            seleccionado: false,
          };
        } else if (elemento.elemento === 'ARCHIVO') {
          return {
            columnas: {
              ...baseColumnas,
              extension: (elemento as unknown as Archivo).extension,
              tamano: this.formatearTamano(
                (elemento as unknown as Archivo).tamano
              ),
            },
            seleccionado: false,
          };
        }

        return {
          columnas: baseColumnas,
          seleccionado: false,
        };
      })
    );
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

  transformarDocumentoPersonalATabla(
    elemento: Elemento
  ): Observable<ElementoTabla> {
    return this.userService.obtenerUsuarioId(elemento.creadoPorId).pipe(
      map((usuario) => ({
        columnas: {
          elementoId: elemento.elementoId,
          elemento: elemento.elemento,
          nombre: elemento.nombre,
          creadoPor: `${usuario.nombre} ${usuario.apellido}`,
          creadoEl: this.fechaUtils.formatear(elemento.creadoEl) || 'N/A',
          estado: elemento.estado,
          ruta: elemento.ruta.join(' / '),
          ...(elemento.elemento === 'CARPETA'
            ? { cantidadElementos: (elemento as Carpeta).cantidadElementos }
            : {}),
          ...(elemento.elemento === 'ARCHIVO'
            ? {
                extension: (elemento as Archivo).extension,
                tamano: (elemento as Archivo).tamano,
              }
            : {}),
        },
        seleccionado: false,
      }))
    );
  }

  transformarRevisionesATabla(
    elementos: ElementoRevision[]
  ): Observable<ElementoTabla[]> {
    return of(
      elementos.map((elemento) => this.transformarATablaRevision(elemento))
    );
  }

  transformarATablaRevision(elemento: ElementoRevision): ElementoTabla {
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
            }
          : {}),
        estadoRevision: elemento.estadoRevision,
        observaciones: elemento.observaciones,
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
