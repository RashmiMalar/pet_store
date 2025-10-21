import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import {HttpHeaders } from '@angular/common/http';
// Define interfaces for type safety
interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  seller: string;
  stock: number;
  image?: string;
}
interface Wishlist {
  _id: string;
  userId: string;
  products: { productId: string; name: string; price: number; addedAt: string }[];
  createdAt: string;
  updatedAt: string;
}


interface Order {
  _id: string;
  orderNumber: number;
  cartItems: any[];
  amount: string;
  status: string;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl; // Consistent base URL

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId') || '';
    return new HttpHeaders({ 'x-user-id': userId });
  }
  
  // Product-related methods
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/api/products`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/api/products/${id}`);
  }
  createProduct(data: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/api/products`, data);
  }

  // Update the method signature to accept FormData
  updateProduct(id: string, data: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/api/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/api/products/${id}`);
  }

  updateStocks(orderItems: { productId: string; quantity: number }[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/api/products/stocks/update`, { items: orderItems });
  }

  // Note: getCategories endpoint is not defined in the provided backend code
  getCategories(): Observable<string[]> {
    console.warn('getCategories endpoint may not exist in backend. Verify at /api/products/categories');
    return this.http.get<string[]>(`${this.baseUrl}/api/products/categories`);
  }

  placeOrder(order: any, userId: string): Observable<any> {
    const headers = new HttpHeaders({ 'x-user-id': userId });
    return this.http.post(`${this.baseUrl}/api/orders`, order, { headers });
  }
  

  getUserOrders(userId: string): Observable<any> {
    const headers = new HttpHeaders({ 'x-user-id': userId });
    return this.http.get(`${this.baseUrl}/api/orders/user`, { headers });
  }
  


  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/api/orders/${id}`);
  }

  updateOrder(id: string, data: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/api/orders/${id}`, data);
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.put<Order>(`${this.baseUrl}/api/orders/${id}`, { status });
  }
  

  deleteOrder(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/api/orders/${id}`);
  }


  // Auth-related methods
  signIn(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, payload);
  }

  signUp(payload: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/register`, payload);
  }

  // User-related methods 
// User-related methods
getUserById(id: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/api/auth/users/${id}`, { headers: this.getAuthHeaders() });
}

updateUser(id: string, data: any): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/api/auth/users/${id}`, data, { headers: this.getAuthHeaders() });
}
  // Wishlist-related methods
  getWishlist(): Observable<Wishlist> {
    return this.http.get<Wishlist>(`${this.baseUrl}/api/wishlist`, { headers: this.getAuthHeaders() });
  }

  addToWishlist(product: { productId: string; name: string; price: number }): Observable<Wishlist> {
    return this.http.post<Wishlist>(`${this.baseUrl}/api/wishlist`, product, { headers: this.getAuthHeaders() });
  }

  removeFromWishlist(productId: string): Observable<Wishlist> {
    return this.http.delete<Wishlist>(`${this.baseUrl}/api/wishlist/${productId}`, { headers: this.getAuthHeaders() });
  }

}