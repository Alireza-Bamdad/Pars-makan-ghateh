import React, { useState } from 'react';
import { Menu, X, Home, Package, Info, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'خانه', icon: Home, path: '/' },
    { name: 'محصولات', icon: Package, path: '/products' },
    { name: 'درباره ما', icon: Info, path: '/about' },
    { name: 'تماس با ما', icon: Phone, path: '/contact' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="font-vazir" dir="rtl">
      <style jsx>{`
        @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css');
        
        .font-vazir {
          font-family: Vazir, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      {/* Desktop Header - Fixed Top */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md border-b-2 border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* لوگو */}
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <div className="bg-blue-600 text-white w-14 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                PMG
              </div>
              <span className="mr-4 text-2xl font-black text-gray-900 tracking-tight">
                پارس ماکان قطعه
              </span>
            </Link>

            {/* منوی دسکتاپ */}
            <nav className="hidden md:flex">
              <div className="flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 flex items-center gap-3 group ${
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50 shadow-sm'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 group-hover:scale-110 transition-transform duration-200 ${
                      isActive(item.path) ? 'text-blue-600' : ''
                    }`} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 pt-4 pb-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-6 h-6" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* نوار پایین موبایل */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 md:hidden z-50 shadow-2xl">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-4 px-2 transition-all duration-300 group ${
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <item.icon className={`w-7 h-7 mb-2 group-hover:scale-110 transition-transform duration-200 ${
                isActive(item.path) ? 'text-blue-600' : ''
              }`} />
              <span className="text-xs font-semibold leading-tight text-center">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;