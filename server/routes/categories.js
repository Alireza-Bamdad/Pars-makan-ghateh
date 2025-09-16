const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Category = require('../models/Category');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadSingle, handleUploadError, deleteFile, getFileUrl } = require('../middleware/upload');
const router = express.Router();

// برای validation slug
const slugValidation = (value) => {
  if (!value) return true; // اختیاری است
  // فقط حروف فارسی، انگلیسی، اعداد و خط تیره مجاز
  return /^[\u0600-\u06FFa-z0-9]+(?:-[\u0600-\u06FFa-z0-9]+)*$/.test(value);
};


// @route   GET /api/categories
// @desc    Get all active categories (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getActiveWithCount();
    
    res.json({
      success: true,
      data: {
        categories,
        total: categories.length
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   GET /api/categories/admin/all
// @desc    Get all categories for admin (with inactive)
// @access  Private (Admin)
router.get('/admin/all', [auth, isAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Get categories with pagination
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(filter);

    // Update products count for each category
    for (let category of categories) {
      await category.updateProductsCount();
    }

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          hasNext: skip + categories.length < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   POST /api/categories/admin
// @desc    Create new category
// @access  Private (Admin)
router.post('/admin', [
  auth,
  isAdmin,
  (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('نام دسته‌بندی باید بین ۱ تا ۱۰۰ کاراکتر باشد'),
    // در validation rules
    body('slug')
      .optional()
      .custom(slugValidation)
      .withMessage('slug باید فقط شامل حروف فارسی، انگلیسی، اعداد و خط تیره باشد'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('ترتیب نمایش باید عدد صحیح مثبت باشد')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'اطلاعات وارد شده صحیح نیست',
        errors: errors.array()
      });
    }

    const { name, slug, description, sortOrder, isActive = true } = req.body;

    // Check if category with same name exists
    const existingByName = await Category.findOne({ name });
    if (existingByName) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'دسته‌بندی با این نام قبلاً وجود دارد'
      });
    }

    // Check if slug exists (if provided)
    if (slug) {
      const existingBySlug = await Category.findOne({ slug });
      if (existingBySlug) {
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'slug وارد شده قبلاً استفاده شده است'
        });
      }
    }

    // Process uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = getFileUrl(req.file.filename);
    }

    const category = new Category({
      name,
      slug,
      description,
      image: imageUrl,
      sortOrder: sortOrder || 0,
      isActive
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'دسته‌بندی با موفقیت ایجاد شد',
      data: { category }
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    // Delete uploaded file on error
    if (req.file) {
      deleteFile(req.file.path);
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'slug' ? 'slug' : 'نام'} تکراری است`
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   PUT /api/categories/admin/:id
// @desc    Update category
// @access  Private (Admin)
router.put('/admin/:id', [
  auth,
  isAdmin,
  param('id').isMongoId().withMessage('شناسه نامعتبر است'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('نام دسته‌بندی باید بین ۱ تا ۱۰۰ کاراکتر باشد'),
body('slug')
  .optional()
  .custom(slugValidation)
  .withMessage('slug باید فقط شامل حروف فارسی، انگلیسی، اعداد و خط تیره باشد'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد')
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

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی یافت نشد'
      });
    }

    const updateData = req.body;

    // Check for name conflicts
    if (updateData.name && updateData.name !== category.name) {
      const existingByName = await Category.findOne({ 
        name: updateData.name,
        _id: { $ne: category._id }
      });
      if (existingByName) {
        return res.status(400).json({
          success: false,
          message: 'دسته‌بندی با این نام قبلاً وجود دارد'
        });
      }
    }

    // Check for slug conflicts
    if (updateData.slug && updateData.slug !== category.slug) {
      const existingBySlug = await Category.findOne({ 
        slug: updateData.slug,
        _id: { $ne: category._id }
      });
      if (existingBySlug) {
        return res.status(400).json({
          success: false,
          message: 'slug وارد شده قبلاً استفاده شده است'
        });
      }
    }

    Object.assign(category, updateData);
    await category.save();

    res.json({
      success: true,
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
      data: { category }
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   DELETE /api/categories/admin/:id
// @desc    Delete category
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

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی یافت نشد'
      });
    }

    // Check if category has products
    const Product = require('../models/Product');
    const productsCount = await Product.countDocuments({ category: category._id });
    
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `نمی‌توان دسته‌بندی را حذف کرد. ${productsCount} محصول در این دسته وجود دارد`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// @route   GET /api/categories/:slug
// @desc    Get single category by slug (Public)
// @access  Public
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

    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی یافت نشد'
      });
    }

    // Update products count
    await category.updateProductsCount();

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

module.exports = router;