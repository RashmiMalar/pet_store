// 1. cart.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor() {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      this.cartItems.next(JSON.parse(storedCart));
    }

    this.cartItems$.subscribe(items => {
      localStorage.setItem('cartItems', JSON.stringify(items));
    });
  }

  addToCart(item: any) {
    const existing = this.cartItems.value.find(cartItem => cartItem.product._id === item.product._id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.next([...this.cartItems.value, item]);
    }
  }

  removeFromCart(productId: string) {
    const updated = this.cartItems.value.filter(item => item.product._id !== productId);
    this.cartItems.next(updated);
  }

  increment(productId: string) {
    const updated = this.cartItems.value.map(item => {
      if (item.product._id === productId) {
        item.quantity++;
      }
      return item;
    });
    this.cartItems.next(updated);
  }

  decrement(productId: string) {
    const updated = this.cartItems.value.map(item => {
      if (item.product._id === productId) {
        item.quantity--;
      }
      return item;
    }).filter(item => item.quantity > 0);
    this.cartItems.next(updated);
  }

  clearCart() {
    this.cartItems.next([]);
  }

  getCartItems() {
    return this.cartItems.value;
  }
}
