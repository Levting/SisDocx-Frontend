import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CampanaMedicion } from '../models/documentos/campana-medicion.model';
import { SubirCampanaMedicionRequest } from '../models/documentos/subir-campana-medicion-request.model';

@Injectable({
  providedIn: 'root',
})
export class CampanaMedicionService {
  private readonly API_URL = `${environment.URL_API}/campanas-medicion`;

  private http: HttpClient = inject(HttpClient);

  obtenerCampanasMedicion(): Observable<CampanaMedicion[]> {
    return this.http.get<CampanaMedicion[]>(`${this.API_URL}`);
  }

  subirCampanaMedicion(
    request: SubirCampanaMedicionRequest
  ): Observable<CampanaMedicion> {
    const formData = new FormData();
    formData.append('archivo', request.archivo);
    return this.http.post<CampanaMedicion>(`${this.API_URL}`, formData);
  }
}
