import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Elemento } from '../models/documentos/elemento';
import { ElementoPapelera } from '../models/documentos/elementoPapeleraResponse';
import { ElementoFavorito } from '../models/documentos/elementoFavoritoReponse';
import { CrearCarpetaRequest } from '../models/documentos/crearCarpetaRequest';
import { Carpeta } from '../models/documentos/carpeta';
import { SubirCarpetaRequest } from '../models/documentos/subirCarpetaRequest';
import { SubirArchivoRequest } from '../models/documentos/subirArchivoRequest';
import { Archivo } from '../models/documentos/archivo';
import { MoverElementoRequest } from '../models/documentos/moverElementoRequest';
import { RenombrarElementoRequest } from '../models/documentos/renombrarElementoRequiest';
import { MoverElementoPapeleraRequest } from '../models/documentos/moverElementoPapelera';
import { RestaurarElementoRequest } from '../models/documentos/restaurarElementoRequest';
import { MarcarElementoFavoritoRequest } from '../models/documentos/marcarElementoFavorito';
import { EliminarElementoRequest } from '../models/documentos/eliminarElementoRequest';

/**
 * Servicio para gestionar las operaciones relacionadas con los elementos (carpetas y archivos).
 */
@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private readonly API_URL: string = `${environment.URL_API}/elementos`;

  // Inyección de dependencias
  private http: HttpClient = inject(HttpClient);

  obtenerContenidoCarpeta(carpetaId: number): Observable<Elemento[]> {
    const url = `${this.API_URL}/carpetas/${carpetaId}/contenido`;
    return this.http.get<Elemento[]>(url);
  }

  obtenerDetallesElemento(
    elementoId: number,
    elemento: 'CARPETA' | 'ARCHIVO'
  ): Observable<Elemento> {
    // Construimos la URL con el parámetro de consulta
    const url = `${this.API_URL}/${elementoId}/detalles?elemento=${elemento}`;

    // Realizamos la petición HTTP GET
    return this.http.get<Elemento>(url).pipe(
      map((respuesta) => {
        // Transformamos la respuesta si es necesario
        return respuesta;
      }),
      catchError((error) => {
        console.error('Error al obtener detalles del elemento', error);
        return throwError(
          () => new Error('No se pudo obtener los detalles del elemento')
        );
      })
    );
  }

  obtenerPapelera(): Observable<ElementoPapelera[]> {
    const url = `${this.API_URL}/papelera`;
    return this.http.get<ElementoPapelera[]>(url);
  }

  obtenerFavoritos(): Observable<ElementoFavorito[]> {
    const url = `${this.API_URL}/favoritos`;
    return this.http.get<ElementoFavorito[]>(url);
  }

  crearCarpeta(request: CrearCarpetaRequest): Observable<Carpeta> {
    const url = `${this.API_URL}/carpetas`;
    return this.http.post<Carpeta>(url, request).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo crear la carpeta', error)
        );
      })
    );
  }

  subirCarpeta(request: SubirCarpetaRequest): Observable<Carpeta> {
    const url = `${this.API_URL}/carpetas/subir`;
    return this.http.post<Carpeta>(url, request).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo subir la carpeta', error)
        );
      })
    );
  }

  subirArchivo(request: SubirArchivoRequest): Observable<Archivo> {
    const url = `${this.API_URL}/archivos/subir`;

    const formData = new FormData();
    formData.append('carpetaId', request.carpetaId.toString());
    formData.append('archivo', request.archivo);

    return this.http.post<Archivo>(url, formData).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo subir el archivo', error)
        );
      })
    );
  }

  moverElemento(request: MoverElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/elementos/${request.elementoId}/mover`;
    return this.http.post<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo mover el elemento', error)
        );
      })
    );
  }

  renombrarElemento(request: RenombrarElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/elementos/${request.elementoId}/renombrar`;
    return this.http.post<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(  
          () => new Error('No se pudo renombrar el elemento', error)
        );
      })
    );
  }

  moverElementoPapelera(
    request: MoverElementoPapeleraRequest
  ): Observable<Elemento> {
    const url = `${this.API_URL}/elementos/${request.elementoId}/papelera`;
    return this.http.post<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo mover el elemento a la papelera', error)
        );
      })
    );
  }

  restaurarElemento(request: RestaurarElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/elementos/${request.elementoId}/restaurar`;
    return this.http.post<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(() => new Error('No se pudo restaurar el elemento', error));
      })  
    );
  }

  marcarElementoFavorito(request: MarcarElementoFavoritoRequest): Observable<ElementoFavorito> {
    const url = `${this.API_URL}/${request.elementoId}/favorito/`;
    return this.http.post<ElementoFavorito>(url, request).pipe(
      catchError((error) => {
        return throwError(() => new Error('No se pudo marcar el elemento como favorito', error));
      })
    );
  }

  eliminarElemento(request: EliminarElementoRequest): Observable<Elemento> { 
    const url = `${this.API_URL}/${request.elementoId}/eliminar`;
    return this.http.post<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(() => new Error('No se pudo eliminar el elemento', error));
      })
    );
  }
}