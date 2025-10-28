import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth/auth';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const userRoles = auth.getRole(); // array of roles
    // Check if user has any allowed role
    const hasAccess = userRoles.some((r: string) => allowedRoles.includes(r));

    if (hasAccess) return true;

    // 🔹 Dynamic redirect: choose the first route user can access
    const defaultRedirectMap: Record<string, string> = {
      OnlyFAQ: '/faq',
      Admin: '/dashboard',
      Manager: '/dashboard',
      Developer: '/cms',
    };

    const redirectUrl = userRoles.find(r => defaultRedirectMap[r]) 
      ? defaultRedirectMap[userRoles.find(r => defaultRedirectMap[r])!] 
      : '/login';

    // ❗Prevent infinite redirect loop
    if (router.url !== redirectUrl) {
      router.navigate([redirectUrl]);
    }

    return false;
  };
};
