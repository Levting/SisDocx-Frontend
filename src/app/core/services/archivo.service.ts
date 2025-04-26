import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Archivo } from '../models/documentos/archivo';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {
  private readonly API_URL = `${environment.URL_API}/archivos`;

  constructor(private http: HttpClient) {}

  // Subir un archivo
  subirArchivo(archivo: Archivo): Observable<Archivo> {
    return this.http.post<Archivo>(`${this.API_URL}/subir`, archivo);
  }
  // Obtener todos los archivos
  obtenerArchivos(): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${this.API_URL}`);
  }

  // Obtener un archivo específico
  obtenerArchivo(archivoId: number): Observable<Archivo> {
    return this.http.get<Archivo>(`${this.API_URL}/${archivoId}`);
  }

  // Descargar un archivo
  descargarArchivo(archivoId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${archivoId}/descargar`, {
      responseType: 'blob',
    });
  }

  // Renombrar un archivo
  renombrarArchivo(
    archivoId: number,
    nuevoNombre: string
  ): Observable<Archivo> {
    return this.http.put<Archivo>(`${this.API_URL}/${archivoId}`, {
      nombre: nuevoNombre,
    });
  }

  // Mover un archivo a una carpeta
  moverArchivo(archivoId: number, carpetaId: number): Observable<Archivo> {
    return this.http.put<Archivo>(`${this.API_URL}/${archivoId}/mover`, {
      carpetaId: carpetaId,
    });
  }

  // Copiar un archivo a una carpeta
  copiarArchivo(archivoId: number, carpetaId: number): Observable<Archivo> {
    return this.http.put<Archivo>(`${this.API_URL}/${archivoId}/copiar`, {
      carpetaId: carpetaId,
    });
  }

  // Eliminar un archivo
  eliminarArchivo(archivoId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${archivoId}`);
  }
}
