import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable, of } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';
import { decodeJwtPayload, getRoleFromPayload } from './token.helper';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<{ userId: number, username: string, role: string } | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initFromStorage();
  }

  private initFromStorage() {
    const token = localStorage.getItem('tms_token');
    if (token) {
      const payload = decodeJwtPayload(token);
      const role = getRoleFromPayload(payload) || (localStorage.getItem('tms_user_role') ?? '');
      const username = payload?.unique_name ?? localStorage.getItem('tms_user_name') ?? '';
      const userId = parseInt(payload?.sub ?? (localStorage.getItem('tms_user_id') ?? '0'), 10);
      this.userSubject.next({ userId, username, role });
    }
  }

  login(req: LoginRequest) {
     return this.http.post<AuthResponse>(`${this.baseUrl}/login`, req).pipe(
      tap(res => {
        localStorage.setItem('tms_token', res.accessToken);
        localStorage.setItem('tms_user_id', String(res.userId));
        localStorage.setItem('tms_user_name', res.username);
        localStorage.setItem('tms_user_role', res.role);
        this.userSubject.next({ userId: res.userId, username: res.username, role: res.role });
      })
    );
  }

  register(req: RegisterRequest) {
     return this.http.post<AuthResponse>(`${this.baseUrl}/register`, req).pipe(
      tap(res => {
        localStorage.setItem('tms_token', res.accessToken);
        localStorage.setItem('tms_user_id', String(res.userId));
        localStorage.setItem('tms_user_name', res.username);
        localStorage.setItem('tms_user_role', res.role);
        this.userSubject.next({ userId: res.userId, username: res.username, role: res.role });
      })
    );
  }

  logout() {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user_id');
    localStorage.removeItem('tms_user_name');
    localStorage.removeItem('tms_user_role');
    this.userSubject.next(null);
  }

  getToken() {
    return localStorage.getItem('tms_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return localStorage.getItem('tms_user_role');
  }
}
