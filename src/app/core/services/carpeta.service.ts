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
  private readonly API_URL: string = `${environment.URL_API}/carpetas`;

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
   * Obtiene el contenido de una carpeta específica
   * @param carpetaId ID de la carpeta
   * @returns Observable con el contenido de la carpeta
   */
  obtenerContenidoCarpeta(carpetaId: number): Observable<Carpeta> {
    return this.http.get<Carpeta>(
      `${this.API_URL}/${carpetaId}/contenido`
    );
  }

  /**
   * Obtiene una carpeta por su ID
   * @param carpetaId ID de la carpeta
   * @returns Observable con la carpeta
   */
  obtenerCarpetaPorId(carpetaId: number): Observable<Carpeta> {
    return this.http.get<Carpeta>(`${this.API_URL}/${carpetaId}`);
  }

  /**
   * Crea una nueva carpeta
   * @param carpetaPadreId ID de la carpeta padre
   * @param nombre Nombre de la carpeta
   * @returns Observable con la carpeta creada
   */
  crearCarpeta(carpetaPadreId: number, nombre: string): Observable<Carpeta> {
    const crearCarpetaRequest = {
      carpetaPadreId,
      nombre,
    };
    return this.http.post<Carpeta>(this.API_URL, crearCarpetaRequest).pipe(
      tap((carpeta) => {
        // Notificar que se ha creado una carpeta
        this.carpetaCreadaSubject.next(carpeta);
        // Notificar que se debe recargar el contenido de la carpeta padre
        this.recargarContenidoSubject.next(carpetaPadreId);
      }),
      catchError((error) => {
        console.error('Error al crear la carpeta:', error);
        return of(null as any);
      })
    );
  }

  /**
   * Mover carpeta a papelera
   */
  moverCarpetaAPapelera(carpetaId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${carpetaId}/papelera`, {});
  }



  /**
   * Crea una carpeta en la raíz (carpeta padre = 1)
   * @param nombre Nombre de la carpeta
   * @returns Observable con la carpeta creada
   */
  crearCarpetaEnRaiz(nombre: string): Observable<Carpeta> {
    return this.crearCarpeta(1, nombre);
  }

  /**
   * Mueve una carpeta a una nueva ubicación
   * @param carpetaId ID de la carpeta a mover
   * @param ruta Nueva ruta de la carpeta
   * @returns Observable con el resultado de la operación
   */
  moverCarpeta(carpetaId: number, ruta: number[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${carpetaId}/mover`, { ruta });
  }

  /**
   * Cambia el nombre de una carpeta
   * @param carpetaId ID de la carpeta
   * @param nuevoNombre Nuevo nombre de la carpeta
   * @returns Observable con el resultado de la operación
   */
  cambiarNombreCarpeta(
    carpetaId: number,
    nuevoNombre: string
  ): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${carpetaId}/nombre`, {
      nuevoNombre,
    });
  }

  /**
   * Elimina una carpeta
   * @param carpetaId ID de la carpeta a eliminar
   * @returns Observable con el resultado de la operación
   */
  eliminarCarpetaId(carpetaId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${carpetaId}`);
  }

  /**
   * Notifica que se debe recargar el contenido de una carpeta
   * @param carpetaId ID de la carpeta a recargar
   */
  notificarRecargarContenido(carpetaId: number): void {
    this.recargarContenidoSubject.next(carpetaId);
  }
}
