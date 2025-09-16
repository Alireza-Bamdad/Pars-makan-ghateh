import { api } from './api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// =====================
// PRODUCT MANAGEMENT
// =====================

// Get featured products (public)
export const getFeaturedProducts = async (limit = 8) => {
  const { data } = await api.get("/products/featured/list", {
    params: { limit }
  });
  return data;
};

// Get all products (public)
export const getProducts = async (params = {}) => {
  const { 
    page = 1, 
    limit = 12, 
    category, 
    search, 
    featured,
    sort = '-createdAt'
  } = params;
  
  const { data } = await api.get("/products", {
    params: { page, limit, category, search, featured, sort }
  });
  return data;
};

// Get single product by slug (public)
export const getProductBySlug = async (slug) => {
  const { data } = await api.get(`/products/${slug}`);
  return data;
};

// Get all products for admin
export const getAdminProducts = async (params = {}) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    category = '',
    status = 'all',
    
    featured = 'all'
  } = params;
  
  const { data } = await api.get("/products/admin", {
    params: { page, limit, search, category, status, featured }
  });
  return data;
};

// Get single product for admin
export const getAdminProduct = async (id) => {
  const { data } = await api.get(`/products/admin/${id}`);
  return data;
};

// Create new product (admin)
export const createProduct = async (productData) => {
  const formData = new FormData();
  
  // Add text fields
  Object.keys(productData).forEach(key => {
    if (key !== 'images' && productData[key] !== undefined) {
      if (typeof productData[key] === 'object') {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    }
  });
  
  // Add image files if exist
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const { data } = await api.post("/products/admin", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

// Update product (admin)
export const updateProduct = async (id, productData) => {
  const formData = new FormData();
  
  // Add text fields
  Object.keys(productData).forEach(key => {
    if (key !== 'images' && productData[key] !== undefined && productData[key] !== null) {
      if (typeof productData[key] === 'object') {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    }
  });
  
  // Add new image files if exist
  if (productData.images && productData.images.length > 0) {
    // بررسی کنید که آیا فایل است یا آبجکت (از قبل آپلود شده)
    productData.images.forEach(image => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
  }
  
  const { data } = await api.put(`/products/admin/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

// Delete product (admin)
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/admin/${id}`);
  return data;
};

// Delete specific image from product (admin)
export const deleteProductImage = async (productId, imageIndex) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/images/${imageIndex}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
};
