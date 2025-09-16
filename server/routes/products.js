const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadMultiple, handleUploadError, deleteFile, getFileUrl } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// ----------------------
// Admin Routes (MUST come FIRST before /:slug)
// ----------------------

// Get all products for admin
router.get('/admin', [
  auth, isAdmin,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('category').optional().isMongoId(),
  query('status').optional().isIn(['all', 'active', 'inactive']),
  query('featured').optional().isIn(['all', 'true', 'false'])
], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      category = '', 
      status = 'all', 
      featured = 'all' 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { carType: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Status filter
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    } else if (featured === 'false') {
      filter.isFeatured = false;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({ 
      success: true, 
      data: { 
        products, 
        pagination: { 
          total, 
          totalPages: Math.ceil(total / limit), 
          currentPage: parseInt(page) 
        } 
      } 
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Create product
router.post('/admin', [
  auth, isAdmin,
  (req, res, next) => { 
    uploadMultiple(req, res, (err) => { 
      if (err) return handleUploadError(err, req, res, next); 
      next(); 
    }); 
    // Add this after the uploadMultiple middleware and before validation
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Files received:', req.files?.length || 0);
  },
  
  body('name').trim().notEmpty().withMessage('نام محصول الزامی است'),
  body('description').trim().notEmpty().withMessage('توضیحات الزامی است'),
  body('category').isMongoId().withMessage('دسته‌بندی معتبر نیست'),
  body('brand').trim().notEmpty().withMessage('برند الزامی است'),
  body('carType').trim().notEmpty().withMessage('نوع خودرو الزامی است'),
  body('partNumber').trim().notEmpty().withMessage('شماره قطعه الزامی است')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false, 
      message: 'خطای اعتبارسنجی', 
      errors: errors.array() 
    });
  }

  try {
    const { 
      name, 
      description, 
      shortDescription, 
      category, 
      brand, 
      carType, 
      partNumber, 
      sortOrder = 0, 
      isFeatured = false,
      isActive = true
    } = req.body;
    
    console.log('Received data:', req.body);
    console.log('Received files:', req.files?.length || 0);
    
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'دسته‌بندی یافت نشد' });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({ 
        url: getFileUrl(file.filename), 
        alt: name, 
        isMain: index === 0 
      }));
    }

    const product = new Product({ 
      name: name.trim(), 
      description: description.trim(), 
      shortDescription: shortDescription?.trim() || '', 
      category, 
      brand: brand.trim(), 
      carType: carType.trim(), 
      partNumber: partNumber.trim(), 
      sortOrder: parseInt(sortOrder) || 0, 
      isFeatured: isFeatured === 'true' || isFeatured === true, 
      isActive: isActive === 'true' || isActive === true,
      images 
    });
    
    await product.save();
    await product.populate('category', 'name slug');
    
    res.status(201).json({ 
      success: true, 
      data: { product }, 
      message: 'محصول با موفقیت ایجاد شد' 
    });
  } catch (error) {
    console.error('Product creation error:', error);
    if (req.files) req.files.forEach(file => deleteFile(file.path));
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Update product
router.put('/admin/:id', [
  auth, isAdmin,
  (req, res, next) => { 
    uploadMultiple(req, res, (err) => { 
      if (err) return handleUploadError(err, req, res, next); 
      next(); 
    }); 
  },
  param('id').isMongoId().withMessage('شناسه محصول نامعتبر است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // حذف فایل‌های آپلود شده در صورت خطای اعتبارسنجی
      if (req.files) req.files.forEach(file => deleteFile(file.path));
      return res.status(400).json({
        success: false,
        message: 'خطای اعتبارسنجی',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      // حذف فایل‌های آپلود شده در صورت عدم یافتن محصول
      if (req.files) req.files.forEach(file => deleteFile(file.path));
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }

    // Handle category validation if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        if (req.files) req.files.forEach(file => deleteFile(file.path));
        return res.status(400).json({ success: false, message: 'دسته‌بندی یافت نشد' });
      }
    }

    // پردازش تصاویر جدید
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file, index) => ({ 
        url: getFileUrl(file.filename), 
        alt: req.body.name || product.name, 
        isMain: product.images.length === 0 && index === 0
      }));
    }

    // آپدیت فیلدها
    const updateData = { ...req.body };
    
    // تبدیل مقادیر boolean
    if (req.body.isFeatured !== undefined) {
      updateData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }
    if (req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    if (req.body.sortOrder !== undefined) {
      updateData.sortOrder = parseInt(req.body.sortOrder) || 0;
    }

    Object.assign(product, updateData);
    
    // اضافه کردن تصاویر جدید
    if (newImages.length > 0) {
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    await product.populate('category', 'name slug');

    res.json({ 
      success: true, 
      data: { product },
      message: 'محصول با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Product update error:', error);
    // حذف فایل‌های آپلود شده در صورت خطا
    if (req.files) req.files.forEach(file => deleteFile(file.path));
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Delete product
router.delete('/admin/:id', [
  auth, isAdmin,
  param('id').isMongoId().withMessage('شناسه محصول نامعتبر است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        const imagePath = `uploads/products/${img.url.replace('/uploads/products/', '')}`;
        deleteFile(imagePath);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'محصول با موفقیت حذف شد' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// در فایل routes/products.js اضافه کنید:



// DELETE /api/products/:id/images/:imageIndex - Delete product image
router.delete('/:id/images/:imageIndex', auth, async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex);

    // پیدا کردن محصول
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول پیدا نشد' });
    }

    // بررسی اینکه index معتبر باشد
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({ success: false, message: 'شماره تصویر نامعتبر است' });
    }

    // گرفتن مسیر فایل برای حذف
    const imageToDelete = product.images[index];
    const imagePath = imageToDelete.url || imageToDelete;

    // حذف تصویر از آرایه
    product.images.splice(index, 1);

    // ذخیره تغییرات در دیتابیس
    await product.save();

    // حذف فایل از فایل سیستم
    try {
      const fullImagePath = path.join(__dirname, '../', imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
        console.log('Image file deleted:', fullImagePath);
      }
    } catch (fileError) {
      console.error('Error deleting image file:', fileError);
      // ادامه می‌دهیم حتی اگر حذف فایل موفق نباشد
    }

    res.json({
      success: true,
      message: 'تصویر با موفقیت حذف شد',
      data: product
    });

  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف تصویر محصول'
    });
  }
});
// ----------------------
// Public Routes (MUST come AFTER admin routes)
// ----------------------

