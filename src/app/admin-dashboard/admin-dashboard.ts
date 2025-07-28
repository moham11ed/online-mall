import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from "@angular/forms";
import { CurrencyPipe, DatePipe, NgForOf, NgIf } from "@angular/common";
import { RouterLink, Router } from "@angular/router";

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, CurrencyPipe, RouterLink, DatePipe, NgForOf, NgIf],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  apiUrl = environment.apiUrl;
  dashboardStats: any = {};
  recentOrders: any[] = [];
  topProducts: any[] = [];
  dailySales: any[] = [];
  commissionData: any[] = [];
  vendors: any[] = [];
  users: any[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Checking admin role access');
    if (!this.authService.isAuthenticated()) {
      console.error('User is not authenticated');
      alert('Please log in to access the admin dashboard.');
      this.router.navigate(['/login'], { queryParams: { error: 'not-authenticated' } });
      return;
    }

    if (!this.authService.isInRole('Admin')) {
      console.error('User does not have admin role');
      alert('You are not authorized to access the admin dashboard.');
      this.router.navigate(['/login'], { queryParams: { error: 'not-authorized' } });
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.http.get(`${this.apiUrl}/admin/reports/summary`).subscribe({
      next: (data: any) => {
        this.dashboardStats = data;
        this.isLoading = false;
        console.log('Dashboard stats loaded:', data);
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.handleError(err);
      }
    });

    this.http.get(`${this.apiUrl}/admin/orders-management/all?limit=5`).subscribe({
      next: (data: any) => {
        this.recentOrders = data;
        this.isLoading = false;
        console.log('Recent orders loaded:', data);
      },
      error: (err) => {
        console.error('Error loading recent orders:', err);
        this.handleError(err);
      }
    });

    this.http.get(`${this.apiUrl}/admin/reports/top-products`).subscribe({
      next: (data: any) => {
        this.topProducts = data;
        this.isLoading = false;
        console.log('Top products loaded:', data);
      },
      error: (err) => {
        console.error('Error loading top products:', err);
        this.handleError(err);
      }
    });

    this.http.get(`${this.apiUrl}/admin/reports/daily-sales`).subscribe({
      next: (data: any) => {
        this.dailySales = data;
        this.isLoading = false;
        console.log('Daily sales loaded:', data);
      },
      error: (err) => {
        console.error('Error loading daily sales:', err);
        this.handleError(err);
      }
    });

    this.http.get(`${this.apiUrl}/admin/commissions/by-store`).subscribe({
      next: (data: any) => {
        this.commissionData = data;
        this.isLoading = false;
        console.log('Commission data loaded:', data);
      },
      error: (err) => {
        console.error('Error loading commission data:', err);
        this.handleError(err);
      }
    });

    this.http.get(`${this.apiUrl}/admin/vendors`).subscribe({
      next: (data: any) => {
        this.vendors = data;
        this.isLoading = false;
        console.log('Vendors loaded:', data);
      },
      error: (err) => {
        console.error('Error loading vendors:', err);
        this.handleError(err);
      }
    });

    this.http.get(`${this.apiUrl}/admin/users/all`).subscribe({
      next: (data: any) => {
        this.users = data;
        this.isLoading = false;
        console.log('Users loaded:', data);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.handleError(err);
      }
    });
  }

  private handleError(error: any): void {
    this.isLoading = false;
    if (error.status === 401) {
      alert('You are not authorized. Please log in again.');
      this.router.navigate(['/login'], { queryParams: { error: 'unauthorized' } });
    } else if (error.status === 403) {
      alert('You do not have permission to access this resource.');
      this.router.navigate(['/login'], { queryParams: { error: 'forbidden' } });
    } else if (error.status === 404) {
      alert('Resource not found. Please check the API endpoint.');
    } else {
      alert('An error occurred. Please try again later.');
    }
  }

  performVendorAction(vendorId: number, action: string): void {
    this.isLoading = true;
    this.http.post(`${this.apiUrl}/admin/vendors/action`, {
      VendorID: vendorId,
      Action: action
    }).subscribe({
      next: () => {
        alert(`Vendor ${action}d successfully`);
        this.loadDashboardData();
      },
      error: (err) => {
        console.error(`Error ${action} vendor:`, err);
        this.handleError(err);
      }
    });
  }

  updateUserRole(userId: string, newRole: string): void {
    this.isLoading = true;
    this.http.post(`${this.apiUrl}/admin/users/update-role`, {
      UserId: userId,
      NewRole: newRole
    }).subscribe({
      next: () => {
        alert('User role updated successfully');
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error updating user role:', err);
        this.handleError(err);
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/admin/users/${userId}`).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.handleError(err);
        }
      });
    }
  }
}