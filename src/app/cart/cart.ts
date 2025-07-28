import { Component } from '@angular/core';
import { NgForOf, NgIf, CurrencyPipe } from "@angular/common";
import { CartService } from '../services/cart';


@Component({
  selector: 'app-cart',
  imports: [NgForOf, NgIf, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  standalone: true
})
export class Cart {
  constructor(public cartService: CartService) {}

  increaseQuantity(groupIndex: number, productIndex: number): void {
    this.cartService.increaseQuantity(groupIndex, productIndex);
  }

  decreaseQuantity(groupIndex: number, productIndex: number): void {
    this.cartService.decreaseQuantity(groupIndex, productIndex);
  }

  removeProduct(groupIndex: number, productIndex: number): void {
    this.cartService.removeProduct(groupIndex, productIndex);
  }

  calculateSubtotal(group: any): number {
    return this.cartService.calculateSubtotal(group);
  }

  calculateTotal(): number {
    return this.cartService.calculateTotal();
  }
}