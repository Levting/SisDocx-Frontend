import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError, tap, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Elemento } from '../models/documentos/elemento.model';
import { ElementoPapelera } from '../models/documentos/elemento-papelera-response.model';
import { ElementoFavorito } from '../models/documentos/elemento-favorito-reponse.model';
import { CrearCarpetaRequest } from '../models/documentos/crear-carpeta-request.model';
import { Carpeta } from '../models/documentos/carpeta.model';
import { RenombrarElementoRequest } from '../models/request/elemento-request.model';
import { MoverElementoPapeleraRequest } from '../models/request/elemento-request.model';
import { MarcarElementoFavoritoRequest } from '../models/request/elemento-request.model';
import { ApiError } from '../models/errors/api-error.model';
import { EliminarElementoRequest } from '../models/documentos/eliminar-elemento-request.model';
import { RestaurarElementoRequest } from '../models/documentos/restaurar-elemento-request.model';
import { MoverElementoRequest } from '../models/documentos/mover-elemento-request.model';
import { PrevisualizarArchivoRequest } from '../models/documentos/previsualizar-archivo.model';
import { SubirElementoRequest } from '../models/documentos/subir-elemento-request.model';
import { DescargarElementoRequest } from '../models/documentos/descargar-elemento-request.model';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

/**
 * Servicio para gestionar las operaciones relacionadas con los elementos (carpetas y archivos).
 */
@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private readonly API_URL: string = `${environment.URL_API}/elementos`;
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private logger: LoggerService = inject(LoggerService);

  private waitForAuth<T>(request: Observable<T>): Observable<T> {
    return this.authService.userLoginOn.pipe(
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) {
          this.logger.warn('No autenticado');
          return throwError(() => new Error('No autenticado'));
        }
        return request;
      })
    );
  }

  obtenerContenidoCarpeta(carpetaId: number): Observable<Elemento[]> {
    const url = `${this.API_URL}/carpetas/${carpetaId}/contenido`;
    return this.waitForAuth(this.http.get<Elemento[]>(url));
  }

  obtenerDetallesElemento(
    elementoId: number,
    elemento: 'CARPETA' | 'ARCHIVO'
  ): Observable<Elemento> {
    const url = `${this.API_URL}/${elementoId}/detalles?elemento=${elemento}`;
    return this.waitForAuth(
      this.http.get<Elemento>(url).pipe(
        catchError((error) => {
          this.logger.error('Error al obtener detalles del elemento:', error);
          return throwError(
            () => new Error('No se pudo obtener los detalles del elemento')
          );
        })
      )
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

  previsualizarArchivo(request: PrevisualizarArchivoRequest): Observable<Blob> {
    const url = `${this.API_URL}/archivos/${request.id}/previsualizar`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error: ApiError) => {
        console.error('Error al previsualizar archivo:', error.message);
        return throwError(
          () => new Error('No se pudo previsualizar el archivo')
        );
      })
    );
  }

  crearCarpeta(request: CrearCarpetaRequest): Observable<Carpeta> {
    const url = `${this.API_URL}/carpetas`;
    return this.http.post<Carpeta>(url, request).pipe(
      catchError((error: ApiError) => {
        console.error('Error al crear la carpeta:', error.error);
        console.error('Error al crear la carpeta:', error.message);
        return throwError(() => new Error('No se pudo crear la carpeta'));
      })
    );
  }

  subirElemento(request: SubirElementoRequest): Observable<Elemento> {
    const url = `${this.API_URL}/subir`;

    const formData = new FormData();
    formData.append('carpetaPadreId', request.carpetaPadreId.toString());
    formData.append('elemento', request.elemento);

    return this.http.post<Elemento>(url, formData).pipe(
      catchError((error: ApiError) => {
        console.error('Error al subir elemento:', error.error);
        console.error('Error al subir elemento:', error.message);
        return throwError(
          () => new Error(error.message || 'No se pudo subir el elemento')
        );
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
        console.error('Error al eliminar elemento:', error.error);
        console.error('Error al eliminar elemento:', error.message);
        return throwError(
          () => new Error(error.message || 'No se pudo eliminar el elemento')
        );
      })
    );
  }

  descargarElementos(elementos: DescargarElementoRequest[]): Observable<Blob> {
    if (!elementos || elementos.length === 0) {
      return throwError(
        () => new Error('No se especificaron elementos para descargar')
      );
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post(`${this.API_URL}/descargar`, elementos, {
        headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          // Debug: Imprimir todos los headers de la respuesta
          console.log('Response headers:', response.headers.keys());
          console.log(
            'Content-Disposition:',
            response.headers.get('Content-Disposition')
          );
          console.log('Content-Type:', response.headers.get('Content-Type'));
        }),
        map((response) => {
          // Obtener el nombre del archivo del header Content-Disposition
          const contentDisposition = response.headers.get(
            'Content-Disposition'
          );
          let filename = 'descarga.zip';

          if (contentDisposition) {
            // El backend envía el nombre en el formato: form-data; name="attachment"; filename="SDX_YYYYMMDD_HHMMSS.zip"
            const filenameMatch =
              contentDisposition.match(/filename="([^"]+)"/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
              console.log('Nombre del archivo extraído:', filename);
            } else {
              console.warn(
                'No se pudo extraer el nombre del archivo del header Content-Disposition:',
                contentDisposition
              );
            }
          } else {
            // Si no hay Content-Disposition, generar un nombre basado en la fecha y el tipo de descarga
            const fecha = new Date()
              .toISOString()
              .replace(/[-:]/g, '')
              .replace('T', '_')
              .slice(0, 15);

            if (elementos.length === 1) {
              // Para un solo elemento, usar su nombre
              const elemento = elementos[0];
              filename = `${
                elemento.elemento === 'CARPETA' ? 'Carpeta' : 'Archivo'
              }_${fecha}.zip`;
            } else {
              // Para múltiples elementos, usar el formato SDX
              filename = `SDX_${fecha}.zip`;
            }
            console.warn(
              'No se encontró el header Content-Disposition, usando nombre generado:',
              filename
            );
          }

          // Crear y descargar el archivo
          const blob = response.body as Blob;
          this.descargarArchivo(blob, filename);
          return blob;
        }),
        catchError((error: ApiError) => {
          console.error('Error al descargar elementos:', error.message);
          return throwError(
            () => new Error('No se pudieron descargar los elementos')
          );
        })
      );
  }

  private descargarArchivo(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al iniciar la descarga:', error);
      throw new Error('No se pudo iniciar la descarga del archivo');
    }
  }

  /**
   * Obtiene los documentos agrupados por usuario
   * @returns Observable con la lista de elementos
   */
  /* obtenerDocumentosPorUsuario(): Observable<Elemento[]> {
    return this.http
      .get<Elemento[]>(`${this.API_URL}/por-usuario`)
      .pipe(catchError(this.handleError));
  } */
}
