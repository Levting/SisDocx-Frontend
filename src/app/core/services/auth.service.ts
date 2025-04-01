import { Injectable } from '@angular/core';
import { LoginRequest } from '../../models/auth/loginRequest';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginResponse } from '../../models/auth/loginResponse';
import { environment } from '../../../environments/environment';

// Interfaz para manejar los errores de la API
interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserLoginOn: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private currentTokenData: BehaviorSubject<String> =
    new BehaviorSubject<String>('');

  constructor(private http: HttpClient) {
    this.currentUserLoginOn = new BehaviorSubject<boolean>(
      this.getToken() !== null
    );
    this.currentTokenData = new BehaviorSubject<String>(this.getToken() || '');
  }

  // La función recibe un HttpErrorResponse, no un ApiError directamente
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.status === 0) {
      // Error de conexión o red
      errorMessage = `Error de conexión: No se pudo conectar con el servidor`;
    } else {
      try {
        // Intentamos extraer la estructura ApiError de la respuesta
        const apiError = error.error as ApiError;

        if (apiError && apiError.message) {
          // Si tiene la estructura de ApiError, usamos su mensaje
          errorMessage = apiError.message;
        } else if (typeof error.error === 'string') {
          // Si es un string directo
          errorMessage = error.error;
        } else {
          // Fallback genérico
          errorMessage = `Error ${error.status}: ${
            error.statusText || 'Desconocido'
          }`;
        }
      } catch (e) {
        // En caso de error al procesar
        errorMessage = `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en la petición:', errorMessage, error);
    // Devolvemos el mensaje específico, no uno genérico
    return throwError(() => new Error(errorMessage));
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        environment.urlHost + '/auth/iniciar-sesion',
        credentials
      )
      .pipe(
        tap((tokenData: LoginResponse): void => {
          sessionStorage.setItem('token', tokenData.token);
          this.currentTokenData.next(tokenData.token);
          this.currentUserLoginOn.next(true);
        }),
        catchError(this.handleError)
      );
  }

  get userToken(): Observable<String> {
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
