import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/service/auth/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  email = '';
  message = '';
  loading = false;
  isError = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email) {
      this.message = 'Please enter your email address.';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;

        if (res?.success) {
          this.message = res.message || 'Reset link has been sent to your email.';
          this.isError = false;
        } else {
          this.message = res?.message || 'Failed to send reset link.';
          this.isError = true;
        }
      },
      error: (err) => {
        this.loading = false;

        const serverMsg =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message ||
              err.error?.Message ||
              err.error?.error ||
              err.message ||
              'Failed to send reset link.';

        this.message = serverMsg;
        this.isError = true;
      }
    });
  }
}
