import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  AuthService } from '../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        alert('Login successful!');
        
        if (this.authService.isInRole('Admin')) {
         
          this.router.navigate(['/admin']);
        } else if (this.authService.isInRole('Vendor')) {
          this.router.navigate(['/vendor']);
        } else if (this.authService.isInRole('Customer')) {
          this.router.navigate(['/user']);
        } else {
          
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}