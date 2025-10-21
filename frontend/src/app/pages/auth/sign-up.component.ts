import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, this.usernameValidator]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.passwordValidator]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.matchPasswords });

  submit() {
    if (this.form.invalid) return;

    this.apiService.signUp(this.form.value as { name: string; email: string; password: string }).subscribe({
      next: () => {
        alert('Registration successful. Please login.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        if (error.status === 400 && error.error.message) {
          if (error.error.message.includes('Password')) {
            this.form.controls.password.setErrors({ backend: error.error.message });
          }
          if (error.error.message.includes('email')) {
            this.form.controls.email.setErrors({ backend: error.error.message });
          }
          if (error.error.message.includes('name')) {
            this.form.controls.name.setErrors({ backend: error.error.message });
          }
        } else if (error.status === 409 && error.error.message) {
          this.form.controls.name.setErrors({ backend: error.error.message });
        } else {
          alert('Registration failed');
        }
      }
    });
  }

  private usernameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const isValid = /^[a-zA-Z0-9_]+$/.test(value);
    return isValid ? null : { invalidUsername: 'Username can only contain letters, numbers, and underscores.' };
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 6;
    if(!isValidLength) {
      return { weakPassword: 'Password must be at least 6 characters long.' };
    } 
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return { weakPassword: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.' };
    }

    return null;
  }

  private matchPasswords(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordsMismatch: 'Passwords do not match.' };
  }
}