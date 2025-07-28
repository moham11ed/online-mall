import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { isPlatformBrowser, DecimalPipe, DatePipe } from '@angular/common';
import { VendorService } from '../services/vendor-service';

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.html',
  styleUrls: ['./vendor-dashboard.css'],
    imports: [ReactiveFormsModule, DecimalPipe, DatePipe, FormsModule]
})
export class VendorDashboard implements OnInit {
  activeTab: 'products' | 'orders' | 'store' | 'offers' = 'products';
  loading = false;
  isBrowser: boolean;
  
  // Store Data
  store: any = null;
  storeForm: FormGroup;
  logoPreview: string | null = null;
  logoFile: File | null = null;
  
  // Products Data
  products: any[] = [];
  productForm: FormGroup;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  isEditMode = false;
  currentProductId: number | null = null;
  showProductForm = false;
  
  // Orders Data
  orders: any[] = [];
  
  // Offers Data
  offers: any[] = [];
  offerForm: FormGroup;
  showOfferForm = false;

  constructor(
    private vendorService: VendorService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Initialize forms
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      primaryColor: ['#007bff'],
      secondaryColor: ['#6c757d'],
      keywords: [''],
      logo: [null]
    });

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      discount: ['0', [Validators.min(0), Validators.max(100)]],
      image: [null]
    });

    this.offerForm = this.fb.group({
      productId: ['', Validators.required],
      newPrice: ['', [Validators.required, Validators.min(0.01)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStoreData();
    this.loadProducts();
    this.loadOrders();
    this.loadOffers();
  }

  // ===== Store Methods =====
  loadStoreData(): void {
    this.loading = true;
    this.vendorService.getStore().subscribe({
      next: (store) => {
        this.store = store;
        this.storeForm.patchValue({
          name: store.name,
          description: store.description,
          primaryColor: store.primaryColor,
          secondaryColor: store.secondaryColor,
          keywords: store.keywords?.join(', ') || ''
        });
        this.logoPreview = store.logoURL;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading store:', err);
        this.loading = false;
      }
    });
  }

  onLogoChange(event: any): void {
    if (!this.isBrowser) return;
    
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = () => this.logoPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  updateStore(): void {
    if (this.storeForm.invalid) return;

    const formData = this.vendorService.prepareStoreFormData({
      name: this.storeForm.value.name,
      description: this.storeForm.value.description,
      primaryColor: this.storeForm.value.primaryColor,
      secondaryColor: this.storeForm.value.secondaryColor,
      keywords: this.storeForm.value.keywords.split(',').map((k: string) => k.trim()),
      logoFile: this.logoFile || undefined
    });

    this.loading = true;
    this.vendorService.updateStore(formData).subscribe({
      next: (response) => {
        this.loadStoreData();
        alert('Store updated successfully!');
      },
      error: (err) => {
        console.error('Error updating store:', err);
        alert('Failed to update store');
        this.loading = false;
      }
    });
  }

  // ===== Product Methods =====
  loadProducts(): void {
    this.loading = true;
    this.vendorService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  onImageChange(event: any): void {
    if (!this.isBrowser) return;
    
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  showAddProductForm(): void {
    this.showProductForm = true;
    this.isEditMode = false;
    this.productForm.reset({
      discount: '0'
    });
    this.imagePreview = null;
    this.imageFile = null;
  }

  showEditProductForm(product: any): void {
    this.showProductForm = true;
    this.isEditMode = true;
    this.currentProductId = product.productID;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      discount: product.discount || '0'
    });
    this.imagePreview = product.imageURL;
  }

  submitProduct(): void {
    if (this.productForm.invalid) return;

    const formData = this.vendorService.prepareProductFormData({
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      price: this.productForm.value.price,
      quantity: this.productForm.value.quantity,
      discount: this.productForm.value.discount,
      imageFile: this.imageFile || undefined
    });

    this.loading = true;
    const request = this.isEditMode && this.currentProductId
      ? this.vendorService.updateProduct(this.currentProductId, formData)
      : this.vendorService.addProduct(formData);

    request.subscribe({
      next: () => {
        this.loadProducts();
        this.showProductForm = false;
        alert(`Product ${this.isEditMode ? 'updated' : 'added'} successfully!`);
      },
      error: (err) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'adding'} product:`, err);
        alert(`Failed to ${this.isEditMode ? 'update' : 'add'} product`);
        this.loading = false;
      }
    });
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.vendorService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
          alert('Product deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Failed to delete product');
          this.loading = false;
        }
      });
    }
  }

  // ===== Order Methods =====
  loadOrders(): void {
    this.loading = true;
    this.vendorService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.loading = true;
    this.vendorService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadOrders();
        alert('Order status updated successfully!');
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        alert('Failed to update order status');
        this.loading = false;
      }
    });
  }

  // ===== Offer Methods =====
  loadOffers(): void {
    this.loading = true;
    this.vendorService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading offers:', err);
        this.loading = false;
      }
    });
  }

  showAddOfferForm(): void {
    this.showOfferForm = true;
    this.offerForm.reset();
  }

  submitOffer(): void {
    if (this.offerForm.invalid) return;

    this.loading = true;
    this.vendorService.addOffer({
      productID: this.offerForm.value.productId,
      newPrice: this.offerForm.value.newPrice,
      startDate: new Date(this.offerForm.value.startDate).toISOString(),
      endDate: new Date(this.offerForm.value.endDate).toISOString()
    }).subscribe({
      next: () => {
        this.loadOffers();
        this.showOfferForm = false;
        alert('Offer added successfully!');
      },
      error: (err) => {
        console.error('Error adding offer:', err);
        alert('Failed to add offer');
        this.loading = false;
      }
    });
  }

  deleteOffer(offerId: number): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.loading = true;
      this.vendorService.deleteOffer(offerId).subscribe({
        next: () => {
          this.loadOffers();
          alert('Offer deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting offer:', err);
          alert('Failed to delete offer');
          this.loading = false;
        }
      });
    }
  }

  // ===== Payment Methods =====
  connectStripe(): void {
    if (!this.isBrowser) return;
    
    this.loading = true;
    this.vendorService.createStripeAccount().subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('Error connecting Stripe:', err);
        alert('Failed to connect Stripe account');
        this.loading = false;
      }
    });
  }

  // ===== UI Helpers =====
  changeTab(tab: 'products' | 'orders' | 'store' | 'offers'): void {
    this.activeTab = tab;
    this.showProductForm = false;
    this.showOfferForm = false;
  }

  cancelForm(): void {
    this.showProductForm = false;
    this.showOfferForm = false;
  }
}