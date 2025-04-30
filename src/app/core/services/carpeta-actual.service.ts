import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Carpeta } from '../models/documentos/carpeta';

/**
 * Servicio para gestionar la carpeta actual en la que se encuentra el usuario.
 * Mantiene el estado de la carpeta actual y proporciona métodos para manipularla.
 */
@Injectable({
  providedIn: 'root',
})
export class CarpetaActualService {
  // Subject para mantener la carpeta actual
  private carpetaActualSubject = new BehaviorSubject<Carpeta | null>(null);

  // Observable para que otros componentes se suscriban
  public carpetaActual$: Observable<Carpeta | null> =
    this.carpetaActualSubject.asObservable();

  private recargarContenidoSubject = new Subject<void>();
  public recargarContenido$ = this.recargarContenidoSubject.asObservable();

  // Obtener la carpeta actual
  obtenerCarpetaActual(): Carpeta | null {
    return this.carpetaActualSubject.value;
  }

  // Establecer la carpeta actual
  actualizarCarpetaActual(carpeta: Carpeta): void {
    this.carpetaActualSubject.next(carpeta);
  }

  // Recargar contenido actual
  recargarContenidoActual(): void {
    this.recargarContenidoSubject.next();
  }

  // Método adicional para actualizar la carpeta actual desde el breadcrumb
  actualizarCarpetaDesdeBreadcrumb(carpeta: Carpeta): void {
    this.carpetaActualSubject.next(carpeta);
  }

  // Reiniciar la carpeta actual (utilizado cuando se navega fuera de documentos)
  reiniciarCarpetaActual(): void {
    this.carpetaActualSubject.next(null);
  }
}
