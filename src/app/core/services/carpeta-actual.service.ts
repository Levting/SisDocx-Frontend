import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Carpeta } from '../models/documentos/carpeta.model';

/**
 * Servicio para gestionar la carpeta actual en la que se encuentra el usuario.
 * Mantiene el estado de la carpeta actual y proporciona métodos para manipularla.
 * También maneja la actualización del contenido después de acciones.
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

  // Subject para notificar que se debe recargar el contenido
  private recargarContenidoSubject = new Subject<number | null>();
  public recargarContenido$ = this.recargarContenidoSubject.asObservable();

  /**
   * Obtiene la carpeta actual
   * @returns La carpeta actual o null si no hay carpeta seleccionada
   */
  obtenerCarpetaActual(): Carpeta | null {
    return this.carpetaActualSubject.value;
  }

  /**
   * Establece la carpeta actual y notifica a los suscriptores
   * @param carpeta La carpeta a establecer como actual
   */
  actualizarCarpetaActual(carpeta: Carpeta): void {
    this.carpetaActualSubject.next(carpeta);
  }

  /**
   * Notifica que se debe recargar el contenido de una carpeta específica
   * @param carpetaId El ID de la carpeta a recargar. Si es null, se recarga la carpeta actual
   */
  notificarRecargarContenido(carpetaId: number | null = null): void {
    this.recargarContenidoSubject.next(carpetaId);
  }

  /**
   * Reinicia la carpeta actual a null (raíz)
   * Útil cuando se navega fuera de la vista de documentos
   */
  reiniciarCarpetaActual(): void {
    this.carpetaActualSubject.next(null);
  }
}
