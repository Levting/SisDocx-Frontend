import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {User} from '../../models/user/user';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(environment.urlAPI+'/users/'+id).pipe(
      catchError(this.handleError)
    )
  }

  // Manejador de errores
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error("Se a producido el error: " + error.message);
    } else {
      console.error("El backend retorno el estado " + error.status + error.error);
    }
    return throwError(() => new Error("Algo falló, intentelo nuevamente."));
  }
}
