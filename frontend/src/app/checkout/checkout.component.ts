import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { CartService } from '../cart.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PhoneFormatPipe } from '../phone-format.pipe';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PhoneFormatPipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: { product: any; quantity: number }[] = [];
  totalAmount: string = '0.00';
  thankYouMessage: string | null = null;
  checkoutForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      upiId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/)]]
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.cartItems = navigation.extras.state['cartItems'] || [];
      this.totalAmount = navigation.extras.state['totalAmount'] || '0.00';
    }
  }

  ngOnInit(): void {
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };

    this.route.queryParams.subscribe(params => {
      this.thankYouMessage = params['message'] || null;
      setTimeout(() => {
        history.pushState(null, '', location.href);
        window.onpopstate = () => {
          history.pushState(null, '', location.href);
        };
      }, 0);
    });
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly.');
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.cartItems.length === 0) {
      this.toastr.error('Your cart is empty!');
      return;
    }

    const customerDetails = this.checkoutForm.value;
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.toastr.error('You must be logged in to place an order.');
      this.router.navigate(['/login']);
      return;
    }

    const orderPayload = {
      cartItems: this.cartItems.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      amount: this.totalAmount,
      status: 'Pending',
      createdAt: new Date(),
      customerDetails: {
        name: customerDetails.name,
        address: customerDetails.address,
        phone: customerDetails.phone
      },
      upiId: customerDetails.upiId
    };

    this.apiService.placeOrder(orderPayload, userId).subscribe({
      next: () => {
        this.updateStocks();
        this.cartService.clearCart();
        this.toastr.success('Order placed successfully!');
        this.router.navigate(['/checkout'], {
          queryParams: { message: 'Thank you for your order!' }
        });
      },
      error: (err) => {
        console.error('Order error:', err);
        this.toastr.error(`Failed to place order: ${err.status} - ${err.error?.message || 'Unknown error'}`);
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/product-list']);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    this.toastr.info('Logged out successfully.');
    this.router.navigate(['/login']);
  }

  private updateStocks(): void {
    this.cartItems.forEach(item => {
      const updatedStock = item.product.stock - item.quantity;
      const formData = new FormData();
      formData.append('stock', updatedStock.toString());

      this.apiService.updateProduct(item.product._id, formData).subscribe({
        next: () => console.log(`Stock updated for product ${item.product._id}`),
        error: (err) => console.error(`Error updating stock for product ${item.product._id}:`, err)
      });
    });
  }
}