const express = require('express');
const router = express.Router();
const CompanyInfo = require('../models/CompanyInfo');

// دریافت اطلاعات شرکت (عمومی)
router.get('/', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    res.json({
      success: true,
      data: companyInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات شرکت',
      error: error.message
    });
  }
});

// دریافت اطلاعات عمومی برای نمایش در سایت (بدون اطلاعات حساس)
router.get('/public', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    
    // فقط اطلاعات عمومی را برگردان
    const publicData = {
      name: companyInfo.name,
      slogan: companyInfo.slogan,
      description: companyInfo.description,
      logo: companyInfo.logo,
      favicon: companyInfo.favicon,
      heroImage: companyInfo.heroImage,
      contact: {
        phones: companyInfo.contact?.phones || [],
        emails: companyInfo.contact?.emails || [],
        address: companyInfo.contact?.address || {},
        workingHours: companyInfo.contact?.workingHours || []
      },
      socialMedia: companyInfo.socialMedia || {},
      texts: companyInfo.texts || {},
      seo: companyInfo.seo || {},
      settings: {
        showHeroSection: companyInfo.settings?.showHeroSection,
        showAboutSection: companyInfo.settings?.showAboutSection,
        mainColor: companyInfo.settings?.mainColor,
        secondaryColor: companyInfo.settings?.secondaryColor
      }
    };

    res.json({
      success: true,
      data: publicData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات عمومی شرکت',
      error: error.message
    });
  }
});

// به‌روزرسانی کامل اطلاعات شرکت (نیاز به احراز هویت ادمین)
router.put('/', async (req, res) => {
  try {
    // اینجا باید middleware احراز هویت اضافه کنید
    // مثل: requireAuth, requireAdmin
    
    const updatedInfo = await CompanyInfo.updateInfo(req.body);
    
    res.json({
      success: true,
      message: 'اطلاعات شرکت با موفقیت به‌روزرسانی شد',
      data: updatedInfo
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'خطا در اعتبارسنجی داده‌ها',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی اطلاعات شرکت',
      error: error.message
    });
  }
});

// به‌روزرسانی بخش‌های خاص
router.patch('/contact', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    companyInfo.contact = { ...companyInfo.contact, ...req.body };
    await companyInfo.save();

    res.json({
      success: true,
      message: 'اطلاعات تماس با موفقیت به‌روزرسانی شد',
      data: companyInfo.contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی اطلاعات تماس',
      error: error.message
    });
  }
});

router.patch('/social-media', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    companyInfo.socialMedia = { ...companyInfo.socialMedia, ...req.body };
    await companyInfo.save();

    res.json({
      success: true,
      message: 'شبکه‌های اجتماعی با موفقیت به‌روزرسانی شد',
      data: companyInfo.socialMedia
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی شبکه‌های اجتماعی',
      error: error.message
    });
  }
});

router.patch('/texts', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    companyInfo.texts = { ...companyInfo.texts, ...req.body };
    await companyInfo.save();

    res.json({
      success: true,
      message: 'متن‌های سایت با موفقیت به‌روزرسانی شد',
      data: companyInfo.texts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی متن‌های سایت',
      error: error.message
    });
  }
});

router.patch('/seo', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    companyInfo.seo = { ...companyInfo.seo, ...req.body };
    await companyInfo.save();

    res.json({
      success: true,
      message: 'تنظیمات SEO با موفقیت به‌روزرسانی شد',
      data: companyInfo.seo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی تنظیمات SEO',
      error: error.message
    });
  }
});

router.patch('/settings', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    companyInfo.settings = { ...companyInfo.settings, ...req.body };
    await companyInfo.save();

    res.json({
      success: true,
      message: 'تنظیمات نمایش با موفقیت به‌روزرسانی شد',
      data: companyInfo.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی تنظیمات نمایش',
      error: error.message
    });
  }
});

// آپلود لوگو
router.post('/upload/logo', async (req, res) => {
  try {
    // اینجا باید middleware آپلود فایل اضافه کنید (مثل multer)
    // const logoPath = req.file.path;
    
    const companyInfo = await CompanyInfo.getSingle();
    // companyInfo.logo = logoPath;
    // await companyInfo.save();

    res.json({
      success: true,
      message: 'لوگو با موفقیت آپلود شد'
      // data: { logoPath }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در آپلود لوگو',
      error: error.message
    });
  }
});

// آپلود favicon
router.post('/upload/favicon', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    // منطق آپلود favicon
    
    res.json({
      success: true,
      message: 'Favicon با موفقیت آپلود شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در آپلود favicon',
      error: error.message
    });
  }
});

// آپلود تصویر hero
router.post('/upload/hero-image', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    // منطق آپلود تصویر hero
    
    res.json({
      success: true,
      message: 'تصویر اصلی با موفقیت آپلود شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در آپلود تصویر اصلی',
      error: error.message
    });
  }
});

// دریافت تنها تنظیمات رنگ‌ها برای theme
router.get('/theme', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    const theme = {
      mainColor: companyInfo.settings?.mainColor || '#2563eb',
      secondaryColor: companyInfo.settings?.secondaryColor || '#64748b'
    };

    res.json({
      success: true,
      data: theme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تنظیمات رنگ',
      error: error.message
    });
  }
});

// دریافت اطلاعات بیسیک برای داشبورد ادمین
router.get('/admin/summary', auth, isAdmin, async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.getSingle();
    
    const summary = {
      hasLogo: !!companyInfo.logo,
      hasFavicon: !!companyInfo.favicon,
      hasHeroImage: !!companyInfo.heroImage,
      hasDescription: !!companyInfo.description,
      contactInfo: {
        phoneCount: companyInfo.contact?.phones?.length || 0,
        emailCount: companyInfo.contact?.emails?.length || 0,
        hasAddress: !!companyInfo.contact?.address?.full
      },
      socialMedia: {
        instagram: !!companyInfo.socialMedia?.instagram,
        telegram: !!companyInfo.socialMedia?.telegram,
        whatsapp: !!companyInfo.socialMedia?.whatsapp,
        linkedin: !!companyInfo.socialMedia?.linkedin,
        website: !!companyInfo.socialMedia?.website
      },
      seo: {
        hasTitle: !!companyInfo.seo?.title,
        hasDescription: !!companyInfo.seo?.description,
        keywordCount: companyInfo.seo?.keywords?.length || 0
      },
      lastUpdated: companyInfo.updatedAt
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت خلاصه اطلاعات',
      error: error.message
    });
  }
});

module.exports = router;