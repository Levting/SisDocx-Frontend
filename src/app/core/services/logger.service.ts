import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private isDevelopment = !environment.production;

  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`🔍 ${message}`, ...args);
    }
  }

/*   auth(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      // Si el primer argumento es un objeto de usuario, formatearlo
      if (args.length > 0 && typeof args[0] === 'object' && 'id' in args[0]) {
        const user = args[0];
        const formattedUser = {
          id: user.id,
          nombre: `${user.nombre} ${user.apellido}`,
          correo: user.correo,
          rol: user.rol?.nombre,
          estado: user.estado,
        };
        console.log(`🔐 ${message}`, formattedUser);
      } else {
        console.log(`🔐 ${message}`, ...args);
      }
    }
  } */
}
