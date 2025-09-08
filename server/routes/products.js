const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadMultiple, handleUploadError, deleteFile, getFileUrl } = require('../middleware/upload');
const router = express.Router();

// IMPORTANT: Specific routes must come BEFORE dynamic routes!

// @route   GET /api/products/featured/list
// @desc    Get featured products (Public)
// @access  Public
router.get('/featured/list', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('تعداد محصولات باید بین ۱ تا ۲۰ باشد')
], async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.getFeatured(parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        total: products.length
      }
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   GET /api/products/admin
// @desc    Get all products for admin (Private)
// @access  Private (Admin)
router.get('/admin', [auth, isAdmin], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '',
      status = 'all',
      featured = 'all'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }
    
    if (featured !== 'all') {
      filter.isFeatured = featured === 'true';
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
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
          currentPage: parseInt(page),
          hasNext: skip + products.length < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   GET /api/products/admin/:id
// @desc    Get single product for admin
// @access  Private (Admin)
router.get('/admin/:id', [
  auth,
  isAdmin,
  param('id').isMongoId().withMessage('شناسه نامعتبر است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get admin product error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   POST /api/products/admin
// @desc    Create new product
// @access  Private (Admin)
router.post('/admin', [
  auth,
  isAdmin,
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('نام محصول باید بین ۱ تا ۲۰۰ کاراکتر باشد'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('توضیحات باید بین ۱ تا ۲۰۰۰ کاراکتر باشد'),
  body('category')
    .isMongoId()
    .withMessage('شناسه دسته‌بندی نامعتبر است'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('توضیحات کوتاه نباید بیشتر از ۳۰۰ کاراکتر باشد')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => deleteFile(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      shortDescription,
      category,
      specifications = [],
      features = [],
      inStock = true,
      isFeatured = false,
      sortOrder = 0,
      tags = []
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      // Delete uploaded files
      if (req.files) {
        req.files.forEach(file => deleteFile(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'دسته‌بندی یافت نشد'
      });
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: getFileUrl(file.filename),
        alt: name,
        isMain: index === 0 // First image as main
      }));
    }

    // Parse specifications and features if they're strings
    let parsedSpecifications = specifications;
    let parsedFeatures = features;
    let parsedTags = tags;

    try {
      if (typeof specifications === 'string') {
        parsedSpecifications = JSON.parse(specifications);
      }
      if (typeof features === 'string') {
        parsedFeatures = JSON.parse(features);
      }
      if (typeof tags === 'string') {
        parsedTags = JSON.parse(tags);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }

    const product = new Product({
      name,
      description,
      shortDescription,
      category,
      images,
      specifications: parsedSpecifications,
      features: parsedFeatures,
      inStock,
      isFeatured,
      sortOrder,
      tags: parsedTags
    });

    await product.save();
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'محصول با موفقیت ایجاد شد',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    // Delete uploaded files on error
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }

    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   PUT /api/products/admin/:id
// @desc    Update product
// @access  Private (Admin)
router.put('/admin/:id', [
  auth,
  isAdmin,
  param('id').isMongoId().withMessage('شناسه نامعتبر است'),
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('نام محصول باید بین ۱ تا ۲۰۰ کاراکتر باشد'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('توضیحات باید بین ۱ تا ۲۰۰۰ کاراکتر باشد'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('شناسه دسته‌بندی نامعتبر است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => deleteFile(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      // Delete uploaded files
      if (req.files) {
        req.files.forEach(file => deleteFile(file.path));
      }
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }

    const updateData = { ...req.body };

    // Check if category exists (if provided)
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        // Delete uploaded files
        if (req.files) {
          req.files.forEach(file => deleteFile(file.path));
        }
        return res.status(400).json({
          success: false,
          message: 'دسته‌بندی یافت نشد'
        });
      }
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: getFileUrl(file.filename),
        alt: updateData.name || product.name,
        isMain: index === 0 && product.images.length === 0 // First image as main if no existing images
      }));
      
      // Add new images to existing ones
      updateData.images = [...(product.images || []), ...newImages];
    }

    // Parse JSON fields if they're strings
    ['specifications', 'features', 'tags'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (parseError) {
          console.error(`JSON parse error for ${field}:`, parseError);
        }
      }
    });

    // Update product
    Object.assign(product, updateData);
    await product.save();
    await product.populate('category', 'name slug');

    res.json({
      success: true,
      message: 'محصول با موفقیت به‌روزرسانی شد',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    // Delete uploaded files on error
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }

    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   DELETE /api/products/admin/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/admin/:id', [
  auth,
  isAdmin,
  param('id').isMongoId().withMessage('شناسه نامعتبر است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }

    // Delete product images from filesystem
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        if (image.url) {
          const filename = image.url.replace('/uploads/products/', '');
          const filePath = `uploads/products/${filename}`;
          deleteFile(filePath);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'محصول با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   DELETE /api/products/admin/:id/image/:imageIndex
// @desc    Delete specific image from product
// @access  Private (Admin)
router.delete('/admin/:id/image/:imageIndex', [
  auth,
  isAdmin,
  param('id').isMongoId().withMessage('شناسه محصول نامعتبر است'),
  param('imageIndex').isInt({ min: 0 }).withMessage('شماره تصویر نامعتبر است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex >= product.images.length) {
      return res.status(400).json({
        success: false,
        message: 'تصویر یافت نشد'
      });
    }

    // Delete file from filesystem
    const imageToDelete = product.images[imageIndex];
    if (imageToDelete.url) {
      const filename = imageToDelete.url.replace('/uploads/products/', '');
      const filePath = `uploads/products/${filename}`;
      deleteFile(filePath);
    }

    // Remove image from array
    product.images.splice(imageIndex, 1);

    // If deleted image was main and there are other images, make first one main
    if (imageToDelete.isMain && product.images.length > 0) {
      product.images[0].isMain = true;
    }

    await product.save();

    res.json({
      success: true,
      message: 'تصویر با موفقیت حذف شد',
      data: { product }
    });

  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   GET /api/products
// @desc    Get all active products (Public)
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('صفحه باید عدد مثبت باشد'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('تعداد محصولات باید بین ۱ تا ۵۰ باشد'),
  query('category').optional().isMongoId().withMessage('شناسه دسته‌بندی نامعتبر است'),
  query('search').optional().trim(),
  query('featured').optional().isBoolean().withMessage('مقدار ویژه باید true یا false باشد')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      featured,
      sort = '-createdAt'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter
    let filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          hasNext: skip + products.length < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   GET /api/products/:slug
// @desc    Get single product by slug (Public)
// @access  Public
// IMPORTANT: This must be LAST because it's a catch-all route!
router.get('/:slug', [
  param('slug').notEmpty().withMessage('slug الزامی است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const product = await Product.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }

    // Increment view count
    await product.incrementViews();

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

module.exports = router;