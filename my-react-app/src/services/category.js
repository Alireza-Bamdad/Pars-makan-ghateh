import { api } from './api';

// =====================
// CATEGORY MANAGEMENT
// =====================

// Get all categories (public)
export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};

// Get single category by slug (public)
export const getCategoryBySlug = async (slug) => {
  const { data } = await api.get(`/categories/${slug}`);
  return data;
};

// Get all categories for admin (with pagination and filters)
export const getAdminCategories = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = params;
  const { data } = await api.get("/categories/admin/all", {
    params: { page, limit, search, status }
  });
  return data;
};

// Create new category (admin)
export const createCategory = async (categoryData) => {
  // FIXED: Check if categoryData is already FormData
  if (categoryData instanceof FormData) {
    const { data } = await api.post("/categories/admin", categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  }
  
  // Original logic for object data
  const formData = new FormData();
  
  // Add text fields
  Object.keys(categoryData).forEach(key => {
    if (key !== 'image' && categoryData[key] !== undefined) {
      formData.append(key, categoryData[key]);
    }
  });
  
  // Add image file if exists
  if (categoryData.image) {
    formData.append('image', categoryData.image);
  }
  
  const { data } = await api.post("/categories/admin", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

// Update category (admin) - FIXED
export const updateCategory = async (id, categoryData) => {
  // Check if categoryData is FormData (for file uploads) or regular object
  if (categoryData instanceof FormData) {
    const { data } = await api.put(`/categories/admin/${id}`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  }
  
  // For regular object updates
  const { data } = await api.put(`/categories/admin/${id}`, categoryData);
  return data;
};

// Delete category (admin)
export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/admin/${id}`);
  return data;
};