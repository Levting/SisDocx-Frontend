import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap,
  throwError,
  map,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiError } from '../models/errors/apiError';
import { TokenService } from './token.service';
import { isPlatformBrowser } from '@angular/common';
import { Usuario } from '../models/usuario/usuario';
import { Router } from '@angular/router';
import { InicioSesionRequest } from '../models/auth/inicioSesionRequest';
import { InicioSesionResponse } from '../models/auth/inicioSesionResponse';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL_AUTH = `${environment.URL_HOST}/auth`;

  private userLoginOnSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  userLoginOn: Observable<boolean> = this.userLoginOnSubject.asObservable();
  private initialCheckDone: boolean = false;
  private platformId: Object = inject(PLATFORM_ID);

  // Mantener el usuario en un behavior subject
  private usuarioSubject: BehaviorSubject<Usuario | null> =
    new BehaviorSubject<Usuario | null>(null);
  usuario: Observable<Usuario | null> = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    if (!this.initialCheckDone) {
      this.checkInitialAuth();
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns void
   */
  private checkInitialAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const hasToken = this.tokenService.isValidToken();

      if (hasToken) {
        // Verificar si el token es válido con el servidor actual
        this.verificarTokenValido().subscribe({
          next: (esValido) => {
            if (esValido) {
              this.userLoginOnSubject.next(true);
              // Si hay token válido, cargar el usuario
              this.cargarUsuarioAutenticado().subscribe();
            } else {
              // Token inválido, limpiar y actualizar estado
              this.tokenService.removeToken();
              this.userLoginOnSubject.next(false);
              this.usuarioSubject.next(null);
              console.warn(
                '⚠️ Token inválido o expirado. Por favor, inicie sesión nuevamente.'
              );
            }
          },
          error: (error) => {
            // Error al verificar el token, asumimos que no es válido
            this.tokenService.removeToken();
            this.userLoginOnSubject.next(false);
            this.usuarioSubject.next(null);
            console.error('❌ Error al verificar el token:', error.message);
          },
        });
      } else {
        this.userLoginOnSubject.next(false);
      }
    }
    this.initialCheckDone = true;
  }

  /**
   * Verifica si el token actual es válido con el servidor
   * @returns Observable<boolean>
   */
  private verificarTokenValido(): Observable<boolean> {
    return this.http.get<Usuario>(`${this.API_URL_AUTH}/me`).pipe(
      map(() => true),
      catchError((error) => {
        if (error.status === 401) {
          this.tokenService.removeToken();
          this.userLoginOnSubject.next(false);
          this.usuarioSubject.next(null);
          return of(false);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si el usuario está autenticado y el token es válido
   * @returns Observable<boolean>
   */
  verificarAutenticacion(): Observable<boolean> {
    if (!this.tokenService.isValidToken()) {
      this.userLoginOnSubject.next(false);
      this.usuarioSubject.next(null);
      return of(false);
    }

    return this.verificarTokenValido().pipe(
      tap((esValido) => {
        if (!esValido) {
          this.userLoginOnSubject.next(false);
          this.usuarioSubject.next(null);
        }
      })
    );
  }

  /**
   * Inicia sesión
   * @param credentials Credenciales de inicio de sesión
   * @returns Observable<LoginResponse>
   */
  iniciarSesion(
    credentials: InicioSesionRequest
  ): Observable<InicioSesionResponse> {
    return this.http
      .post<InicioSesionResponse>(
        `${this.API_URL_AUTH}/iniciar-sesion`,
        credentials
      )
      .pipe(
        tap((response: InicioSesionResponse) => {
          this.tokenService.setToken(response.token);
          this.userLoginOnSubject.next(true);
          // Cargar el usuario después de iniciar sesión
          this.cargarUsuarioAutenticado().subscribe();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cierra sesión
   * @returns void
   */
  cerrarSesion(): void {
    this.tokenService.removeToken();
    this.userLoginOnSubject.next(false);
    this.usuarioSubject.next(null);
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns boolean
   */
  estaAutenticado(): boolean {
    return this.tokenService.isValidToken();
  }

  /**
   * Carga el usuario autenticado
   * @returns Observable<Usuario | null>
   */
  private cargarUsuarioAutenticado(): Observable<Usuario | null> {
    if (!this.tokenService.isValidToken()) {
      this.usuarioSubject.next(null);
      return of(null);
    }

    return this.http.get<Usuario>(`${this.API_URL_AUTH}/me`).pipe(
      tap((usuario) => {
        this.usuarioSubject.next(usuario);
      }),
      catchError((error) => {
        this.usuarioSubject.next(null);

        // Si es un error de conexión (status 0) o un error de servidor
        if (error.status === 0 || error.status === 500) {
          // Redirigir al usuario a la página de inicio de sesión
          this.router.navigate(['/auth/iniciar-sesion']);
        }

        return of(null);
      })
    );
  }

  /**
   * Obtiene el usuario autenticado
   * @returns Usuario | null
   */
  obtenerUsuarioAutenticado(): Usuario | null {
    return this.usuarioSubject.getValue();
  }

  /**
   * Maneja el error de la petición
   * @param error Error de la petición
   * @returns Observable<never>
   */
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

    // Devolvemos el mensaje específico, no uno genérico
    return throwError(() => new Error(errorMessage));
  }
}
