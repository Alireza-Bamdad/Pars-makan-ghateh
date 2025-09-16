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
    'عرضه محصولات با کیفیت',
    ' وارد کننده انوع قطعات خودرو',
    'تضمین کیفیت',
  
  ];

  const contactInfo = [
    { icon: Phone, text: '090173271310', type: 'tel' },
    { icon: Mail, text: 'parsmakanghate@gamil.com', type: 'email' },
    { icon: MapPin, text: 'شیراز - میدان مطهری - مجتمع الهیه', type: 'address' },
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


        {/* محتوای اصلی فوتر */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* درباره شرکت */}
              <div className="lg:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                    <img src="/PMG.svg" alt="" className='rounded-full' />
                  </div>
                  <h3 className="mr-3 text-xl font-black text-white">
                    پارس ماکان قطعه
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                 وارد کننده انواع لوازم یدکی خودرو  <br/>  فروش عمده به سراسر ایران

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

              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800"></div>

        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-center md:text-right">
                <p>© ۱۴۰۳ پارس ماکان قطعه. تمامی حقوق محفوظ است.</p>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link to="#" className="hover:text-white transition-colors">
                  حریم خصوصی
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  قوانین و مقررات
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  نقشه سایت
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="h-20 md:h-0"></div>
      </footer>
    </div>
  );
};

export default Footer;