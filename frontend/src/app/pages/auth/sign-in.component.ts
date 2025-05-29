import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required], // Can be admin username or user email
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;

    const username = this.form.value.username || '';
    const password = this.form.value.password || '';

    // Check if the credentials are for an admin
    if (username === 'admin' && password === 'admin123') {
      alert('Admin login successful');
      localStorage.setItem('isLoggedIn', 'true'); // Set isLoggedIn for admin
      this.router.navigate(['/admin']); // Redirect to admin panel
      return;
    }

    // Regular user login
    this.apiService.signIn({ email: username, password }).subscribe({
      next: (response: any) => {
        alert('User login successful');
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('isLoggedIn', 'true'); // Set isLoggedIn for user
        this.router.navigate(['/home']); // Redirect to home page
      },
      error: () => alert('Invalid credentials')
    });
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']); // Redirect to login page
  }
}