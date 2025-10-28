import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {Pagination, UserResponse } from '../../../models/DataType';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = API_CONFIG.BASE_URL + 'api/Users'; // update if needed

  constructor(private http: HttpClient) {}

  getUsers(requestedModel:any): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.baseUrl+'/get-users', requestedModel);
  }

  createUser(formData: FormData) {
  return this.http.post(this.baseUrl+'/create', formData);
}

  editUser(formdata:FormData){
    return this.http.put(this.baseUrl+'/update', formdata);
  }

deleteUser(id: string) {
  console.log(id);
  return this.http.delete(`${this.baseUrl}/delete/${id}`);
}

  /** 🔹 Get countries */
  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl+'/countries');
  }

  /** 🔹 Get states by country */
  getStates(countryId: number): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl+`/states/${countryId}`);
  }

  /** 🔹 Get cities by state */
  getCities(stateId: number): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl+`/cities/${stateId}`);
  }
}
