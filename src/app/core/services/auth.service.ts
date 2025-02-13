import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated: boolean = false;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    }
  }

  login(email: string, password: string): boolean {
    // Verificar las credenciales
    if (email === 'sebas@sisdocx.com' && password === 'sebas1105') {
      this.isAuthenticated = true;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true');
      }
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
    }
  }

  getIsAutenticated(): boolean {
    return this.isAuthenticated;
  }
}
