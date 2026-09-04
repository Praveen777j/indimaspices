import {
  Product,
  Category,
  Order,
  Customer,
  Recipe,
  Banner,
  Offer,
  Review,
  BusinessSettings,
  AdminAuditLog,
  Lead
} from '../types';

async function safeFetchJson<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if ((res.status === 401 || res.status === 403) && typeof window !== 'undefined') {
        const hasAuth = options?.headers && (
          (typeof options.headers === 'object' && 'Authorization' in (options.headers as any)) ||
          (options.headers instanceof Headers && options.headers.has('Authorization'))
        );
        if (hasAuth || url.includes('/api/admin/')) {
          window.dispatchEvent(new CustomEvent('indima:admin_auth_expired'));
        }
      }
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.warn(`[API] Expected JSON from ${url}, got ${contentType || 'text'}:`, text.substring(0, 100));
      if (!res.ok) {
        return { error: `HTTP ${res.status}: ${res.statusText || text.substring(0, 80)}` } as unknown as T;
      }
      return fallback !== undefined ? fallback : ({} as T);
    }
    const data = await res.json();
    if (!res.ok && !data.error) {
      data.error = `HTTP ${res.status}: Request failed`;
    }
    return data;
  } catch (err: any) {
    console.error(`[API] Fetch error for ${url}:`, err);
    return (fallback !== undefined ? fallback : { error: err?.message || 'Network request failed' }) as T;
  }
}

