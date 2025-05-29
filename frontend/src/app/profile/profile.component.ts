import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'info';
  userProfile: any = {
    firstName: '',
    lastName: '',
    gender: '',
    mobileNumber: ''
  };
  profileForm: FormGroup;
  wishlist: any[] = [];
  orders: any[] = [];
  isEditing: boolean = false;
  userId: string = '';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.userId = localStorage.getItem('userId') || '';
    this.profileForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.lettersOnlyValidator()
      ]],
      lastName: ['', [
        Validators.minLength(2),
        Validators.maxLength(50),
        this.lettersOnlyValidator()
      ]],
      gender: ['', Validators.required],
      mobileNumber: ['', [
        Validators.required,
        Validators.pattern(/^[1-9]\d{9}$/) // 10 digits, no leading zero
      ]]
    });
  }

  // Custom validator for letters only (allows spaces and hyphens)
  lettersOnlyValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // Skip if empty (handled by required validator if needed)
      const isValid = /^[A-Za-z\s\-]+$/.test(value);
      return isValid ? null : { lettersOnly: true };
    };
  }

  ngOnInit(): void {
    if (this.userId) {
      this.loadUserProfile();
      this.loadWishlist();
      this.loadOrders();
      history.pushState(null, '', window.location.href);
    } else {
      this.toastr.error('User ID not found. Please log in again.', 'Error');
      this.router.navigate(['/login']);
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: Event) {
    history.pushState(null, '', window.location.href);
    this.toastr.warning('Back navigation is disabled.', 'Warning');
  }

  goBackToHome() {
    this.router.navigate(['/home']);
  }

  startEditing() {
    this.profileForm.patchValue(this.userProfile);
    this.isEditing = true;
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.apiService.updateUser(this.userId, this.profileForm.value).subscribe({
        next: (response: any) => {
          this.userProfile = { ...this.profileForm.value };
          this.isEditing = false;
          this.toastr.success('Profile updated successfully!', 'Success');
        },
        error: (err) => {
          console.error('Error updating profile:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error
          });
          const errorMessage = err.error?.message || 'Failed to update profile.';
          this.toastr.error(errorMessage, 'Error');
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields correctly.', 'Error');
    }
  }

  loadUserProfile() {
    this.apiService.getUserById(this.userId).subscribe({
      next: (user: any) => {
        this.userProfile = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          gender: user.gender || '',
          mobileNumber: user.mobileNumber || ''
        };
      },
      error: (err) => {
        console.error('Error loading user profile:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error
        });
        const errorMessage = err.error?.message || 'Failed to load profile information.';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  loadWishlist() {
    this.apiService.getWishlist().subscribe({
      next: (wishlist: any) => {
        this.wishlist = wishlist.products || [];
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
        this.toastr.error('Failed to load wishlist.', 'Error');
      }
    });
  }

  loadOrders() {
    this.apiService.getUserOrders(this.userId).subscribe({
      next: (orders: any[]) => {
        this.orders = orders || [];
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.toastr.error('Failed to load order history.', 'Error');
      }
    });
  }
}