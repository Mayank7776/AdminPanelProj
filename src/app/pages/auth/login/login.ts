import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/service/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
showPassword: boolean = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }
    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;

        // ✅ Save tokens if backend returns them
        if (res?.accessToken) {
          localStorage.setItem('jwt_token', res.accessToken);

          // ✅ Decode token to get roles & expiry
          const decoded: any = JSON.parse(atob(res.accessToken.split('.')[1]));
          const expiry = decoded.exp * 1000; // convert to ms
          localStorage.setItem('tokenExpiry', expiry.toString());

          // ✅ Save roles from token (assuming roles are in 'roles' claim)
          const roles: string[] = decoded.roles || [];
          localStorage.setItem('user_roles', JSON.stringify(roles));
        }

        if (res?.refreshToken) {
          localStorage.setItem('refresh_token', res.refreshToken);
        }

        // ✅ Determine redirect based on role
        const roles: string[] = JSON.parse(localStorage.getItem('user_roles') || '[]');
        let redirectUrl = '/dashboard'; // default

        if (roles.includes('OnlyFAQ')) {
          redirectUrl = '/faq';
        } else if (roles.includes('Admin')) {
          redirectUrl = '/dashboard';
        } else if (roles.includes('Manager')) {
          redirectUrl = '/dashboard';
        } else if (roles.includes('Developer')) {
          redirectUrl = '/cms';
        }

        // ✅ Navigate dynamically
        this.router.navigate([redirectUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });
  }
}
