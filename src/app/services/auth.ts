import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/core';

const AUTH_DATA_KEY = makeStateKey<any>('auth_data');

export interface AuthResponse {
  token: string;
  expiration: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authDataSubject = new BehaviorSubject<AuthResponse | null>(null);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) {
    this.loadAuthData();
  }

  private loadAuthData(): void {
    let authData: AuthResponse | null = null;

    if (this.transferState.hasKey(AUTH_DATA_KEY)) {
      authData = this.transferState.get(AUTH_DATA_KEY, null);
    } else if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem('auth_data');
      if (storedData) {
        authData = JSON.parse(storedData);
      }
    }

    this.authDataSubject.next(authData);
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.setAuthData(response);
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  register(userData: { email: string, password: string, role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  private setAuthData(authData: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_data', JSON.stringify(authData));
    }
    this.transferState.set(AUTH_DATA_KEY, authData);
    this.authDataSubject.next(authData);
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_data');
    }
    this.transferState.remove(AUTH_DATA_KEY);
    this.authDataSubject.next(null);
  }

  getToken(): string | null {
    const authData = this.authDataSubject.value;
    return authData?.token || null;
  }

  logout(): void {
    this.clearAuthData();
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  getUserRoles(): string[] {
    const authData = this.authDataSubject.value;
    return authData?.roles || [];
  }

  isInRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  isTokenExpired(): boolean {
    const authData = this.authDataSubject.value;
    if (!authData?.expiration) return true;
    
    const expirationDate = new Date(authData.expiration);
    return expirationDate <= new Date();
  }
}