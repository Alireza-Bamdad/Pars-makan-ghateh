// pages/Home.jsx
import React from 'react';
const Home = () => {


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-4xl px-4">
        <h1 className="text-6xl font-black text-gray-900 mb-6">
          پارس ماکان قطعه
        </h1>
        <p className="text-2xl text-gray-600 font-medium mb-8">
          تولیدکننده قطعات با کیفیت صنعتی
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            مشاهده محصولات
          </button>
          <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            تماس با ما
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;



