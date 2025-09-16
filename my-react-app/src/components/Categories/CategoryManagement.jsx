import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, ChevronLeft, ChevronRight, Image, X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import {
  getAdminCategories,
  deleteCategory,
  updateCategory,
  createCategory
} from '../../services/category';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle
  };
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };
  
  const Icon = icons[type];
  
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg p-4 shadow-lg ${colors[type]}`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mt-0.5 ml-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Category Form Modal
// Category Form Modal - FIXED VERSION
// Category Form Modal - FIXED VERSION
const CategoryForm = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
    image: null, // Always start with null for new file uploads
    keepCurrentImage: category?.image ? true : false // Track whether to keep existing image
  });
  const [imagePreview, setImagePreview] = useState(category?.image || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' }));
        return;
      }
      
      // Set the new file and mark that we're not keeping the current image
      setFormData(prev => ({ 
        ...prev, 
        image: file,
        keepCurrentImage: false 
      }));
      setErrors(prev => ({ ...prev, image: '' }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      image: null,
      keepCurrentImage: false 
    }));
    setImagePreview(null);
    setErrors(prev => ({ ...prev, image: '' }));
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'نام دسته‌بندی الزامی است';
    } else if (formData.name.length > 100) {
      newErrors.name = 'نام دسته‌بندی نباید بیشتر از ۱۰۰ کاراکتر باشد';
    }
    
    if (formData.slug && !/^[\u0600-\u06FFa-z0-9]+(?:-[\u0600-\u06FFa-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'slug باید فقط شامل حروف فارسی، انگلیسی، اعداد و خط تیره باشد';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد';
    }

    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'ترتیب نمایش نباید منفی باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let response;
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug || '');
      submitData.append('description', formData.description || '');
      submitData.append('sortOrder', formData.sortOrder.toString());
      submitData.append('isActive', formData.isActive.toString());
      
      // Handle image logic
      if (formData.image) {
        // New image file selected
        submitData.append('image', formData.image);
        console.log('Uploading new image file:', formData.image.name);
      } else if (!formData.keepCurrentImage && category) {
        // Remove existing image (for updates only)
        submitData.append('removeImage', 'true');
        console.log('Removing existing image');
      }
      // If keepCurrentImage is true, don't append anything (keep existing image)

      console.log('Submitting form data:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ':', typeof pair[1] === 'object' ? pair[1].name || pair[1] : pair[1]);
      }

      if (category) {
        response = await updateCategory(category._id, submitData);
      } else {
        response = await createCategory(submitData);
      }
      
      console.log('API Response:', response);
      
      if (response.success) {
        onSave(response.message || 'عملیات با موفقیت انجام شد');
        onClose();
      } else {
        setErrors({ submit: response.message || 'خطا در ذخیره اطلاعات' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg ||
                          'خطا در ذخیره اطلاعات';
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {category ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام دسته‌بندی *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="نام دسته‌بندی را وارد کنید"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Slug Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (اختیاری)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="الکترونیک یا electronics"
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            <p className="mt-1 text-sm text-gray-500">
              در صورت خالی گذاشتن، به صورت خودکار از روی نام ایجاد می‌شود. می‌توانید از حروف فارسی یا انگلیسی استفاده کنید
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="توضیحات دسته‌بندی..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 کاراکتر
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تصویر دسته‌بندی
            </label>
            
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                {!loading && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Show current image indicator */}
                {category?.image && formData.keepCurrentImage && !formData.image && (
                  <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    تصویر فعلی
                  </span>
                )}
                {formData.image && (
                  <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    تصویر جدید
                  </span>
                )}
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${loading ? 'opacity-50' : ''}`}>
                <div className="flex flex-col items-center justify-center">
                  <Image className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">انتخاب تصویر</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </label>
            )}
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            <p className="mt-1 text-sm text-gray-500">حداکثر حجم: ۵ مگابایت</p>
            
            {/* Option to keep current image when editing */}
            {category?.image && !formData.image && (
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.keepCurrentImage}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      keepCurrentImage: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="mr-2 text-sm text-gray-700">نگه داشتن تصویر فعلی</span>
                </label>
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ترتیب نمایش
            </label>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleInputChange}
              disabled={loading}
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.sortOrder ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.sortOrder && <p className="mt-1 text-sm text-red-600">{errors.sortOrder}</p>}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              disabled={loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
              فعال
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {errors.submit}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 space-x-reverse p-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                در حال ذخیره...
              </>
            ) : (
              category ? 'به‌روزرسانی' : 'ایجاد دسته‌بندی'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Category Management Component
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 10
  });

  // Load categories function
  const loadCategories = async () => {
    setLoading(true);
    try {
      // Prepare query parameters
      const params = {
        page: filters.page,
        limit: filters.limit
      };
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status !== 'all') {
        params.status = filters.status === 'active';
      }

      const response = await getAdminCategories(params);
      
      if (response.success) {
        setCategories(response.data.categories || []);
        setPagination(response.data.pagination || {});
      } else {
        showToast(response.message || 'خطا در بارگذاری دسته‌بندی‌ها', 'error');
        setCategories([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast(
        error.response?.data?.message || 'خطا در بارگذاری دسته‌بندی‌ها', 
        'error'
      );
      setCategories([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  // Initial load and reload on filter changes
  useEffect(() => {
    loadCategories();
  }, [filters]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (category.productsCount > 0) {
      showToast(`نمی‌توان دسته‌بندی را حذف کرد. ${category.productsCount} محصول در این دسته وجود دارد`, 'warning');
      return;
    }
    
    if (window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      try {
        const response = await deleteCategory(category._id);
        if (response.success) {
          showToast(response.message || 'دسته‌بندی با موفقیت حذف شد', 'success');
          loadCategories();
        } else {
          showToast(response.message || 'خطا در حذف دسته‌بندی', 'error');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        showToast(
          error.response?.data?.message || 'خطا در حذف دسته‌بندی', 
          'error'
        );
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSave = (message) => {
    showToast(message, 'success');
    loadCategories();
  };

  // Search delay effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (filters.search !== '' || filters.page === 1) {
        // Trigger search when there's text or reset to first page
        setFilters(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters.search]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">مدیریت دسته‌بندی‌ها</h1>
        <p className="text-gray-600">مدیریت و سازماندهی دسته‌بندی‌های محصولات فروشگاه</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
          <div className="text-sm text-blue-600">کل دسته‌بندی‌ها</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {categories.filter(cat => cat.isActive).length}
          </div>
          <div className="text-sm text-green-600">فعال</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {categories.filter(cat => !cat.isActive).length}
          </div>
          <div className="text-sm text-red-600">غیرفعال</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {categories.reduce((sum, cat) => sum + (cat.productsCount || 0), 0)}
          </div>
          <div className="text-sm text-orange-600">کل محصولات</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در نام دسته‌بندی..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="appearance-none pr-10 pl-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
            </div>

            {/* Items per page */}
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>۵ مورد</option>
              <option value={10}>۱۰ مورد</option>
              <option value={20}>۲۰ مورد</option>
              <option value={50}>۵۰ مورد</option>
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            افزودن دسته‌بندی
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری دسته‌بندی‌ها...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Image className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filters.search ? 'هیچ نتیجه‌ای یافت نشد' : 'هیچ دسته‌بندی یافت نشد'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search 
                ? 'لطفاً کلید واژه دیگری جستجو کنید' 
                : 'شما هنوز هیچ دسته‌بندی ایجاد نکرده‌اید'
              }
            </p>
            {!filters.search && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                ایجاد اولین دسته‌بندی
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تصویر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اطلاعات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      محصولات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ترتیب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (category.productsCount || 0) > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.productsCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {category.sortOrder}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="ویرایش دسته‌بندی"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="حذف دسته‌بندی"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    قبلی
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    بعدی
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      نمایش{' '}
                      <span className="font-medium">
                        {((pagination.currentPage - 1) * filters.limit) + 1}
                      </span>{' '}
                      تا{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * filters.limit, pagination.total)}
                      </span>{' '}
                      از{' '}
                      <span className="font-medium">{pagination.total}</span>{' '}
                      نتیجه
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 7) {
                          pageNum = i + 1;
                        } else {
                          const current = pagination.currentPage;
                          const total = pagination.totalPages;
                          
                          if (current <= 4) {
                            pageNum = i + 1;
                          } else if (current >= total - 3) {
                            pageNum = total - 6 + i;
                          } else {
                            pageNum = current - 3 + i;
                          }
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange('page', pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default CategoryManagement;