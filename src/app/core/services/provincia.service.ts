import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Provincia } from '../models/usuario/provincia.model';

@Injectable({
  providedIn: 'root',
})
export class ProvinciaService {
  private readonly API_URL = `${environment.URL_API}/provincias`;

  private http: HttpClient = inject(HttpClient);

  obtenerProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.API_URL}`);
  }
}
