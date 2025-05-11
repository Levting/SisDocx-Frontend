import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';
import { environment } from '../../../environments/environment';
import { Rol } from '../models/usuario/rol.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = `${environment.URL_API}/usuarios`;

  // BehaviorSubject para mantener el estado del usuario autenticado
  private usuarioAutenticadoSubject = new BehaviorSubject<Usuario | null>(null);
  usuarioAutenticado$ = this.usuarioAutenticadoSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerUsuarioAutenticado(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/me`).pipe(
      tap((usuario) => {
        this.usuarioAutenticadoSubject.next(usuario);
      }),
      catchError(this.handleError)
    );
  }

  obtenerUsuarioId(id: number): Observable<Usuario> {
    return this.http
      .get<Usuario>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  obtenerRoles(): Observable<Rol[]> {
    return this.http
      .get<Rol[]>(`${this.API_URL}/roles/`)
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(user: Usuario): Observable<Usuario> {
    return this.http
      .put<Usuario>(`${this.API_URL}/`, user)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener el usuario actual del BehaviorSubject
  getUsuarioActual(): Usuario | null {
    return this.usuarioAutenticadoSubject.getValue();
  }

  // Método para limpiar el usuario actual
  limpiarUsuarioActual(): void {
    this.usuarioAutenticadoSubject.next(null);
  }

  // Handle Error
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.status === 0) {
      errorMessage = `Error de conexión: No se pudo conectar con el servidor`;
    } else {
      try {
        const apiError = error.error;
        if (apiError && apiError.message) {
          errorMessage = apiError.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else {
          errorMessage = `Error ${error.status}: ${
            error.statusText || 'Desconocido'
          }`;
        }
      } catch (e) {
        errorMessage = `Error del servidor: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
