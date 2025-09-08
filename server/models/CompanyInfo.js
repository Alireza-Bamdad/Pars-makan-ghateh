const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  // اطلاعات اصلی شرکت
  name: {
    type: String,
    required: [true, 'نام شرکت الزامی است'],
    trim: true
  },
  slogan: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد']
  },
  
  // لوگو و تصاویر
  logo: {
    type: String
  },
  favicon: {
    type: String
  },
  heroImage: {
    type: String
  },
  
  // اطلاعات تماس
  contact: {
    phones: [{
      title: String, // مثل "فروش", "پشتیبانی"
      number: String,
      isMain: { type: Boolean, default: false }
    }],
    emails: [{
      title: String,
      address: String,
      isMain: { type: Boolean, default: false }
    }],
    address: {
      full: String,
      city: String,
      state: String,
      postalCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    workingHours: [{
      days: String, // مثل "شنبه تا چهارشنبه"
      hours: String // مثل "۸ تا ۱۷"
    }]
  },
  
  // شبکه‌های اجتماعی
  socialMedia: {
    instagram: String,
    telegram: String,
    whatsapp: String,
    linkedin: String,
    website: String
  },
  
  // متن‌های سایت
  texts: {
    heroTitle: String,
    heroSubtitle: String,
    aboutTitle: String,
    aboutText: String,
    productsTitle: {
      type: String,
      default: 'محصولات ما'
    },
    productsSubtitle: String,
    contactNote: {
      type: String,
      default: 'برای استعلام قیمت و سفارش با ما تماس بگیرید'
    }
  },
  
  // تنظیمات SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  },
  
  // تنظیمات نمایش
  settings: {
    showHeroSection: { type: Boolean, default: true },
    showAboutSection: { type: Boolean, default: true },
    productsPerPage: { type: Number, default: 12 },
    enableSearch: { type: Boolean, default: true },
    mainColor: { type: String, default: '#2563eb' },
    secondaryColor: { type: String, default: '#64748b' }
  }
}, {
  timestamps: true
});

// فقط یک رکورد از اطلاعات شرکت باید وجود داشته باشه
companyInfoSchema.statics.getSingle = async function() {
  let companyInfo = await this.findOne();
  
  if (!companyInfo) {
    // اگر رکوردی وجود نداره، یکی بساز
    companyInfo = await this.create({
      name: 'نام شرکت شما',
      slogan: 'شعار شرکت',
      description: 'توضیحات شرکت در اینجا قرار می‌گیرد'
    });
  }
  
  return companyInfo;
};

// متد برای به‌روزرسانی اطلاعات شرکت
companyInfoSchema.statics.updateInfo = async function(updateData) {
  let companyInfo = await this.findOne();
  
  if (!companyInfo) {
    return await this.create(updateData);
  }
  
  Object.assign(companyInfo, updateData);
  return await companyInfo.save();
};

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);