import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, AuthService } from './auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isAuthRequest(request)) {
      console.log('Bypassing auth interceptor for:', request.url);
      return next.handle(request);
    }

    const token = this.authService.getToken();
    console.log('Token retrieved:', token);

    if (token && this.authService.isTokenExpired()) {
      console.log('Token is expired, attempting to refresh');
      return this.authService.refreshToken().pipe(
        switchMap((response: AuthResponse) => {
          console.log('Token refreshed successfully:', response.token);
          request = this.addToken(request, response.token);
          return next.handle(request);
        }),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          this.handleUnauthorized();
          return throwError(() => error);
        })
      );
    }

    if (token) {
      request = this.addToken(request, token);
      console.log('Request headers with token:', request.headers);
    } else {
      console.warn('No token found, sending request without Authorization header');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        if (error.status === 401) {
          this.handleUnauthorized();
        } else if (error.status === 403) {
          console.error('Forbidden: User may not have required permissions');
          this.router.navigate(['/login'], {
            queryParams: { error: 'forbidden' }
          });
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private isAuthRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('/auth/');
  }

  private handleUnauthorized(): void {
    console.log('Handling unauthorized access');
    if (this.authService.isTokenExpired()) {
      console.log('Token is expired, attempting refresh');
      this.authService.refreshToken().subscribe({
        next: () => {
          console.log('Token refreshed successfully, reloading page');
          window.location.reload();
        },
        error: (err) => {
          console.error('Token refresh failed:', err);
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url, error: 'unauthorized' }
          });
        }
      });
    } else {
      console.warn('No valid token or refresh failed, logging out');
      this.authService.logout();
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url, error: 'unauthorized' }
      });
    }
  }
}