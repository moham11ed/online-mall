import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Store {
  storeID: number;
  name: string;
  logoURL: string;
  description: string;
  primaryColor: string;
}

export interface Product {
  productID: number;
  name: string;
  imageURL: string;
  price: number;
  discount: number;
  description?: string;
  quantity?: number;
  createdAt?: string;
  store?: {
    storeID: number;
    name: string;
    logoURL: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) { }

  getAllStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.apiUrl}/stores`);
  }

  getStoreProducts(storeId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/store/${storeId}/products`);
  }

  getProductDetails(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/${productId}`);
  }
}