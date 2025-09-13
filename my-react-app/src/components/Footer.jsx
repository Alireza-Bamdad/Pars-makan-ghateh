import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Home, 
  Package, 
  Info, 
  Users,
  Instagram,
  Twitter,
  Linkedin,
  ChevronUp
} from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'خانه', path: '/', icon: Home },
    { name: 'محصولات', path: '/products', icon: Package },
    { name: 'درباره ما', path: '/about', icon: Info },
    { name: 'تماس با ما', path: '/contact', icon: Phone },
  ];

  const services = [
    'طراحی و تولید قطعات',
    'مشاوره فنی',
    'خدمات پس از فروش',
    'تعمیر و نگهداری'
  ];

  const contactInfo = [
    { icon: Phone, text: '۰۲۱-۱۲۳۴۵۶۷۸', type: 'tel' },
    { icon: Mail, text: 'info@parsmakanghate.com', type: 'email' },
    { icon: MapPin, text: 'تهران، خیابان آزادی، پلاک ۱۲۳', type: 'address' },
    { icon: Clock, text: 'شنبه تا پنجشنبه: ۸ تا ۱۷', type: 'time' }
  ];

  const socialLinks = [
    { name: 'اینستاگرام', icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { name: 'توییتر', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'لینکدین', icon: Linkedin, href: '#', color: 'hover:text-blue-600' }
  ];

  return (
    <div className="font-vazir" dir="rtl">
      <style jsx>{`
        @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css');
        
        .font-vazir {
          font-family: Vazir, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      <footer className="bg-gray-900 text-white">
        {/* دکمه بازگشت به بالا */}
        <div className="bg-blue-600 py-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-center">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors duration-200 group"
            >
              <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-200" />
              <span className="font-semibold">بازگشت به بالا</span>
            </button>
          </div>
        </div>

        {/* محتوای اصلی فوتر */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* درباره شرکت */}
              <div className="lg:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                    PMG
                  </div>
                  <h3 className="mr-3 text-xl font-black text-white">
                    پارس ماکان قطعه
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  تولیدکننده قطعات صنعتی با کیفیت و استاندارد بین‌المللی. 
                  ما متعهد به ارائه بهترین محصولات و خدمات به مشتریان خود هستیم.
                </p>
                
                {/* شبکه‌های اجتماعی */}
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-200 hover:bg-gray-700 ${social.color}`}
                      title={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* لینک‌های سریع */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  لینک‌های سریع
                </h3>
                <ul className="space-y-4">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-200 group"
                      >
                        <link.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors duration-200" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* خدمات */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  خدمات ما
                </h3>
                <ul className="space-y-4">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* اطلاعات تماس */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-400" />
                  اطلاعات تماس
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((contact, index) => (
                    <div key={index} className="flex items-start gap-3 text-gray-300">
                      <contact.icon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{contact.text}</span>
                    </div>
                  ))}
                </div>

                {/* خبرنامه */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4">عضویت در خبرنامه</h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="ایمیل خود را وارد کنید"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                      عضویت
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* خط تقسیم */}
        <div className="border-t border-gray-800"></div>

        {/* کپی‌رایت */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-center md:text-right">
                <p>© ۱۴۰۳ پارس ماکان قطعه. تمامی حقوق محفوظ است.</p>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors">
                  حریم خصوصی
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors">
                  قوانین و مقررات
                </Link>
                <Link to="/sitemap" className="hover:text-white transition-colors">
                  نقشه سایت
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* فاصله برای نوار پایین موبایل */}
        <div className="h-20 md:h-0"></div>
      </footer>
    </div>
  );
};

export default Footer;