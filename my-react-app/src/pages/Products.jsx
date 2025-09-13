// pages/Products.jsx
import React from 'react';

const Products = () => {
  const products = [
    { id: 1, name: 'قطعه A', description: 'توضیحات قطعه A', price: '۱۵۰,۰۰۰ تومان' },
    { id: 2, name: 'قطعه B', description: 'توضیحات قطعه B', price: '۲۰۰,۰۰۰ تومان' },
    { id: 3, name: 'قطعه C', description: 'توضیحات قطعه C', price: '۱۸۰,۰۰۰ تومان' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">محصولات</h1>
          <p className="text-xl text-gray-600">مجموعه کاملی از قطعات صنعتی</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">تصویر محصول</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  سفارش
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;

