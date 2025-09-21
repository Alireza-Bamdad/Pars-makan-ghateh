// pages/About.jsx
import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xl font-bold text-gray-600">داستان شرکت پارس ماکان قطعه</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-100 rounded-2xl p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed px-2">
              شرکت پارس ماکان قطعه با سال‌ها تجربه در زمینه واردات قطعات خودرو، اکنون به صورت رسمی فعالیت خود را ادامه می‌دهد. هدف ما ارائه قطعات با کیفیت، اصل و متنوع برای انواع خودروها است تا همواره نیاز مشتریان خود را به بهترین شکل برآورده کنیم.
              تیم ما با دانش فنی و شبکه گسترده تأمین‌کنندگان بین‌المللی، تلاش می‌کند فرایند خرید قطعات خودرو را برای شما ساده، سریع و مطمئن کند.
              در پارس ماکان قطعه، کیفیت و رضایت شما اولویت ماست.
              </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">20+</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">سال تجربه</h3>
              <p className="text-gray-600">در زمینه واردات قطعات خودرو</p>
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