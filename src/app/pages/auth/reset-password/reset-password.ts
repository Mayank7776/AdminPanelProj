import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/service/auth/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword {
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  loading = false;
  isError = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    const rawtoken = this.route.snapshot.queryParamMap.get('token') || '';
    this.token = rawtoken.replace(/ /g, '+');
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.message = '';

    const data = {
      email: this.email,
      token: this.token,
      newPassword: this.newPassword
    };
    debugger;
    this.authService.resetPassword(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = '✅ Password reset successful!';
        this.isError = false;

        // Smooth delay before redirect
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.message = err.error?.message || '❌ Error resetting password.';
        this.isError = true;
      }
    });
  }
}
