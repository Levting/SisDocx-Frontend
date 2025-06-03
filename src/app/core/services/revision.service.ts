import { inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { switchMap } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { Observable } from 'rxjs';
import { SolicitarRevisionRequest } from '../models/revision/revision-request.model';
import { RevisionDesicion } from '../models/revision/revision-desicion.model';
import { Revision } from '../models/revision/elemento-revision.model';

@Injectable({
  providedIn: 'root',
})
export class RevisionService {
  private readonly API_URL: string = `${environment.URL_API}/revisiones`;
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private logger: LoggerService = inject(LoggerService);

  private waitForAuth<T>(request: Observable<T>): Observable<T> {
    return this.authService.userLoginOn.pipe(
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) {
          // this.logger.warn('No autenticado');
          // return throwError(() => new Error('No autenticado'));
        }
        return request;
      })
    );
  }

  obtenerRevisiones(): Observable<Revision[]> {
    const url = `${this.API_URL}`;
    return this.waitForAuth(this.http.get<Revision[]>(url));
  }

  obtenerRevisionesRechazadas(): Observable<Revision[]> {
    const url = `${this.API_URL}/rechazadas`;
    return this.waitForAuth(this.http.get<Revision[]>(url));
  }

  obtenerRevisionesPendientes(): Observable<Revision[]> {
    const url = `${this.API_URL}/pendientes`;
    return this.waitForAuth(this.http.get<Revision[]>(url));
  }

  solicitarRevision(
    request: SolicitarRevisionRequest
  ): Observable<Revision> {
    const url = `${this.API_URL}/solicitar?elemento=${request.elemento}`;
    return this.waitForAuth(this.http.post<Revision>(url, request));
  }

  revisar(request: RevisionDesicion): Observable<Revision> {
    const url = `${this.API_URL}/revisar`;
    return this.waitForAuth(this.http.post<Revision>(url, request));
  }
}
