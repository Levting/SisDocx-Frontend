import { inject, Injectable } from '@angular/core';
import { ElementoTabla } from '../models/table/elementoTabla';
import { Elemento } from '../models/documentos/elemento';
import { ElementoFavorito } from '../models/documentos/elementoFavoritoReponse';
import { ElementoPapelera } from '../models/documentos/elementoPapeleraResponse';
import { UserService } from './user.service';
import { FechaUtilsService } from '../utils/fecha-utils.service';
import { Observable, forkJoin, map, of } from 'rxjs';
import { Archivo } from '../models/documentos/archivo';
import { Carpeta } from '../models/documentos/carpeta';

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
    return this.userService.obtenerUsuarioId(elemento.creadoPor).pipe(
      map((usuario) => ({
        columnas: {
          elementoId: elemento.elementoId,
          elemento: elemento.elemento,
          nombre: elemento.nombre,
          creadoPor: `${usuario.nombre} ${usuario.apellido}`,
          creadoEl: this.fechaUtils.formatear(elemento.creadoEl),
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
        fechaFavorito: this.fechaUtils.formatear(elemento.fechaFavorito),
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
      elementos.map((elemento) => this.transformarPapeleraATabla(elemento))
    );
  }

  transformarPapeleraATabla(
    elemento: ElementoPapelera
  ): Observable<ElementoTabla> {
    // Crear observables para los datos que pueden ser nulos
    const obsEliminadoPor = elemento.eliminadoPor
      ? this.userService.obtenerUsuarioId(elemento.eliminadoPor)
      : of({ nombre: 'Desconocido', apellido: '' });

    const obsCreadoPor = this.userService.obtenerUsuarioId(elemento.creadoPor);

    return forkJoin({
      eliminadoPor: obsEliminadoPor,
      creadoPor: obsCreadoPor,
    }).pipe(
      map(({ eliminadoPor, creadoPor }) => ({
        columnas: {
          elementoId: elemento.elementoId,
          elemento: elemento.elemento,
          nombre: elemento.nombre,
          fechaPapelera: elemento.fechaPapelera
            ? this.fechaUtils.formatear(elemento.fechaPapelera)
            : 'No disponible',
          eliminadoPor: `${eliminadoPor.nombre} ${eliminadoPor.apellido}`,
          creadoPor: `${creadoPor.nombre} ${creadoPor.apellido}`,
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
      }))
    );
  }
}
