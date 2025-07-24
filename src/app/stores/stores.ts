import { Component } from '@angular/core';
import { StoreService } from '../services/store-service';
import { DatePipe, NgIf, NgForOf } from "@angular/common";

@Component({
  selector: 'app-stores',
  imports: [DatePipe, NgIf, NgForOf],
  templateUrl: './stores.html',
  styleUrl: './stores.css'
})
export class Stores {
  stores: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores(): void {
    this.storeService.getAllStores().subscribe({
      next: (data) => {
        this.stores = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load stores. Please try again later.';
        this.loading = false;
        console.error('Error loading stores:', err);
      }
    });
  }
}


