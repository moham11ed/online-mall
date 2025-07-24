import { Component } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'app-cart',
  imports: [NgForOf, NgIf],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  standalone: true
})
export class Cart {
  sellerGroups = [
    {
      seller: {
        id: 1,
        name: 'Tech Gadgets',
        logo: 'https://via.placeholder.com/50'
      },
      products: [
        {
          id: 101,
          name: 'Wireless Headphones',
          image: 'https://via.placeholder.com/80',
          price: 99.99,
          quantity: 2
        },
        {
          id: 102,
          name: 'Bluetooth Speaker',
          image: 'https://via.placeholder.com/80',
          price: 59.99,
          quantity: 1
        }
      ]
    },
    {
      seller: {
        id: 2,
        name: 'Fashion House',
        logo: 'https://via.placeholder.com/50'
      },
      products: [
        {
          id: 201,
          name: 'Men\'s T-Shirt',
          image: 'https://via.placeholder.com/80',
          price: 24.99,
          quantity: 3
        }
      ]
    }
  ];

  calculateSubtotal(group: any): number {
    return group.products.reduce((sum: number, product: any) => {
      return sum + (product.price * product.quantity);
    }, 0);
  }

  calculateTotal(): number {
    return this.sellerGroups.reduce((sum, group) => {
      return sum + this.calculateSubtotal(group);
    }, 0);
  }

  increaseQuantity(groupIndex: number, productIndex: number) {
    this.sellerGroups[groupIndex].products[productIndex].quantity++;
  }

  decreaseQuantity(groupIndex: number, productIndex: number) {
    if (this.sellerGroups[groupIndex].products[productIndex].quantity > 1) {
      this.sellerGroups[groupIndex].products[productIndex].quantity--;
    }
  }

  removeProduct(groupIndex: number, productIndex: number) {
    this.sellerGroups[groupIndex].products.splice(productIndex, 1);
    
    if (this.sellerGroups[groupIndex].products.length === 0) {
      this.sellerGroups.splice(groupIndex, 1);
    }
  }
}