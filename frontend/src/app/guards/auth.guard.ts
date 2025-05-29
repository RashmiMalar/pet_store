import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {
    return true; // Allow navigation if logged in
  } else {
    toastr.error('You must sign in to access this page.', 'Access Denied');
    router.navigate(['/home']); // Redirect to login page
    return false; // Prevent navigation to the protected route
  }
};
