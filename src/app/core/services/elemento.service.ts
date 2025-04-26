import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Elemento } from '../models/documentos/elemento';
import { ElementoPapelera } from '../models/documentos/elementoPapeleraResponse';
import { ElementoFavorito } from '../models/documentos/elementoFavoritoReponse';

/**
 * Servicio para gestionar las operaciones relacionadas con los elementos (carpetas y archivos).
 */
@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private readonly API_URL: string = `${environment.URL_API}/elementos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el contenido de una carpeta específica
   * @param carpetaId ID de la carpeta
   * @returns Observable con el contenido de la carpeta
   */
  obtenerContenidoCarpeta(carpetaId: number): Observable<Elemento[]> {
    return this.http.get<Elemento[]>(`${this.API_URL}/${carpetaId}/contenido`);
  }

  /**
   Obtener los elementos favoritos
   * @returns Observable con la lista de elementos
   */
  obtenerFavoritos(): Observable<ElementoFavorito[]> {
    return this.http.get<ElementoFavorito[]>(`${this.API_URL}/favoritos`);
  }

  marcarElementoComoFavorito(
    elementoId: number,
    elemento: 'CARPETA' | 'ARCHIVO'
  ): Observable<ElementoFavorito> {
    return this.http.post<ElementoFavorito>(
      `${this.API_URL}/favoritos/${elementoId}`,
      null,
      {
        params: {
          elemento,
        },
      }
    );
  }

  moverElementoPapelera(
    elementoId: number,
    elemento: 'CARPETA' | 'ARCHIVO'
  ): Observable<ElementoFavorito> {
    return this.http.post<ElementoFavorito>(
      `${this.API_URL}/papelera/${elementoId}`,
      null,
      {
        params: {
          elemento,
        },
      }
    );
  }

  obtenerPapelera(): Observable<ElementoPapelera[]> {
    return this.http.get<ElementoPapelera[]>(`${this.API_URL}/papelera`);
  }
}
