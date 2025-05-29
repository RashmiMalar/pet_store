import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { CartService } from '../cart.service';
import { LocationStrategy } from '@angular/common';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  seller: string;
  stock: number;
  images?: { image: { data: number[] } }[];
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchText = '';
  selectedCategory = 'all';
  sortOption = 'default'; // Add sort option
  cartMessage: string | null = null;
  wishlistMessage: string | null = null;
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Wishlist state
  wishlist: { productId: string, name: string, price: number }[] = [];

  // Modal state
  selectedProduct: Product | null = null;
  showModal = false;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    this.preventBackNavigation();
    this.checkLoginStatus();
    this.loadProducts();
    this.loadWishlist();
  }

  private preventBackNavigation(): void {
    history.pushState(null, '', window.location.href);
    this.locationStrategy.onPopState(() => {
      history.pushState(null, '', window.location.href);
    });
  }

  private checkLoginStatus(): void {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      alert('You must login to access this page.');
      this.router.navigate(['/login']);
    }
  }

  private loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (prods) => {
        this.products = prods;
        this.updatePagination();
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  sortProducts(): void {
    let sortedProducts = [...this.products];
    switch (this.sortOption) {
      case 'a-z':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        sortedProducts = [...this.products]; // Reset to original order
        break;
    }
    this.products = sortedProducts;
    this.updatePagination();
  }

  updatePagination(): void {
    const filtered = this.products.filter(p => {
      const matchCat = this.selectedCategory === 'all'
        || p.category.toLowerCase() === this.selectedCategory.toLowerCase();
      const matchText = p.name.toLowerCase().includes(this.searchText.toLowerCase());
      return matchCat && matchText;
    });
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.filteredProducts = filtered.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  filterProducts(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  addToCart(product: Product): void {
    if (product.stock > 0) {
      this.cartService.addToCart({ product, quantity: 1 });
      product.stock--;
      this.showCartMessage(`${product.name} added to cart!`);
      this.updatePagination();
    } else {
      this.showCartMessage(`${product.name} is out of stock!`);
    }
  }

  incrementQuantity(productId: string): void {
    const p = this.products.find(x => x._id === productId);
    if (p && p.stock > 0) {
      this.cartService.increment(productId);
      p.stock--;
      this.updatePagination();
    } else {
      this.showCartMessage(`${p?.name || 'Product'} is out of stock!`);
    }
  }

  decrementQuantity(productId: string): void {
    const p = this.products.find(x => x._id === productId);
    if (!p) return;
    const qty = this.getQuantity(productId);
    if (qty > 0) {
      this.cartService.decrement(productId);
      p.stock++;
      this.updatePagination();
    }
  }

  removeFromCart(productId: string): void {
    const p = this.products.find(x => x._id === productId);
    const qty = this.getQuantity(productId);
    if (p) {
      p.stock += qty;
    }
    this.cartService.removeFromCart(productId);
    this.showCartMessage(`${p?.name || 'Product'} removed from cart!`);
    this.updatePagination();
  }

  isInCart(productId: string): boolean {
    return this.cartService.getCartItems().some(i => i.product._id === productId);
  }

  getQuantity(productId: string): number {
    const item = this.cartService.getCartItems().find(i => i.product._id === productId);
    return item ? item.quantity : 0;
  }

  getTotalItemsInCart(): number {
    return this.cartService.getCartItems().reduce((sum, i) => sum + i.quantity, 0);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  showCartMessage(message: string): void {
    this.cartMessage = message;
    setTimeout(() => this.cartMessage = null, 3000);
  }

  showWishlistMessage(message: string): void {
    this.wishlistMessage = message;
    setTimeout(() => this.wishlistMessage = null, 3000);
  }

  getProductImageSrc(product: Product): string | null {
    if (product.images?.[0]?.image?.data) {
      const bytes = new Uint8Array(product.images[0].image.data);
      let binary = '';
      bytes.forEach(b => binary += String.fromCharCode(b));
      return `data:image/jpeg;base64,${btoa(binary)}`;
    }
    return null;
  }

  // --- Modal logic ------------------

  viewDetails(product: Product): void {
    this.selectedProduct = product;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.showModal) {
      this.closeModal();
    }
  }

  // --- Wishlist logic ------------------

  toggleWishlist(product: Product): void {
    const isInWishlist = this.isInWishlist(product._id);
    if (isInWishlist) {
      this.apiService.removeFromWishlist(product._id).subscribe({
        next: (wishlist) => {
          this.wishlist = wishlist.products;
          this.showWishlistMessage(`${product.name} removed from wishlist!`);
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
          this.showWishlistMessage('Failed to remove from wishlist.');
        }
      });
    } else {
      const productData = { productId: product._id, name: product.name, price: product.price };
      this.apiService.addToWishlist(productData).subscribe({
        next: (wishlist) => {
          this.wishlist = wishlist.products;
          this.showWishlistMessage(`${product.name} added to wishlist!`);
        },
        error: (err) => {
          console.error('Error adding to wishlist:', err);
          this.showWishlistMessage('Failed to add to wishlist.');
        }
      });
    }
  }

  isInWishlist(productId: string): boolean {
    return this.wishlist.some(item => item.productId === productId);
  }

  private loadWishlist(): void {
    this.apiService.getWishlist().subscribe({
      next: (wishlist) => {
        this.wishlist = wishlist.products || [];
      },
      error: (err) => console.error('Error loading wishlist:', err)
    });
  }

  isLowStock(stock: number): boolean {
    return stock > 0 && stock < 5;
  }
}