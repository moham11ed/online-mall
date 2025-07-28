// product-detail.component.ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService, Product } from '../services/store-service';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent {
 product!: Product;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('productId'));
    this.loadProductDetails(productId);
  }

  loadProductDetails(productId: number): void {
    this.storeService.getProductDetails(productId).subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product details. Please try again later.';
        this.loading = false;
        console.error('Error loading product details:', err);
      }
    });
  }

  calculateDiscountedPrice(price: number, discount: number): number {
    return price - (price * discount / 100);
  }

  addToCart(): void {
    this.cartService.addToCart(this.product);
   const button = document.querySelector('.add-to-cart-btn') as HTMLElement;
    if (button) {
      button.classList.add('added');
      setTimeout(() => {
        button.classList.remove('added');
      }, 2000);
    }
  }
}
