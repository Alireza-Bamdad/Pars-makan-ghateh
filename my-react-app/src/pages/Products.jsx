// pages/ProductsPage.jsx
import React, { useState, useEffect } from "react";
import { getProducts } from "../services/product";
import { getCategories } from "../services/category";
import { useNavigate } from "react-router-dom";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Helper function to get the first image from images array
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      // Handle different possible structures
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (typeof firstImage === 'object') {
        return firstImage.url || firstImage.src || firstImage.path || '/default-product.png';
      }
    }
    return product.image || product.thumbnail || '/default-product.png';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        let productsArray =
          productsData?.data?.products || productsData.products || [];
        let paginationData = productsData?.data?.pagination || null;

        let categoriesArray =
          categoriesData?.data?.categories || categoriesData.categories || [];

        setProducts(productsArray);
        setCategories(categoriesArray);
        setFilteredProducts(productsArray);
        setPagination(paginationData);
      } catch (err) {
        setError("خطا در دریافت اطلاعات");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) =>
        typeof p.category === "object"
          ? p.category._id === selectedCategory
          : p.category === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const formatPrice = (price) =>
    price ? `${price.toLocaleString("fa-IR")} تومان` : "برای استعلام قیمت تماس بگیرید";

  const handleViewDetails = (product) => {
    navigate(`/product/${product.slug || product._id}`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">در حال بارگذاری</h3>
          <p className="text-gray-500">لطفاً کمی صبر کنید...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">خطا!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-2 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-12 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="جستجو در نام محصول، برند یا شماره فنی..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-2 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-1 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all duration-300 bg-gray-50 focus:bg-white min-w-[200px]"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  پاک کردن
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              محصولی یافت نشد
            </h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              متأسفانه محصولی با این مشخصات پیدا نشد. لطفاً فیلترها یا عبارت جستجو را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className=" grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="w-62 lg:w-68 xl:w-80  w-full h-full group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2 "
                onClick={() => handleViewDetails(product)}
              >
                {/* Product Image */}
                <div className=" sm:h-62 lg:h-68 xl:h-72 relative h-35 w-full overflow-hidden bg-gray-100">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = '/default-product.png';
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        ویژه
                      </span>
                    </div>
                  )}

                  {/* Quick View Button */}
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors duration-200">
                      نمایش سریع
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-2 py-2">
                  {/* Product Name */}
                  <h3 className="text-xs  sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* Brand */}
                  {product.brand && (
                    <p className="text-xs  sm:text-sm text-gray-500 mb-2 ">
                       {product.brand}
                    </p>
                  )}

                  {/* Part Number */}
                  {product.partNumber && (
                    <p className="text-xs text-gray-400 mb-3 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                      {product.partNumber}
                    </p>
                  )}


                  {/* Price and Action */}
                  <div className="lg:flex flex-col   justify-center  items-center pt-2 border-t border-gray-100">

                    <div className="flex flex-col py-1">
                      <span className=" text-xs font-semibold sm:text-sm sm:font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <button className="px-5 py-2  bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white  rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center ">
                      <span className="text-sm font-bold ">جزئیات</span>
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (if needed) */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-2">
              {/* Add pagination controls here */}
              <span className="text-gray-600 px-4 py-2">
                صفحه {pagination.currentPage} از {pagination.totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;