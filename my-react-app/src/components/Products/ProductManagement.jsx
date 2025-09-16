import { useEffect, useRef, useState } from "react";
import {
  getAdminProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from "../../services/product";
import { getCategories } from "../../services/category";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

    const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showInactive, setShowInactive] = useState(false);


  // Form state matching backend model
  const [form, setForm] = useState({
    _id: null,
    name: "",
    description: "",
    shortDescription: "",
    category: "",
    partNumber: "",
    brand: "",
    carType: "",
    sortOrder: 0,
    isFeatured: false,
    isActive: true,
    images: []
  });
  const [editing, setEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productRes, categoryRes] = await Promise.all([
        getAdminProducts({ page: 1, limit: 1000 }),
        getCategories(),
      ]);

      setProducts(productRes?.data?.products || []);
      
      // Handle categories based on your API structure
      const categoriesData = categoryRes?.data?.categories || categoryRes?.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
    } catch (err) {
      console.error("خطا در دریافت داده‌ها:", err);
      console.error("Server response:", err.response?.data);
      setError("خطا در دریافت داده‌ها");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "توضیحات تفصیلی محصول...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }, { 'list': 'check' }],
            ["link", "image"],
            ["clean"],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
          ],
        },
      });

      // مقدار اولیه
      quillRef.current.root.innerHTML = form.description || "";

      // سینک با state
      quillRef.current.on("text-change", () => {
        setForm((prev) => ({
          ...prev,
          description: quillRef.current.root.innerHTML,
        }));
      });
    }
  }, []);
  // تابع کمکی برای ساخت URL تصاویر
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // اگر URL کامل باشد
    if (imagePath.startsWith('http')) return imagePath;
    
    // حذف اسلش اضافی از ابتدا
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // حذف اسلش اضافی از انتهای API_BASE_URL
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    
    // URL کامل بساز
    return `${baseUrl}/${cleanPath}`;
  };
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Submit form (create or update product)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!form.name?.trim()) {
      setError("نام محصول الزامی است");
      return;
    }
    if (!form.description?.trim()) {
      setError("توضیحات محصول الزامی است");
      return;
    }
    if (!form.category) {
      setError("انتخاب دسته‌بندی الزامی است");
      return;
    }
    if (!form.brand?.trim()) {
      setError("برند الزامی است");
      return;
    }
    if (!form.carType?.trim()) {
      setError("نوع خودرو الزامی است");
      return;
    }
    if (!form.partNumber?.trim()) {
      setError("شماره قطعه الزامی است");
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare product data object for your service function
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription?.trim() || '',
        category: form.category,
        partNumber: form.partNumber.trim(),
        brand: form.brand.trim(),
        carType: form.carType.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isFeatured: Boolean(form.isFeatured),
        isActive: Boolean(form.isActive),
        images: selectedFiles || [] // Array of File objects
      };

      console.log("Sending product data:", {
        ...productData,
        images: productData.images.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      if (editing) {
        await updateProduct(form._id, productData);
        setSuccess("محصول با موفقیت ویرایش شد");
      } else {
        await createProduct(productData);
        setSuccess("محصول جدید با موفقیت اضافه شد");
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error("خطا در ذخیره محصول:", err);
      console.error("Server response:", err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "خطا در ذخیره محصول");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    
    try {
      setError(null);
      await deleteProduct(id);
      setSuccess("محصول با موفقیت حذف شد");
      fetchData();
    } catch (err) {
      console.error("خطا در حذف محصول:", err);
      setError(err.response?.data?.message || "خطا در حذف محصول");
    }
  };

  // Delete image function (if needed)
  const handleDeleteImage = async (productId, imageIndex) => {
    if (!window.confirm("آیا از حذف این تصویر مطمئن هستید؟")) return;
    
    try {
      setError(null);
      // اگر تابع deleteProductImage داری، استفاده کن
      // await deleteProductImage(productId, imageIndex);
      setSuccess("تصویر با موفقیت حذف شد");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("خطا در حذف تصویر:", err);
      setError(err.response?.data?.message || "خطا در حذف تصویر");
    }
  };

  // Edit product - populate form
  const handleEdit = (product) => {
    setForm({
      _id: product._id,
      name: product.name || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      category: product.category?._id || "",
      partNumber: product.partNumber || "",
      brand: product.brand || "",
      carType: product.carType || "",
      sortOrder: product.sortOrder || 0,
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== undefined ? product.isActive : true,
      images: product.images || []
    });
    if (quillRef.current) {
      quillRef.current.root.innerHTML = product.description || "";
    }
    setEditing(true);
    setSelectedFiles([]);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      _id: null,
      name: "",
      description: "",
      shortDescription: "",

      category: "",
      partNumber: "",
      brand: "",
      carType: "",
      sortOrder: 0,
      isFeatured: false,
      isActive: true,
      images: []
    });
    setEditing(false);
    setSelectedFiles([]);
    const fileInput = document.getElementById('product-images');
    if (fileInput) fileInput.value = '';
  };

  // Filter products for display
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.partNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
    const matchesActive = showInactive || product.isActive;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">مدیریت محصولات</h1>
        <p className="text-gray-600">مدیریت کامل محصولات فروشگاه قطعات خودرو</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-r-4 border-green-500 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-3">جستجو و فیلتر</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، برند یا شماره قطعه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            {Array.isArray(categories) && categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">نمایش محصولات غیرفعال</span>
          </label>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">
          {editing ? "ویرایش محصول" : "افزودن محصول جدید"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام محصول *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نام کامل محصول"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                دسته‌بندی *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب دسته‌بندی</option>
                {Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                برند *
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نام برند"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع خودرو *
              </label>
              <input
                type="text"
                name="carType"
                value={form.carType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: پژو 206"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شماره قطعه *
              </label>
              <input
                type="text"
                name="partNumber"
                value={form.partNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="شماره قطعه"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ترتیب نمایش
              </label>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                توضیحات کوتاه
              </label>
              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                maxLength="300"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="خلاصه‌ای از محصول"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                توضیحات کامل *
              </label>
              <div
                ref={editorRef}
                className="w-full border border-gray-300 rounded-lg"
                style={{ minHeight: "200px", direction:"rtl" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تصاویر محصول
              </label>
              <input
                id="product-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                می‌توانید چندین تصویر انتخاب کنید (حداکثر 10 فایل)
              </p>
              
              {/* Show selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    تصاویر انتخاب شده ({selectedFiles.length} فایل):
                  </p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-3 py-2">
                        <div className="flex items-center">
                          <span className="text-xs text-blue-700">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <label className="flex items-center text-xs">
                          <input
                            type="radio"
                            name="mainImageIndex"
                            value={index}
                            className="mr-2"
                            onChange={() => {
                              // تنظیم تصویر اصلی برای فایل‌های جدید
                              // این داده برای ارسال به backend استفاده خواهد شد
                            }}
                          />
                          <span className="text-blue-700">تصویر اصلی</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">محصول ویژه</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">فعال</span>
            </label>
          </div>

          {/* Current Images Display for Edit Mode */}
          {editing && form.images && form.images.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تصاویر فعلی
              </label>
              <div className="grid grid-cols-6 gap-4">
                {form.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(image.url || image)}
                      alt={image.alt || form.name}
                      className="w-full h-20 object-cover rounded border border-gray-300 hover:border-blue-500 transition-colors"
                      onError={(e) => {
                        console.log('Image load error:', e.target.src);
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEM0Ni4wODUzIDQwIDUxLjA3MDcgMzUuNTI4NiA1Mi42NDIxIDI5LjI4NTdINTIuNjQyMUM1MS4wNzA3IDIzLjA0MjkgNDYuMDg1MyAxOC41NzE0IDQwIDE4LjU3MTRDMzMuOTE0NyAxOC41NzE0IDI4LjkyOTMgMjMuMDQyOSAyNy4zNTc5IDI5LjI4NTdIMjcuMzU3OUMyOC45MjkzIDM1LjUyODYgMzMuOTE0NyA0MCA0MCA0MFoiIGZpbGw9IiNEOEQ5REEiLz4KPHBhdGggZD0iTTQ2LjQyODYgMzUuNzE0M0M0Ni40Mjg2IDM4Ljg4NzcgNDMuODUyOSA0MS40Mjg2IDQwLjcxNDMgNDEuNDI4NkMzNy41NzU3IDQxLjQyODYgMzUgMzguODg3NyAzNSAzNS43MTQzQzM1IDMyLjU0MDkgMzcuNTc1NyAzMCA0MC43MTQzIDMwQzQzLjg1MjkgMzAgNDYuNDI4NiAzMi41NDA5IDQ2LjQyODYgMzUuNzE0M1oiIGZpbGw9IiNEOEQ5REEiLz4KPC9zdmc+';
                      }}
                    />
                    {image.isMain && (
                      <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                        اصلی
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(form._id, index)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                برای حذف تصویر، ماوس را روی آن قرار دهید و روی دکمه حذف کلیک کنید
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "افزودن محصول"}
            </button>
            
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                انصراف
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            لیست محصولات ({filteredProducts.length} محصول)
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    محصول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    دسته‌بندی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    برند
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع خودرو
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره قطعه
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بازدید
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={getImageUrl(product.images[0].url || product.images[0])}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover ml-4 border border-gray-200"
                              onError={(e) => {
                                console.log('Table image load error:', e.target.src);
                                e.target.style.display = 'none'; // پنهان کردن تصویر در صورت خطا
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 ml-4 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {product.isFeatured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ویژه
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.carType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.partNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.viewsCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 ml-4"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm || selectedCategory ? 'هیچ محصولی با این فیلتر یافت نشد' : 'هیچ محصولی یافت نشد'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}