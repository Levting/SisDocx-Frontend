import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError, tap, switchMap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { TokenService } from './token.service';
import { FusionarArchivoRequest } from '../models/documentos/fusionar-archivo-request.model';
import { Elemento } from '../models/documentos/elemento.model';
import { ApiError } from '../models/errors/api-error.model';

/**
 * Servicio para gestionar las operaciones relacionadas con los elementos (carpetas y archivos).
 */
@Injectable({
  providedIn: 'root',
})
export class FusionService {
  private readonly API_URL: string = `${environment.URL_API}/fusion`;
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private logger: LoggerService = inject(LoggerService);
  private tokenService: TokenService = inject(TokenService);

  private waitForAuth<T>(request: Observable<T>): Observable<T> {
    return this.authService.userLoginOn.pipe(
      switchMap((isLoggedIn) => {
        /* console.log('isLoggedIn', isLoggedIn); */
        /* const token = this.tokenService.getToken(); */

        if (!isLoggedIn) {
          // Obtener el token de autenticación

          this.logger.warn('No autenticado');
          return throwError(() => new Error('No autenticado'));
        }
        return request;
      })
    );
  }

  fusionarArchivos(
    request: FusionarArchivoRequest
  ): Observable<HttpResponse<Blob>> {
    const url = `${this.API_URL}`;
    console.log('url', url);
    console.log('request', request);
    return this.waitForAuth(
      this.http.post(url, request, {
        responseType: 'blob',
        observe: 'response',
      })
    ).pipe(
      tap((response) => {
        // Obtener el nombre del archivo del header Content-Disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'archivo_fusionado.pdf'; // Nombre por defecto

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        // Descargar el archivo
        const blob = response.body as Blob;
        this.descargarArchivo(blob, filename);
      })
    );
  }

  guardarArchivoFusionado(blob: Blob, filename: string): Observable<Elemento> {
    const url = `${this.API_URL}/guardar`;

    // Convertir el blob a un archivo
    const file = new File([blob], filename, { type: blob.type });

    const formData = new FormData();
    formData.append('archivo', file);

    return this.http.post<Elemento>(url, formData).pipe(
      catchError((error: ApiError) => {
        console.error('Error al guardar archivo fusionado:', error.message);
        return throwError(
          () =>
            new Error(
              error.message || 'No se pudo guardar el archivo fusionado'
            )
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
}
