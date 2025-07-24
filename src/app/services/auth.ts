import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  public authData$ = this.authDataSubject.asObservable();

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
      console.log('Loaded auth data from TransferState:', authData);
    } else if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem('auth_data');
      console.log('Raw auth_data from localStorage:', storedData);
      if (storedData) {
        authData = JSON.parse(storedData);
        console.log('Parsed auth data:', authData);
      }
    }

    if (authData) {
      this.authDataSubject.next(authData);
    } else {
      console.log('No auth data found');
    }
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        console.log('Login response:', response);
        this.setAuthData(response);
      })
    );
  }

  register(userData: { email: string, password: string, role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, userData);
  }

  private setAuthData(authData: AuthResponse): void {
    console.log('Setting auth data:', authData);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_data', JSON.stringify(authData));
    }
    this.transferState.set(AUTH_DATA_KEY, authData);
    this.authDataSubject.next(authData);
  }

  getAuthData(): AuthResponse | null {
    let authData: AuthResponse | null = null;

    if (this.transferState.hasKey(AUTH_DATA_KEY)) {
      authData = this.transferState.get(AUTH_DATA_KEY, null);
      console.log('Auth data from TransferState:', authData);
    } else if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem('auth_data');
      console.log('Raw auth_data from localStorage:', storedData);
      if (storedData) {
        authData = JSON.parse(storedData);
        console.log('Parsed auth data:', authData);
      }
    }

    return authData;
  }

  getToken(): string | null {
    const authData = this.getAuthData();
    console.log('Retrieved token:', authData?.token);
    return authData?.token || null;
  }

  logout(): void {
    console.log('Logging out, clearing auth data');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_data');
    }
    this.transferState.remove(AUTH_DATA_KEY);
    this.authDataSubject.next(null);
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.getToken();
    console.log('Authentication status:', isAuth);
    return isAuth;
  }

  getUserRoles(): string[] {
    const authData = this.getAuthData();
    const roles = authData?.roles || [];
    console.log('User roles:', roles);
    return roles;
  }

  isInRole(role: string): boolean {
    const roles = this.getUserRoles();
    console.log('Checking for role:', role, 'in roles:', roles);
    return roles.includes(role);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  isTokenExpired(): boolean {
    const authData = this.getAuthData();
    if (!authData?.expiration) {
      console.log('No expiration data, token considered expired');
      return true;
    }
    
    const expirationDate = new Date(authData.expiration);
    const isExpired = expirationDate <= new Date();
    console.log('Token expiration check:', { expirationDate, isExpired });
    return isExpired;
  }

  refreshToken(): Observable<AuthResponse> {
    console.log('Attempting to refresh token');
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap(response => {
        console.log('Token refresh successful:', response);
        this.setAuthData(response);
      })
    );
  }
}