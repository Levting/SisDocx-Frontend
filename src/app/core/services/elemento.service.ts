import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Elemento } from '../models/documentos/elemento.model';
import { ElementoPapelera } from '../models/documentos/elemento-papelera-response.model';
import { ElementoFavorito } from '../models/documentos/elemento-favorito-reponse.model';
import { CrearCarpetaRequest } from '../models/documentos/crear-carpeta-request.model';
import { Carpeta } from '../models/documentos/carpeta.model';
import { SubirCarpetaRequest } from '../models/documentos/subir-carpeta-request.model';
import { SubirArchivoRequest } from '../models/documentos/subir-archivo-request.model';
import { Archivo } from '../models/documentos/archivo.model';
import { RenombrarElementoRequest } from '../models/request/elemento-request.model';
import { MoverElementoPapeleraRequest } from '../models/request/elemento-request.model';
import { MarcarElementoFavoritoRequest } from '../models/request/elemento-request.model';
import { ApiError } from '../models/errors/api-error.model';
import { EliminarElementoRequest } from '../models/documentos/eliminar-elemento-request.model';
import { RestaurarElementoRequest } from '../models/documentos/restaurar-elemento-request.model';
import { MoverElementoRequest } from '../models/documentos/mover-elemento-request.model';

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
    formData.append('carpetaPadreId', request.carpetaPadreId.toString());
    formData.append('archivo', request.archivo);

    return this.http.post<Archivo>(url, formData).pipe(
      catchError((error: ApiError) => {
        console.error('Error al subir archivo:', error.error);
        console.error('Error al subir archivo:', error.message);
        return throwError(() => new Error('No se pudo subir el archivo'));
      })
    );
  }

  subirCarpetas(request: SubirCarpetaRequest): Observable<Elemento> {
    const url = `${this.API_URL}/carpetas/subir`;
    return this.http.post<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(() => new Error('No se pudo subir la carpeta'));
      })
    );
  }

  moverElemento(request: MoverElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/${request.elementoId}/mover?elemento=${request.elemento}`;
    return this.http.put<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo mover el elemento', error)
        );
      })
    );
  }

  renombrarElemento(request: RenombrarElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/${request.elementoId}/renombrar?elemento=${request.elemento}`;
    return this.http.put<Elemento>(url, request).pipe(
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
    const url = `${this.API_URL}/${request.elementoId}/papelera?elemento=${request.elemento}`;
    return this.http.put<Elemento>(url, request).pipe(
      catchError((error: ApiError) => {
        console.error('Error:', error.error);
        console.error('Error al mover elemento a papelera:', error.message);
        return throwError(
          () => new Error('No se pudo mover el elemento a la papelera')
        );
      })
    );
  }

  restaurarElemento(request: RestaurarElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/${request.elementoId}/restaurar?elemento=${request.elemento}`;
    return this.http.put<Elemento>(url, request).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo restaurar el elemento', error)
        );
      })
    );
  }

  marcarElementoFavorito(
    request: MarcarElementoFavoritoRequest
  ): Observable<ElementoFavorito> {
    const url = `${this.API_URL}/${request.elementoId}/favorito?elemento=${request.elemento}`;
    return this.http.put<ElementoFavorito>(url, request).pipe(
      catchError((error) => {
        return throwError(
          () => new Error('No se pudo marcar el elemento como favorito', error)
        );
      })
    );
  }

  eliminarElemento(request: EliminarElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/${request.elementoId}?elemento=${request.elemento}`;
    return this.http.delete<Elemento>(url).pipe(
      catchError((error: ApiError) => {
        console.error('Error:', error.error);
        console.error('Error al eliminar elemento:', error.message);
        return throwError(() => new Error('No se pudo eliminar el elemento'));
      })
    );
  }
}
