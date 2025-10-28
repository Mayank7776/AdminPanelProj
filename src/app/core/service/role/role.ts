import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { IRole, Pagination } from '../../../models/DataType';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // Get Roles list with pagination, search, sorting
  getRolesList(payload: Pagination): Observable<any> {
    return this.http.post(`${this.apiUrl}api/Roles/get-roles`, payload);
  }

  // Add Role
  addRole(role: IRole): Observable<any> {
    return this.http.post(`${this.apiUrl}api/Roles/add-role`, role, { responseType: 'text' });
  }

  // Update Role
  editRole(role: IRole): Observable<any> {
    console.log(role);
    return this.http.put(`${this.apiUrl}api/Roles/update-role/${role.id}`, role, { responseType: 'text' });
  }

  // Delete Role
  deleteRole(id: string): Observable<any> {
    console.log('id from service ',id)
    return this.http.delete(`${this.apiUrl}api/Roles/delete-role/${id}`);
  }

  // Permissionss 
  getPermissions(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}api/Permissions`);
}

getPermissionsByRole(roleId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}api/Permissions/${roleId}`);
}

assignPermissionsToRole(roleId: string, permissionIds: number[]): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}api/Permissions/AssignToRole`, {
    roleId,
    permissions: permissionIds
  });
}

removePermissionsByRole(roleId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}api/Permissions/RemoveByRole/${roleId}`);
}
}
