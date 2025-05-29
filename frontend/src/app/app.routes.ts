import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'product-list', loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent), canActivate: [authGuard] },
  { path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
  { path: 'order-history', loadComponent: () => import('./order-history/order-history-component.component').then(m => m.OrderHistoryComponent), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./pages/auth/sign-in.component').then(m => m.SignInComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/sign-up.component').then(m => m.SignUpComponent) },
  { path: 'admin', loadComponent: () => import('./admin-panel/admin-panel.component').then(m => m.AdminPanelComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] }
];