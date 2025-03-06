import {Injectable} from '@angular/core';
import {LoginRequest} from '../../models/auth/loginRequest';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LoginResponse} from '../../models/auth/loginResponse';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log("Credenciales: ", credentials);
    return this.http.post<LoginResponse>(`${this.apiUrl}/authlogin`, {})
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
