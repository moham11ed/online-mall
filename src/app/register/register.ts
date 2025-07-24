import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  AuthService } from '../services/auth';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  userData = {
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer'
  };

  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';
  private authSubscription?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    // Validate passwords match
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authSubscription = this.authService.register({
      email: this.userData.email,
      password: this.userData.password,
      role: this.userData.role
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}