export const api = {
  // Public
  getSettings: async (): Promise<BusinessSettings> => {
    return safeFetchJson<BusinessSettings>('/api/settings', undefined, {} as BusinessSettings);
  },

  getProducts: async (params?: { category?: string; search?: string; activeOnly?: boolean }): Promise<Product[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.activeOnly !== undefined) query.append('activeOnly', String(params.activeOnly));
    return safeFetchJson<Product[]>(`/api/products?${query.toString()}`, undefined, []);
  },

  getProductById: async (id: string): Promise<Product> => {
    return safeFetchJson<Product>(`/api/products/${id}`, undefined, {} as Product);
  },

  getCategories: async (): Promise<Category[]> => {
    return safeFetchJson<Category[]>('/api/categories', undefined, []);
  },

  getBanners: async (): Promise<Banner[]> => {
    return safeFetchJson<Banner[]>('/api/banners', undefined, []);
  },

  getRecipes: async (): Promise<Recipe[]> => {
    return safeFetchJson<Recipe[]>('/api/recipes', undefined, []);
  },

  getOffers: async (): Promise<Offer[]> => {
    return safeFetchJson<Offer[]>('/api/offers', undefined, []);
  },

  getReviews: async (productId?: string): Promise<Review[]> => {
    const url = productId ? `/api/reviews?product_id=${productId}` : '/api/reviews';
    return safeFetchJson<Review[]>(url, undefined, []);
  },

  submitReview: async (reviewData: {
    product_id: string;
    customer_name: string;
    customer_city?: string;
    rating: number;
    comment_en: string;
    comment_kn?: string;
  }): Promise<any> => {
    return safeFetchJson<any>('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    }, { error: 'Failed to submit review' });
  },

  lookupPincode: async (pincode: string) => {
    const res = await fetch(`/api/pincode/${pincode}`);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return res.json().catch(() => null);
  },

  lookupCustomer: async (phone: string): Promise<any> => {
    return safeFetchJson<any>('/api/customer/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }, { found: false, count: 0 });
  },

  trackOrders: async (phone: string, orderId?: string): Promise<{ phone: string; count: number; orders: Order[] }> => {
    const query = new URLSearchParams({ phone });
    if (orderId) query.append('order_id', orderId);
    return safeFetchJson<{ phone: string; count: number; orders: Order[] }>(
      `/api/orders/track?${query.toString()}`,
      undefined,
      { phone, count: 0, orders: [] }
    );
  },

  getPaymentConfig: async (): Promise<{ success: boolean; key_id: string; is_live: boolean; is_configured?: boolean }> => {
    return safeFetchJson<{ success: boolean; key_id: string; is_live: boolean; is_configured?: boolean }>(
      '/api/payments/config',
      undefined,
      { success: true, key_id: 'rzp_test_51745778844888', is_live: false }
    );
  },

  createRazorpayOrder: async (orderPayload: any): Promise<any> => {
    return safeFetchJson<any>('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }, { error: 'Failed to initialize payment order' });
  },

  verifyRazorpayPayment: async (verifyPayload: {
    internal_order_id?: string;
    order_id?: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<any> => {
    return safeFetchJson<any>('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload)
    }, { error: 'Failed to verify payment with server' });
  },

  // Indima AI Assistant (Read-only culinary and spice guide)
  askAiAssistant: async (payload: {
    message: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
    language?: 'en' | 'kn';
  }): Promise<{
    success: boolean;
    reply: string;
    recommendedProducts: any[];
    suggestedFollowUps: string[];
    error?: string;
  }> => {
    return safeFetchJson<any>('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      success: false,
      reply: 'Unable to reach Indima AI. Please check your internet connection.',
      recommendedProducts: [],
      suggestedFollowUps: []
    });
  },

  createOrder: async (orderPayload: any): Promise<any> => {
    return safeFetchJson<any>('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }, { error: 'Failed to create order' });
  },

  getOrderById: async (orderId: string): Promise<any> => {
    return safeFetchJson<any>(`/api/orders/${encodeURIComponent(orderId)}`, {
      cache: 'no-store'
    }, { error: 'Failed to fetch order' });
  },

  submitPaymentProof: async (payload: { order_id: string; utr_reference?: string; transaction_id?: string }): Promise<any> => {
    return safeFetchJson<any>('/api/orders/submit-payment-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { error: 'Failed to submit payment proof' });
  },

  verifyPayment: async (verifyPayload: { order_id: string; utr_reference?: string; transaction_id?: string }): Promise<any> => {
    return safeFetchJson<any>('/api/orders/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload)
    }, { error: 'Failed to verify payment' });
  },

  submitLead: async (phone: string, source?: string): Promise<any> => {
    return safeFetchJson<any>('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, source })
    }, { error: 'Failed to submit phone' });
  },

  // Admin APIs
  adminLogin: async (credentials: { username: string; password: string }): Promise<any> => {
    return safeFetchJson<any>('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }, { error: 'Admin login failed' });
  },

  adminLogout: async (token: string): Promise<any> => {
    return safeFetchJson<any>('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, { success: true });
  },

  getAdminStats: async (token: string): Promise<any> => {
    return safeFetchJson<any>('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to load stats' });
  },

  getAdminOrders: async (token: string): Promise<Order[]> => {
    return safeFetchJson<Order[]>('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    }, []);
  },

  updateOrderStatus: async (
    token: string,
    orderId: string,
    payload: { status?: string; payment_status?: string; tracking_number?: string; expected_delivery?: string }
  ): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }, { error: 'Failed to update order status' });
  },

  updateOrderAddress: async (
    token: string,
    orderId: string,
    payload: { address: any; reason: string }
  ): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/orders/${orderId}/address`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }, { error: 'Failed to update address' });
  },

  retryNotification: async (token: string, orderId: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/orders/${orderId}/retry-notification`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to send notification' });
  },

  getAdminCustomers: async (token: string): Promise<Customer[]> => {
    return safeFetchJson<Customer[]>('/api/admin/customers', {
      headers: { Authorization: `Bearer ${token}` }
    }, []);
  },

  uploadMedia: async (token: string, file: File): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> => {
    let serverError = '';
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data && data.url) {
          return { success: true, url: data.url, filename: data.filename };
        }
        if (data && data.error) {
          serverError = data.error;
          console.warn('[API Upload Server Notice]:', data.error);
        }
      } else if (!res.ok) {
        const text = await res.text();
        serverError = text || `Upload failed (Status ${res.status})`;
      }
    } catch (networkErr: any) {
      serverError = networkErr?.message || 'Network error during upload';
      console.warn('[API Upload Network Exception]:', serverError);
    }

    // Do NOT fallback to Base64 for videos as huge payloads break Firestore's 1MB limit and freeze browsers
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v|3gp|flv)$/i.test(file.name);
    if (isVideo) {
      return { success: false, error: serverError || 'Video upload failed. Please verify format and file size.' };
    }

    // Client-side Preview / Base64 Fallback ONLY for small images (< 2MB)
    if (file.size <= 2 * 1024 * 1024) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
        return { success: true, url: dataUrl, filename: file.name };
      } catch (fileErr: any) {
        return { success: false, error: fileErr?.message || 'Failed to process file' };
      }
    }

    return { success: false, error: serverError || 'Upload failed. File exceeds allowed size.' };
  },

  uploadMultipleMedia: async (token: string, files: FileList | File[]): Promise<{ success: boolean; urls: string[]; error?: string }> => {
    const fileList = Array.from(files);
    if (!fileList || fileList.length === 0) {
      return { success: true, urls: [] };
    }

    try {
      const formData = new FormData();
      for (const file of fileList) {
        formData.append('files', file);
      }

      const res = await fetch('/api/upload-multiple', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.urls) && data.urls.length > 0) {
          return { success: true, urls: data.urls };
        }
      }
    } catch (err) {
      console.warn('[Multi-Upload Batch Notice]:', err);
    }

    // Fallback: upload sequentially
    const urls: string[] = [];
    for (const file of fileList) {
      const singleRes = await api.uploadMedia(token, file);
      if (singleRes.success && singleRes.url) {
        urls.push(singleRes.url);
      }
    }
    return { success: urls.length > 0, urls };
  },

  saveProduct: async (token: string, product: any, isEdit = false): Promise<any> => {
    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';
    return safeFetchJson<any>(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(product)
    }, { error: 'Failed to save product' });
  },

  deleteProduct: async (token: string, id: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to delete product' });
  },

  updateInventory: async (token: string, id: string, stock: number, threshold?: number): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/inventory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ stock, threshold })
    }, { error: 'Failed to update inventory' });
  },

  saveCategory: async (token: string, category: any, isEdit = false): Promise<any> => {
    const url = isEdit ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
    const method = isEdit ? 'PUT' : 'POST';
    return safeFetchJson<any>(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(category)
    }, { error: 'Failed to save category' });
  },

  deleteCategory: async (token: string, id: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to delete category' });
  },

  saveBanner: async (token: string, banner: any, isEdit = false): Promise<any> => {
    const url = isEdit ? `/api/admin/banners/${banner.id}` : '/api/admin/banners';
    const method = isEdit ? 'PUT' : 'POST';
    return safeFetchJson<any>(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(banner)
    }, { error: 'Failed to save banner' });
  },

  deleteBanner: async (token: string, id: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to delete banner' });
  },

  saveRecipe: async (token: string, recipe: any, isEdit = false): Promise<any> => {
    const url = isEdit ? `/api/admin/recipes/${recipe.id}` : '/api/admin/recipes';
    const method = isEdit ? 'PUT' : 'POST';
    return safeFetchJson<any>(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(recipe)
    }, { error: 'Failed to save recipe' });
  },

  deleteRecipe: async (token: string, id: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to delete recipe' });
  },

  saveOffer: async (token: string, offer: any, isEdit = false): Promise<any> => {
    const url = isEdit ? `/api/admin/offers/${offer.id}` : '/api/admin/offers';
    const method = isEdit ? 'PUT' : 'POST';
    return safeFetchJson<any>(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(offer)
    }, { error: 'Failed to save offer' });
  },

  deleteOffer: async (token: string, id: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/offers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to delete offer' });
  },

  deleteCustomer: async (token: string, id: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/customers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to delete customer' });
  },

  deleteOrder: async (token: string, id: string): Promise<any> => {
    return safeFetchJson<any>(`/api/admin/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, { error: 'Failed to delete order' });
  },

  getAdminSettings: async (token: string): Promise<BusinessSettings> => {
    return safeFetchJson<BusinessSettings>('/api/admin/settings', {
      headers: { Authorization: `Bearer ${token}` }
    }, {} as BusinessSettings);
  },

  updateSettings: async (token: string, settings: Partial<BusinessSettings>): Promise<any> => {
    return safeFetchJson<any>('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    }, { error: 'Failed to update settings' });
  },

  changeAdminPassword: async (token: string, payload: { current_password: string; new_password: string }): Promise<any> => {
    return safeFetchJson<any>('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }, { error: 'Failed to change password' });
  },

  getAuditLogs: async (token: string): Promise<AdminAuditLog[]> => {
    return safeFetchJson<AdminAuditLog[]>('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` }
    }, []);
  },

  getLeads: async (token: string): Promise<Lead[]> => {
    return safeFetchJson<Lead[]>('/api/admin/leads', {
      headers: { Authorization: `Bearer ${token}` }
    }, []);
  },

  downloadBackup: async (token: string): Promise<Blob | null> => {
    try {
      const res = await fetch('/api/backup/download', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  }
};
