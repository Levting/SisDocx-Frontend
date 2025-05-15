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
import { ApiError } from '../models/errors/api-error.model';
import { TokenService } from './token.service';
import { isPlatformBrowser } from '@angular/common';
import { Usuario } from '../models/usuario/usuario.model';
import { Router } from '@angular/router';
import { InicioSesionRequest } from '../models/auth/inicio-sesion-request.model';
import { InicioSesionResponse } from '../models/auth/inicio-sesion-response.model';
import { UserService } from './user.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL_AUTH = `${environment.URL_HOST}/auth`;

  private userLoginOnSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public userLoginOn: Observable<boolean> = this.userLoginOnSubject.asObservable();

  // Nuevos BehaviorSubjects para rol y provincia
  private userRoleSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public userRole$: Observable<string | null> = this.userRoleSubject.asObservable();

  private userProvinciaSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public userProvincia$: Observable<string | null> = this.userProvinciaSubject.asObservable();

  private platformId: Object = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private userService: UserService,
    private logger: LoggerService
  ) {
    // Inicializar el estado de autenticación inmediatamente
    this.initializeAuthState();

    // Suscribirse a los cambios del usuario solo para debug
    if (!environment.production) {
      this.userService.usuarioAutenticado$.subscribe((usuario) => {
        if (usuario) {
          this.logger.debug('Estado de autenticación:', usuario);
          // Actualizar rol y provincia cuando el usuario cambia
          this.userRoleSubject.next(usuario.rol.nombre);
          this.userProvinciaSubject.next(usuario.provincia.nombre);
        }
      });
    }
  }

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const hasToken = this.tokenService.isValidToken();

      if (hasToken) {
        // Si hay token, verificar su validez
        this.verificarTokenValido().subscribe({
          next: (esValido) => {
            if (esValido) {
              this.userLoginOnSubject.next(true);
              this.cargarUsuarioAutenticado().subscribe();
            } else {
              this.handleInvalidToken();
            }
          },
          error: () => {
            this.handleInvalidToken();
          },
        });
      } else {
        // Si no hay token, establecer estado como no autenticado
        this.userLoginOnSubject.next(false);
      }
    }
  }

  private handleInvalidToken(): void {
    this.tokenService.removeToken();
    this.userLoginOnSubject.next(false);
    this.userService.limpiarUsuarioActual();
    this.logger.warn('Token inválido o expirado');
    this.router.navigate(['/auth/iniciar-sesion']);
  }

  verificarTokenValido(): Observable<boolean> {
    return this.userService.obtenerUsuarioAutenticado().pipe(
      map(() => true),
      catchError((error) => {
        if (error.status === 401) {
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
      this.userService.limpiarUsuarioActual();
      return of(false);
    }

    return this.verificarTokenValido().pipe(
      tap((esValido) => {
        if (!esValido) {
          this.userLoginOnSubject.next(false);
          this.userService.limpiarUsuarioActual();
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
    this.userService.limpiarUsuarioActual();
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
      this.userService.limpiarUsuarioActual();
      return of(null);
    }

    return this.userService.obtenerUsuarioAutenticado().pipe(
      catchError((error) => {
        this.userService.limpiarUsuarioActual();

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
    return this.userService.getUsuarioActual();
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
