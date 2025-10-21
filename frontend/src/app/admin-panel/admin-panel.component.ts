import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Base64Pipe } from '../base64.pipe';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, Base64Pipe],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent implements OnInit {
  // Product-related
  formData: any = {
    name: '',
    category: '',
    price: 0,
    description: '',
    seller: '',
    stock: 0,
  };
  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;
  successMessage: string | null = null;
  productsErrorMessage: string | null = null;
  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  editMode = false;
  editingProductId: string | null = null;

  // Order-related
  orders: any[] = [];
  filteredOrders: any[] = [];
  ordersErrorMessage: string | null = null;
  searchTermOrders: string = '';

  // UI State
  activeTab: string = 'dashboard';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }

  // Product Logic
  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (res) => {
        this.products = res;
        this.filteredProducts = res;
      },
      error: () => {
        this.productsErrorMessage = 'Failed to load products';
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (!this.selectedFile && !this.editMode) {
      this.productsErrorMessage = 'Please select an image file';
      return;
    }

    const payload = new FormData();
    payload.append('name', this.formData.name);
    payload.append('category', this.formData.category);
    payload.append('price', this.formData.price.toString());
    payload.append('description', this.formData.description || '');
    payload.append('seller', this.formData.seller);
    payload.append('stock', this.formData.stock.toString());

    if (this.selectedFile) {
      payload.append('image', this.selectedFile);
    }

    if (this.editMode && this.editingProductId) {
      this.apiService.updateProduct(this.editingProductId, payload).subscribe({
        next: () => {
          this.successMessage = 'Product updated successfully';
          this.resetForm();
          this.loadProducts();
        },
        error: () => {
          this.productsErrorMessage = 'Failed to update product';
        },
      });
    } else {
      this.apiService.createProduct(payload).subscribe({
        next: () => {
          this.successMessage = 'Product added successfully';
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Create error:', err);
          this.productsErrorMessage = 'Failed to create product';
        },
      });
    }
  }

  editProduct(product: any): void {
    this.editMode = true;
    this.editingProductId = product._id;

    this.formData = {
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      seller: product.seller,
      stock: product.stock,
    };

    this.selectedFile = null;

    if (product.images?.[0]?.image?.data) {
      const binary = new Uint8Array(product.images[0].image.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      );
      const base64 = btoa(binary);
      this.previewImage = `data:image/jpeg;base64,${base64}`;
    } else {
      this.previewImage = null;
    }
  }

  deleteProduct(id: string): void {
    this.apiService.deleteProduct(id).subscribe({
      next: () => {
        this.successMessage = 'Product deleted';
        this.loadProducts();
      },
      error: () => {
        this.productsErrorMessage = 'Failed to delete product';
      },
    });
  }

  resetForm(): void {
    this.formData = {
      name: '',
      category: '',
      price: 0,
      description: '',
      seller: '',
      stock: 0,
    };
    this.selectedFile = null;
    this.previewImage = null;
    this.editMode = false;
    this.editingProductId = null;
    this.productsErrorMessage = null;
  }

  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
  }

  // Order Logic
  loadOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (res) => {
        this.orders = res;
        this.filteredOrders = res;
        if (res.length === 0) {
          this.ordersErrorMessage = 'No orders found';
        }
      },
      error: () => {
        this.ordersErrorMessage = 'Failed to load orders';
      },
    });
  }

  updateOrderStatus(id: string, status: string): void {
    this.apiService.updateOrderStatus(id, status).subscribe({
      next: () => {
        this.successMessage = 'Order status updated successfully';
        this.loadOrders();
      },
      error: () => {
        this.ordersErrorMessage = 'Failed to update order status';
      },
    });
  }

  onStatusChange(order: any): void {
    // Placeholder to handle status change before saving
  }

  filterOrders(): void {
    const term = this.searchTermOrders.toLowerCase();
    this.filteredOrders = this.orders.filter(
      (order) => order.status.toLowerCase().includes(term)
    );
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getCartItemsNames(order: any): string {
    if (!order.cartItems || order.cartItems.length === 0) return 'No items';
    return order.cartItems
      .map((item: any) => item.name || item.product?.name || 'Unnamed')
      .join(', ');
  }

  calculateOrderAmount(order: any): string {
    if (!order.cartItems || order.cartItems.length === 0) return '0';
    const total = order.cartItems.reduce((sum: number, item: any) => {
      const price = item.price || item.product?.price || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
    return total.toFixed(2);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']).then(() => {
      this.location.replaceState('/login');
    });
  }
}