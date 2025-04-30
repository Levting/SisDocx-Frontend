import { isPlatformBrowser } from '@angular/common';
import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private isBrowser: boolean;
  private memoryToken: string | null = null; // Cache en memoria

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Si estamos en el navegador, cargamos el token de la memoria
    if (this.isBrowser) {
      this.memoryToken = localStorage.getItem(this.TOKEN_KEY);
    }
  }

  // Guardar el token en el localStorage
  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // Obtener el token del localStorage
  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Eliminar el token del localStorage
  removeToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  isValidToken(): boolean {
    if (!this.isBrowser) {
      return false; // En el servidor siempre retornamos false
    }
    const token = this.getToken();
    return !!token;
  }
}
