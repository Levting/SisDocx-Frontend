import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {User} from '../../models/user/user';
import {environment} from '../../../environments/environment';
import {Role} from '../../models/user/role';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }

  getUser(id: number): Observable<User> {
    return this.http
      .get<User>(environment.urlAPI + '/users/' + id)
      .pipe(catchError(this.handleError));
  }

  getRoles(): Observable<Role[]> {
    return this.http
      .get<Role[]>(environment.urlAPI + '/roles/')
      .pipe(catchError(this.handleError));
  }

  updateUser(user: User): Observable<User> {
    return this.http
      .put<User>(environment.urlAPI + '/users/', user)
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
