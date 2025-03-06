import {Injectable} from '@angular/core';
import {LoginRequest} from '../../models/auth/loginRequest';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, tap, throwError} from 'rxjs';
import {LoginResponse} from '../../models/auth/loginResponse';
import {User} from '../../models/user/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public currentUserData: BehaviorSubject<User> = new BehaviorSubject<User>({
    lastName: '',
    name: '',
    password: '',
    role: 0,
    id: 0, email: ''
  });

  constructor(private http: HttpClient) {
  }

  login(credentials: LoginRequest): Observable<User> {
    console.log("Credenciales: ", credentials);
    return this.http.get<User>("data.json").pipe(
      tap((userData: User) => {
        this.currentUserData.next(userData);
        this.currentUserLoginOn.next(true);
      }),
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

  get userData(): Observable<User> {
    return this.currentUserData.asObservable();
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  logout() {
    // localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    // return localStorage.getItem('authToken');
    return null;
  }

  isAuthenticated(): boolean {
    // return this.getToken() !== null;
    return true;
  }
}
