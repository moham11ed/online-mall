import { Routes } from '@angular/router';
import { Register } from './register/register';
import { Login } from './login/login';
import { Stores } from './stores/stores';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Cart } from './cart/cart';
import { VendorDashboard } from './vendor-dashboard/vendor-dashboard';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { UserDashboard } from './user-dashboard/user-dashboard';
import { ProductsComponent } from './products/products';
import { ProductDetailComponent } from './product-detail/product-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/stores', pathMatch: 'full' },
  { path: 'stores', component: Stores },
  { path: 'store/:storeId/products', component: ProductsComponent },
  { path: 'product/:productId', component: ProductDetailComponent },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'cart', component: Cart },
  { path: 'vendor', component: VendorDashboard, title: 'profile' },
  { path: 'admin', component: AdminDashboard, title: 'profile' },
  { path: 'user', component: UserDashboard, title: 'profile' },
  
  
];
