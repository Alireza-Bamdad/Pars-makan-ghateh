// pages/Home.jsx
import { getProducts } from '../services/product';
import { getCategories } from '../services/category';
import React, { useEffect, useState , useRef } from 'react';
import { Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

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
    const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryImage = (category) => {
    if (category.images && category.images.length > 0) {
      return category.images[0].url || category.images[0].src || category.images[0];
    }
    return category.image || '/default-category.png';
  };

  return (
    <div className="min-h-screen mx-2 md:mx-4">
      {/* Banner */}
      <div className="relative w-full h-45 md:h-102 overflow-hidden rounded mt-8">
        <img src="/baner.svg" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-300/70 to-black/50 flex items-center justify-center">
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
                onClick={() => navigate('/products')}
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
        <div className=" px-6">
              <h2 className="text-3xl font-extrabold mb-6">محصولات ما</h2>

              <div className="relative">
                {/* فلش چپ */}
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* کانتینر اسکرول افقی */}
                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide scroll-smooth"
                >
                  {products.slice(0, 8).map((product) => (
                    <div
                      key={product._id || product.id}
                      className="min-w-[200px] bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex-shrink-0"
                    >
                      <div className="w-full h-44 overflow-hidden relative">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => { e.target.src = '/default-product.png'; }}
                          onClick={() => navigate(`/product/${product.slug}`)}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-md text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                        <span className="text-xs font-bold text-orange-600">
                          برای استعلام قیمت تماس بگیرید
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* فلش راست */}
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* کلاس CSS برای مخفی کردن scrollbar */}
              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
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
