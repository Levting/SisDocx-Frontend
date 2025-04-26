import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // Disponible globalmente
})
export class FechaUtilsService {
  formatear(fecha: string | Date): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
