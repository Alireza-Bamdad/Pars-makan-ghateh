// pages/About.jsx
import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">درباره ما</h1>
          <p className="text-xl text-gray-600">داستان شرکت پارس ماکان قطعه</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ماموریت ما</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              شرکت پارس ماکان قطعه با هدف تولید قطعات صنعتی با کیفیت و استاندارد بین‌المللی 
              فعالیت خود را آغاز کرده است. ما متعهد به ارائه بهترین محصولات و خدمات به مشتریان خود هستیم.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">۱۵+</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">سال تجربه</h3>
              <p className="text-gray-600">در تولید قطعات صنعتی</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">۵۰۰+</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">مشتری راضی</h3>
              <p className="text-gray-600">در سراسر کشور</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;