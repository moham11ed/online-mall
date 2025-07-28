import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CartService } from '../services/cart';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive ],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar implements OnInit, OnDestroy {
  isCollapsed = true;
  dropdownOpen = false;
  cartItemCount = 0;
  private cartSubscription!: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.updateCartCount();
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.updateCartCount();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  updateCartCount(): void {
    const cart = this.cartService.getCart();
    this.cartItemCount = cart.reduce((total, group) => {
      return total + group.products.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
}