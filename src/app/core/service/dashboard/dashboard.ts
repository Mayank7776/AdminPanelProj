import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  getDashboardCounts() {
    const users$ = this.http.get<any>(`${this.baseUrl}/User/list`);
    const faqs$ = this.http.get<any>(`${this.baseUrl}/FAQ/list`);
    const cms$ = this.http.get<any>(`${this.baseUrl}/CMS/list`);

    return forkJoin([users$, faqs$, cms$]).pipe(
      map(([userRes, faqRes, cmsRes]) => ({
        totalUsers: userRes.data?.length || 0,
        totalFaqs: faqRes.data?.length || 0,
        totalCms: cmsRes.data?.length || 0
      }))
    );
  }
}

