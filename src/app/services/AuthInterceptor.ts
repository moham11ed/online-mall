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
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isAuthRequest(request)) {
      return next.handle(request);
    }

    const token = this.authService.getToken();

    if (token && this.authService.isTokenExpired() && !this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.refreshToken().pipe(
        switchMap((response: AuthResponse) => {
          this.isRefreshing = false;
          request = this.addToken(request, response.token);
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.handleAuthError();
          return throwError(() => error);
        })
      );
    }

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.handleAuthError();
        } else if (error.status === 403) {
          this.handleForbiddenError();
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private isAuthRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('/auth/');
  }

  private handleAuthError(): void {
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams: { 
        returnUrl: this.router.url,
        error: 'session_expired'
      }
    });
  }

  private handleForbiddenError(): void {
    this.router.navigate(['/unauthorized'], {
      queryParams: { 
        returnUrl: this.router.url,
        error: 'forbidden'
      }
    });
  }
}