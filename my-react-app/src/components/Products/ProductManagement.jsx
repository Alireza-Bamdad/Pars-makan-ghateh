import { useEffect, useState } from "react";
import {
  getAdminProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from "../../services/product";
import { getCategories } from "../../services/category";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // فرم محصول - matching your backend model
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

  // گرفتن داده‌ها
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productRes, categoryRes] = await Promise.all([
        getAdminProducts(),
        getCategories(),
      ]);

      setProducts(productRes?.data?.products || []);
      
      // Handle categories based on your API structure
      const categoriesData = categoryRes?.data?.categories || categoryRes?.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
    } catch (err) {
      console.error("خطا در دریافت داده‌ها:", err);
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

  // هندل تغییرات فرم
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

  // افزودن یا ویرایش محصول
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Basic client-side validation
    if (!form.name?.trim()) {
      setError("نام محصول الزامی است");
      setSubmitting(false);
      return;
    }
    if (!form.description?.trim()) {
      setError("توضیحات محصول الزامی است");
      setSubmitting(false);
      return;
    }
    if (!form.category) {
      setError("انتخاب دسته‌بندی الزامی است");
      setSubmitting(false);
      return;
    }
    if (!form.brand?.trim()) {
      setError("برند الزامی است");
      setSubmitting(false);
      return;
    }
    if (!form.carType?.trim()) {
      setError("نوع خودرو الزامی است");
      setSubmitting(false);
      return;
    }
    if (!form.partNumber?.trim()) {
      setError("شماره قطعه الزامی است");
      setSubmitting(false);
      return;
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('shortDescription', form.shortDescription);
      formData.append('category', form.category);
      formData.append('partNumber', form.partNumber);
      formData.append('brand', form.brand);
      formData.append('carType', form.carType);
      formData.append('sortOrder', form.sortOrder);
      formData.append('isFeatured', form.isFeatured);
      formData.append('isActive', form.isActive);
      
      // Add files if any
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (editing) {
        await updateProduct(form._id, formData);
        setSuccess("محصول با موفقیت ویرایش شد");
      } else {
        await createProduct(formData);
        setSuccess("محصول جدید با موفقیت اضافه شد");
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error("خطا در ذخیره محصول:", err);
      setError(err.response?.data?.message || "خطا در ذخیره محصول");
    } finally {
      setSubmitting(false);
    }
  };

  // حذف محصول
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

  // پر کردن فرم برای ویرایش
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
    setEditing(true);
    setSelectedFiles([]);
  };

  // ریست فرم
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
    // Reset file input
    const fileInput = document.getElementById('product-images');
    if (fileInput) fileInput.value = '';
  };

  // Since we're now filtering server-side, we can show all products directly
  const filteredProducts = products;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">مدیریت محصولات</h1>
        <p className="text-gray-600">مدیریت کامل محصولات فروشگاه</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-r-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-r-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
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
            نمایش محصولات غیرفعال
          </label>
        </div>
      </div>

      {/* فرم افزودن/ویرایش */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                توضیحات کامل *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows="4"
                maxLength="2000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                می‌توانید چندین تصویر انتخاب کنید
              </p>
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

          {/* Current Images for Edit Mode */}
          {editing && form.images && form.images.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تصاویر فعلی
              </label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    {image.isMain && (
                      <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded">
                        اصلی
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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

      {/* جدول محصولات */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-10 w-10 rounded-full object-cover ml-4"
                            />
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
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
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