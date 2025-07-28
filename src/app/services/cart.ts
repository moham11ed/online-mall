import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './store-service';

interface CartItem {
  product: Product;
  quantity: number;
}

interface SellerGroup {
  seller: {
    id: number;
    name: string;
    logoURL: string;
  };
  products: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private sellerGroups: SellerGroup[] = [];
  private cartSubject = new BehaviorSubject<SellerGroup[]>(this.sellerGroups);
  cart$ = this.cartSubject.asObservable();

  constructor() {}

  private updateCart(): void {
    this.cartSubject.next([...this.sellerGroups]);
  }

  addToCart(product: Product): void {
    const sellerIndex = this.sellerGroups.findIndex(
      group => group.seller.id === product.store?.storeID
    );

    if (sellerIndex !== -1) {
      const productIndex = this.sellerGroups[sellerIndex].products.findIndex(
        item => item.product.productID === product.productID
      );

      if (productIndex !== -1) {
        this.sellerGroups[sellerIndex].products[productIndex].quantity++;
      } else {
        this.sellerGroups[sellerIndex].products.push({
          product,
          quantity: 1
        });
      }
    } else {
      if (product.store) {
        this.sellerGroups.push({
          seller: {
            id: product.store.storeID,
            name: product.store.name,
            logoURL: product.store.logoURL
          },
          products: [{
            product,
            quantity: 1
          }]
        });
      }
    }
    this.updateCart();
  }

  getCart(): SellerGroup[] {
    return [...this.sellerGroups];
  }

  increaseQuantity(groupIndex: number, productIndex: number): void {
    this.sellerGroups[groupIndex].products[productIndex].quantity++;
    this.updateCart();
  }

  decreaseQuantity(groupIndex: number, productIndex: number): void {
    if (this.sellerGroups[groupIndex].products[productIndex].quantity > 1) {
      this.sellerGroups[groupIndex].products[productIndex].quantity--;
      this.updateCart();
    }
  }

  removeProduct(groupIndex: number, productIndex: number): void {
    this.sellerGroups[groupIndex].products.splice(productIndex, 1);
    
    if (this.sellerGroups[groupIndex].products.length === 0) {
      this.sellerGroups.splice(groupIndex, 1);
    }
    this.updateCart();
  }

  calculateSubtotal(group: SellerGroup): number {
    return group.products.reduce((sum, item) => {
      return sum + (this.getDiscountedPrice(item.product) * item.quantity);
    }, 0);
  }

  calculateTotal(): number {
    return this.sellerGroups.reduce((sum, group) => {
      return sum + this.calculateSubtotal(group);
    }, 0);
  }

  private getDiscountedPrice(product: Product): number {
    return product.price - (product.price * (product.discount || 0) / 100);
  }

  clearCart(): void {
    this.sellerGroups = [];
    this.updateCart();
  }
}