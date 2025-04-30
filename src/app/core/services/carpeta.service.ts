import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Carpeta } from '../models/documentos/carpeta';
import { catchError, tap } from 'rxjs/operators';
import { ElementoPapelera } from '../models/documentos/elementoPapeleraResponse';

/**
 * Servicio para gestionar las operaciones relacionadas con carpetas.
 * Proporciona métodos para crear, obtener, mover, renombrar y eliminar carpetas.
 */
@Injectable({
  providedIn: 'root',
})
export class CarpetaService {

  /** Subject para notificar cambios en las carpetas */
  private carpetaCreadaSubject: Subject<Carpeta> = new Subject<Carpeta>();

  /** Observable público para suscribirse a cambios en las carpetas */
  public carpetaCreada$: Observable<Carpeta> =
    this.carpetaCreadaSubject.asObservable();

  /** Subject para notificar que se debe recargar el contenido de una carpeta */
  private recargarContenidoSubject = new Subject<number>();
  /** Observable público para suscribirse a eventos de recarga de contenido */
  recargarContenido$ = this.recargarContenidoSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Notifica que se debe recargar el contenido de una carpeta
   * @param carpetaId ID de la carpeta a recargar
   */
  notificarRecargarContenido(carpetaId: number): void {
    this.recargarContenidoSubject.next(carpetaId);
  }
}
