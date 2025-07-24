import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Store {
  storeID: number;
  name: string;
  logoURL: string;
  description: string;
  createdAt: string;
  ownerEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.apiUrl}/Stores`);
  }
}