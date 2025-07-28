import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Store {
  storeID: number;
  name: string;
  description: string;
  logoURL: string | null;
  primaryColor: string;
  secondaryColor: string;
  keywords: string[];
  createdAt: Date;
}

interface Product {
  productID: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
  imageURL: string | null;
  createdAt: Date;
}

interface Order {
  orderID: number;
  orderDate: Date;
  status: string;
  totalAmount: number;
  customer: string;
  items: OrderItem[];
}

interface OrderItem {
  name: string;
  quantity: number;
  priceAtTime: number;
}

interface Offer {
  offerID: number;
  productID: number;
  productName: string;
  originalPrice: number;
  newPrice: number;
  startDate: Date;
  endDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/vendor`;

  constructor(private http: HttpClient) { }

  // Store methods
  getStore(): Observable<Store> {
    return this.http.get<Store>(`${this.apiUrl}/my-store`);
  }

  createStore(storeData: FormData): Observable<{ store: Store, logoUrl: string | null }> {
    return this.http.post<{ store: Store, logoUrl: string | null }>(
      `${this.apiUrl}/create-store-with-image`, 
      storeData
    );
  }

  updateStore(storeData: FormData): Observable<{ store: Store, logoUrl: string | null }> {
    return this.http.put<{ store: Store, logoUrl: string | null }>(
      `${this.apiUrl}/update-store-with-image`, 
      storeData
    );
  }

  // Product methods
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/my-products`);
  }

  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/${productId}`);
  }

  addProduct(productData: FormData): Observable<{ product: Product, imageUrl: string | null }> {
    return this.http.post<{ product: Product, imageUrl: string | null }>(
      `${this.apiUrl}/add-product-with-image`, 
      productData
    );
  }

  updateProduct(productId: number, productData: FormData): Observable<{ product: Product, imageUrl: string | null }> {
    return this.http.put<{ product: Product, imageUrl: string | null }>(
      `${this.apiUrl}/update-product-with-image/${productId}`, 
      productData
    );
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-product/${productId}`);
  }

  // Order methods
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/update-order-status/${orderId}`, 
      { newStatus: status }
    );
  }

  // Offer methods
  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/my-offers`);
  }

  addOffer(offerData: {
    productID: number;
    newPrice: number;
    startDate: string;
    endDate: string;
  }): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/add-offer`, offerData);
  }

  deleteOffer(offerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-offer/${offerId}`);
  }

  // Payment methods
  createStripeAccount(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${this.apiUrl}/create-stripe-account`, 
      {}
    );
  }

  // Utility methods
  prepareStoreFormData(storeInfo: {
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    keywords: string[];
    logoFile?: File;
  }): FormData {
    const formData = new FormData();
    formData.append('name', storeInfo.name);
    formData.append('description', storeInfo.description);
    formData.append('primaryColor', storeInfo.primaryColor);
    formData.append('secondaryColor', storeInfo.secondaryColor);
    formData.append('keywords', storeInfo.keywords.join(', '));
    
    if (storeInfo.logoFile) {
      formData.append('logoFile', storeInfo.logoFile);
    }

    return formData;
  }

  prepareProductFormData(productInfo: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    discount: number;
    imageFile?: File;
  }): FormData {
    const formData = new FormData();
    formData.append('name', productInfo.name);
    formData.append('description', productInfo.description);
    formData.append('price', productInfo.price.toString());
    formData.append('quantity', productInfo.quantity.toString());
    formData.append('discount', productInfo.discount.toString());
    
    if (productInfo.imageFile) {
      formData.append('imageFile', productInfo.imageFile);
    }

    return formData;
  }
}