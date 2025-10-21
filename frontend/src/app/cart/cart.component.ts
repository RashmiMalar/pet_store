import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../cart.service';
import { ApiService } from '../api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})

export class CartComponent implements OnInit {
  cartItems: any[] = [];

  constructor(
    private cartService: CartService,
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();

    // Disable browser back navigation
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
  }

  getTotalPrice(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  incrementQuantity(productId: string): void {
    // First, check if the product exists in the database
    this.apiService.getProductById(productId).subscribe({
      next: (product) => {
        const item = this.cartItems.find(i => i.product._id === productId);
        if (item && product && item.quantity < product.stock) {
          this.cartService.increment(productId);
          this.cartItems = this.cartService.getCartItems();
        } else {
          alert('No more stock available or product not found!');
        }
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        alert('Product not found in database!');
      }
    });
  }
  
  decrementQuantity(productId: string): void {
    // Check if the product exists in the database
    this.apiService.getProductById(productId).subscribe({
      next: (product) => {
        if (product) {
          const item = this.cartItems.find(i => i.product._id === productId);
          if (item && item.quantity > 0) {
            this.cartService.decrement(productId);
            this.cartItems = this.cartService.getCartItems();
          }
        } else {
          alert('Product not found in database!');
        }
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        alert('Product not found in database!');
      }
    });
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
    this.cartItems = this.cartService.getCartItems();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.cartItems = [];
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    this.router.navigate(['/checkout'], {
      state: {
        cartItems: this.cartItems,
        totalAmount: this.getTotalPrice().toFixed(2)
      }
    });
  }

  // 🔹 NEW: Navigate to Home
  goToHome(): void {
    this.router.navigate(['/home']);
  }

  // 🔹 NEW: Navigate to Products
  goToProducts(): void {
    this.router.navigate(['/product-list']);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']).then(() => {
      this.location.replaceState('/login');
    });
  }
}
