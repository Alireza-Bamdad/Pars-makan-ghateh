// pages/Home.jsx
import { getProducts } from '../services/product';
import { getCategories } from '../services/category';
import React, { useEffect, useState } from 'react';
import { Phone } from 'lucide-react'; // 👈 آیکون تلفن

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productsResponse = await getProducts();
      setProducts(productsResponse.data.products);

      const categoriesResponse = await getCategories();
      setCategories(categoriesResponse.data.categories);
    } catch (error) {
      console.log(error);
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0].src || product.images[0];
    }
    return '/default-product.png';
  };

  const getCategoryImage = (category) => {
    if (category.images && category.images.length > 0) {
      return category.images[0].url || category.images[0].src || category.images[0];
    }
    return category.image || '/default-category.png';
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative w-full h-72 md:h-102 overflow-hidden">
        <img src="/baner.svg" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/70 to-black/50 flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold  drop-shadow-lg"></h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-extrabold mb-10 text-center">دسته‌بندی‌ها</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {categories.map((category) => (
              <div
                key={category._id || category.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() =>
                  (window.location.href = `/products?category=${category._id || category.id}`)
                }
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-lg border-4 border-orange-500 bg-white group-hover:scale-110 transition-all duration-300">
                  <img
                    src={getCategoryImage(category)}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-category.png';
                    }}
                  />
                </div>
                <span className="mt-3 text-sm font-semibold text-gray-800 text-center group-hover:text-orange-600 transition-colors duration-300">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">محصولات ما</h2>
            <button
              className="text-orange-600 px-6 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              onClick={() => (window.location.href = '/products')}
            >
              مشاهده همه
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() =>
                  (window.location.href = `/product/${product.slug || product.id}`)
                }
              >
                <div className="w-full h-52 overflow-hidden relative">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/default-product.png';
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-orange-600">
                      برای استعلام قیمت با کارشناس فروش تماس بگیرید
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Phone Button 👇 */}
      <a
        href="tel: 09173271310"
        className="fixed bottom-25 left-6 bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-xl hover:bg-orange-700 transition-colors duration-300 z-50"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
};

export default Home;
