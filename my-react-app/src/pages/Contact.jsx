// pages/Contact.jsx
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">تماس با ما</h1>
          <p className="text-xl text-gray-600">با ما در ارتباط باشید</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">اطلاعات تماس</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
                <Phone className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">تلفن</h3>
                  <p className="text-gray-600">۰۲۱-۱۲۳۴۵۶۷۸</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
                <Mail className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">ایمیل</h3>
                  <p className="text-gray-600">info@parsmakanghate.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">آدرس</h3>
                  <p className="text-gray-600">تهران، خیابان آزادی، پلاک ۱۲۳</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">ساعات کاری</h3>
                  <p className="text-gray-600">شنبه تا پنجشنبه: ۸ تا ۱۷</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">فرم تماس</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">موضوع</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">پیام</label>
                <textarea 
                  rows="4" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                ارسال پیام
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;