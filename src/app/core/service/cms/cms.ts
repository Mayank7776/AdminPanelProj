import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Pagination } from '../../../models/DataType';

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) { }

  // ✅ Get CMS List with pagination, sorting, and optional filters
  getCmsList(payload: Pagination): Observable<any> {
    return this.http.post(`${this.apiUrl}api/Cms/getall`, payload);
  }

  // ✅ Add New CMS
  addCms(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}api/Cms/add`, payload);
  }

  // ✅ Update Existing CMS
  editCms(id:number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}api/Cms/update/${id}`, payload);
  }

  // ✅ Delete CMS
  deleteCms(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}api/Cms/delete/${id}`);
  }
}
