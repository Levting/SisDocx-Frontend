import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Usuario } from '../models/usuario/usuario';
import { environment } from '../../../environments/environment';
import { Rol } from '../models/usuario/rol';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  obtenerUsuarioId(id: number): Observable<Usuario> {
    return this.http
      .get<Usuario>(environment.URL_API + '/usuarios/' + id)
      .pipe(catchError(this.handleError));
  }

  obtenerRoles(): Observable<Rol[]> {
    return this.http
      .get<Rol[]>(environment.URL_API + '/roles/')
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(user: Usuario): Observable<Usuario> {
    return this.http
      .put<Usuario>(environment.URL_API + '/usuarios/', user)
      .pipe(catchError(this.handleError));
  }

  // Handle Error
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage: string =
      error.status === 0
        ? `Se ha producido el error: ${error.message}`
        : `El backend retornó el estado ${error.status}: ${error.error}`;
    console.error(errorMessage);
    return throwError(
      (): Error => new Error('Algo falló, intentelo nuevamente.')
    );
  }
}
