import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService, Product } from '../services/store-service';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent {
  products: Product[] = [];
  loading = true;
  error: string | null = null;
  storeId!: number;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.storeId = Number(this.route.snapshot.paramMap.get('storeId'));
    this.loadProducts();
  }

  loadProducts(): void {
    this.storeService.getStoreProducts(this.storeId).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  calculateDiscountedPrice(price: number, discount: number): number {
    return price - (price * discount / 100);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}