// Get all products (pagination)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isMongoId(),
  query('search').optional().trim(),
  query('featured').optional().isBoolean()
], async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, featured, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    let filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({ 
      success: true, 
      data: { 
        products, 
        pagination: { 
          total, 
          totalPages: Math.ceil(total / limit), 
          currentPage: parseInt(page) 
        } 
      } 
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Get single product by slug (MUST be last)
router.get('/:slug', [
  param('slug').notEmpty().withMessage('slug محصول الزامی است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const product = await Product.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }
    
    await product.incrementViews();
    res.json({ success: true, data: { product } });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// در فایل routes/products.js اضافه کنید:

// PUT /api/products/:id/images/:imageIndex/set-main - Set main image
router.put('/:id/images/:imageIndex/set-main', auth, async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex);

    console.log(`Setting image ${index} as main for product ${id}`);

    // پیدا کردن محصول
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول پیدا نشد' });
    }

    // بررسی اینکه index معتبر باشد
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({ success: false, message: 'شماره تصویر نامعتبر است' });
    }

    // تنظیم همه تصاویر به غیراصلی
    product.images.forEach((image, i) => {
      if (typeof image === 'object' && image !== null) {
        image.isMain = (i === index);
      }
    });

    // اگر تصاویر string هستند، تبدیل به object
    if (product.images.length > 0 && typeof product.images[0] === 'string') {
      product.images = product.images.map((imageUrl, i) => ({
        url: imageUrl,
        isMain: (i === index),
        alt: product.name
      }));
    }

    // ذخیره تغییرات در دیتابیس
    await product.save();

    console.log(`Image ${index} set as main for product ${id}`);

    res.json({
      success: true,
      message: 'تصویر اصلی با موفقیت تنظیم شد',
      data: product
    });

  } catch (error) {
    console.error('Error setting main image:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در تنظیم تصویر اصلی'
    });
  }
});

module.exports = router;