import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'jwt_token';
  private refreshKey = 'refresh_token';
  private roleKey = 'user_role';
  private userKey = 'user_info';
  private ProfileImageUrlKey = 'user_image';
  private userNameKey = 'user_name';
  private logoutTimer: any;

  constructor(private http: HttpClient) { }
  login(data: any): Observable<any> {
    return this.http.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, data).pipe(
      tap((res: any) => {
        const accessToken = res.accessToken;
        const refreshToken = res.refreshToken;
        const roles = res.roles;
        const ProfileImageUrl = res.profileImageUrl;
        const fullName = res.fullName;

        // ✅ Store access & refresh tokens
        if (accessToken) {
          localStorage.setItem(this.tokenKey, accessToken);
        }
        if (refreshToken) {
          localStorage.setItem(this.refreshKey, refreshToken);
        }

        // ✅ Handle roles safely (array or single)
        if (roles) {
          const rolesToStore = Array.isArray(roles) ? roles : [roles];
          localStorage.setItem(this.roleKey, JSON.stringify(rolesToStore));
        }


        if (ProfileImageUrl) {
          localStorage.setItem(this.ProfileImageUrlKey, ProfileImageUrl);
        }

        if (fullName) {
          localStorage.setItem(this.userNameKey, fullName);
        }

        // ✅ Decode and store user info from JWT
        const userInfo = this.decodeToken(accessToken);
        if (userInfo) {
          localStorage.setItem(this.userKey, JSON.stringify(userInfo));
        }
      })
    );
  }

  // startLogoutTimer(expiry: number) {
  //   const timeout = expiry - Date.now();
  //   if (timeout > 0) {
  //     this.logoutTimer = setTimeout(() => {
  //       this.logout();
  //     }, timeout);
  //   } else {
  //     this.logout();
  //   }
  // }

  logout() {
    localStorage.clear();
    clearTimeout(this.logoutTimer);
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  getRole(): string[] {
    const storedRoles = localStorage.getItem(this.roleKey);
    try {
      const parsed = storedRoles ? JSON.parse(storedRoles) : [];
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  getImage(): string | null {
    return localStorage.getItem(this.ProfileImageUrlKey);
  }

  getUserInfo(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ Decode JWT token to extract payload (user info)
  private decodeToken(token: string): any {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }

  // 🔹 Forgot Password
  forgotPassword(email: string): Observable<any> {
    const clientResetUrl = `${window.location.origin}/reset-password`;

    return this.http.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`,
      { email, clientResetUrl }
    );
  }


  // 🔹 Reset Password
  resetPassword(data: any): Observable<any> {
    return this.http.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`,
      data
    );
  }

  // Add this inside AuthService
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('⚠️ No refresh token found. Logging out.');
      this.logout();
      return new Observable(); // return empty observable
    }

    return this.http
      .post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`, { refreshToken })
      .pipe(
        tap((res: any) => {
          console.log('🔄 Token refreshed:', res);
          const newaccessToken = res.accessToken;
          const newRefreshToken = res.refreshToken;

          if (newaccessToken) {
            localStorage.setItem(this.tokenKey, newaccessToken);
          }
          if (newRefreshToken) {
            localStorage.setItem(this.refreshKey, newRefreshToken);
          }

          // Optional: update decoded user info
          const userInfo = this.decodeToken(newaccessToken);
          if (userInfo) {
            localStorage.setItem(this.userKey, JSON.stringify(userInfo));
          }
        })
      );
  }
}
