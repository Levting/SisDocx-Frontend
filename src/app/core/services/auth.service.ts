import { Injectable } from '@angular/core';
import { LoginRequest } from '../../models/auth/loginRequest';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginResponse } from '../../models/auth/loginResponse';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public currentTokenData: BehaviorSubject<String> = new BehaviorSubject<String>('');

  constructor(private http: HttpClient) {
    this.currentUserLoginOn = new BehaviorSubject<boolean>(this.getToken() !== null);
    this.currentTokenData = new BehaviorSubject<String>(this.getToken() || '');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage: string = error.status === 0
        ? `Se ha producido el error: ${error.message}`
        : `El backend retornó el estado ${error.status}: ${error.error}`;
    console.error(errorMessage);
    return throwError(
      (): Error => new Error('Algo falló, intentelo nuevamente.')
    );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(environment.urlAPI + '/auth/login', credentials)
      .pipe(
        tap((tokenData: LoginResponse): void => {
          sessionStorage.setItem('token', tokenData.token);
          this.currentTokenData.next(tokenData.token);
          this.currentUserLoginOn.next(true);
        }),
        catchError(this.handleError)
      );
  }

  get userData(): Observable<String> {
    return this.currentTokenData.asObservable();
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return true;
  }
}
