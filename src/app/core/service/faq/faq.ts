import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Pagination } from '../../../models/DataType';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // ✅ Get All FAQs (with pagination, sorting, searching)
  getFaqList(payload: Pagination): Observable<any> {
    return this.http.post(`${this.apiUrl}api/FAQ/get-faqs`, payload);
  }

  // ✅ Add new FAQ
  addFaq(faq: { question: string; answer: string; isActive: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}api/FAQ/create-faq`, faq, { responseType: 'text' });
  }

  // ✅ Edit FAQ
  editFaq(id: number, faq: any): Observable<any> {
    return this.http.put(`${this.apiUrl}api/FAQ/update-faq/${id}`, faq, { responseType: 'text' });
  }

  // ✅ Delete FAQ
  deleteFaq(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}api/FAQ/delete-faq/${id}`);
  }
}

  // getFaqList(params: any): Observable<any> {
  //   let httpParams = new HttpParams()
  //     .set('page', params.page)
  //     .set('pageSize', params.pageSize)
  //     .set('search', params.search)
  //     .set('sortColumn', params.sortColumn)
  //     .set('sortDirection', params.sortDirection);

  //   return this.http.get(`${this.baseUrl}api/FAQ/get-faqs`, { params: httpParams });
  // }

  // addFaq(faq: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}api/FAQ/create-faq`, faq,{responseType:'text'});
  // }

  // updateFaq(faq: any): Observable<any> {
  //   return this.http.put(`${this.baseUrl}api/FAQ/update-faq/${faq.id}`, faq,{responseType:'text'});
  // }

  // deleteFaq(id: number): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}api/FAQ/delete-faq/${id}`, {responseType:'text'});
  // }