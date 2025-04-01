import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Usuario } from '../../models/usuario/usuario';
import { environment } from '../../../environments/environment';
import { Rol } from '../../models/usuario/rol';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<Usuario> {
    return this.http
      .get<Usuario>(environment.urlAPI + '/usuarios/' + id)
      .pipe(catchError(this.handleError));
  }

  getRoles(): Observable<Rol[]> {
    return this.http
      .get<Rol[]>(environment.urlAPI + '/roles/')
      .pipe(catchError(this.handleError));
  }

  updateUser(user: Usuario): Observable<Usuario> {
    return this.http
      .put<Usuario>(environment.urlAPI + '/usuarios/', user)
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
