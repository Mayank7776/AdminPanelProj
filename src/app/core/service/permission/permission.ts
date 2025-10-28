import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissionsSubject = new BehaviorSubject<number>(0);
  permissions$ = this.permissionsSubject.asObservable();
  private Base_Url = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  /** Fetch role permissions by roleName */
  loadUserPermissions(roleName: string) {
    const url = `${this.Base_Url}api/Roles/getRoleByName?roleName=${roleName}`;
    this.http.post(url, {}).subscribe({
      next: (res: any) => {
        const permissions = res?.data?.data.permissions ?? 0;
        console.log('Loaded permissions for role', roleName, ':', permissions);
        this.permissionsSubject.next(permissions);
      },
      error: (err) => {
        console.error('Failed to fetch role permissions:', err);
        this.permissionsSubject.next(0);
      },
    });
  }

  /** Check permission bitmask */
  hasPermission(permissionBit: number): boolean {
    const currentPermissions = this.permissionsSubject.value;
    return (currentPermissions & permissionBit) === permissionBit;
  }
}
