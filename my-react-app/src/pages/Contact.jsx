// pages/Contact.jsx
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  // شماره‌های تماس
  const phoneNumbers = [
    { number: '09173271310', label: 'پشتیبانی' },
    { number: '09380445252', label: 'فروش' },
    { number: '09025227255', label: 'فروش' },
    { number: '09382726533', label: 'فروش' },
    { number: '09173271316', label: 'فروش' },
    { number: '09173271317', label: 'فروش' },
    { number: '09173271318', label: 'فروش' }
  ];

  const handlePhoneCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-xl font-bold text-gray-700">با ما در ارتباط باشید</h2>
        </div>

        {/* شماره‌های تماس */}
        <div className="p-4 w-full rounded-lg shadow mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-8 h-8 text-blue-600" />
            <h3 className="font-semibold text-gray-900">شماره‌های تماس</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phoneNumbers.map((phone, index) => (
              <button
                key={index}
                onClick={() => handlePhoneCall(phone.number)}
                className="text-right p-4 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors duration-200 cursor-pointer group shadow-sm"
              >
                <div className="font-semibold text-gray-800 group-hover:text-blue-700">
                  {phone.label}
                </div>
                <div className="text-gray-600 font-semibold group-hover:text-blue-800">
                  {phone.number}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* نقشه موقعیت */}
        <div className="mb-8">
          <h2 className="text-lg text-gray-600 text-center font-bold mb-6">نشانی ما</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-96 w-full relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55488.78838536846!2d52.402789592742934!3d29.631312103400987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fb213d0a2900553%3A0x6635bb7b082c438!2sElahieh%20Shopping%20Center!5e0!3m2!1sen!2s!4v1757923724868!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقعیت دفتر پارس مکان قطعه"
                className="absolute inset-0"
              />
            </div>
            <div className="p-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                جهت دسترسی بهتر، می‌توانید از نقشه بالا استفاده کنید
              </p>
            </div>
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 bg-white p-4 rounded-lg shadow w-full">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm flex-1">
            <Mail className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">ایمیل</h3>
              <p className="text-gray-600">parsmakanghateh@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm flex-1">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">آدرس</h3>
              <p className="text-gray-600">شیراز - میدان مطهری - ساختمان الهیه</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm flex-1">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">ساعات کاری</h3>
              <p className="text-gray-600">شنبه تا پنجشنبه: ۸ تا ۱۷</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
