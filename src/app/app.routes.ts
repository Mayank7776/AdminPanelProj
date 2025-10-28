import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './pages/auth/login/login';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { ResetPassword } from './pages/auth/reset-password/reset-password';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { Role } from './pages/role/role';
import { Cms } from './pages/cms/cms';
import { Faq } from './pages/faq/faq';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  // 🔓 Public routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  // 🔒 Protected routes inside Layout
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard, canActivate: [roleGuard(['Admin', 'Manager', 'Developer'])] },
      { path: 'users', component: Users, canActivate: [roleGuard(['Admin', 'Manager'])] },
      { path: 'roles', component: Role, canActivate: [roleGuard(['Admin','Manager'])] },
      { path: 'cms', component: Cms, canActivate: [roleGuard(['Admin', 'Manager','Developer'])] },
      { path: 'faq', component: Faq, canActivate: [roleGuard(['Admin', 'Manager', 'OnlyFAQ','Developer'])] },
    ],
  },

  // 🧭 Fallback
  { path: '**', redirectTo: 'dashboard' },
];
