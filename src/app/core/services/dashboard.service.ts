import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GraficoItemDTO {
  nombre: string;
  valor: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly API_URL = `${environment.URL_API}/dashboard`;
  private http: HttpClient = inject(HttpClient);

  obtenerDatosDocumentos(): Observable<GraficoItemDTO[]> {
    return this.http.get<GraficoItemDTO[]>(`${this.API_URL}/documentos`);
  }
}
