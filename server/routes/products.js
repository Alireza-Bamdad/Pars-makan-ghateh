const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadMultiple, handleUploadError, deleteFile, getFileUrl } = require('../middleware/upload');

const router = express.Router();

// ----------------------
// Public Routes
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
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({ success: true, data: { products, pagination: { total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    await product.incrementViews();
    res.json({ success: true, data: { product } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// ----------------------
// Admin Routes
// ----------------------

// Get all products for admin
// Get all products for admin with pagination
// Get all products for admin (Updated route to replace your existing admin route)
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
    console.error(error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Create product
router.post('/admin', [
  auth, isAdmin,
  (req, res, next) => { uploadMultiple(req, res, (err) => { if (err) return handleUploadError(err, req, res, next); next(); }); },
  body('name').notEmpty(),
  body('description').notEmpty(),
  body('category').isMongoId(),
  body('brand').notEmpty(),
  body('carType').notEmpty(),
  body('partNumber').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, description, shortDescription, category, brand, carType, partNumber, sortOrder = 0, isFeatured = false } = req.body;
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ success: false, message: 'دسته‌بندی یافت نشد' });

    let images = [];
    if (req.files) {
      images = req.files.map((file, index) => ({ url: getFileUrl(file.filename), alt: name, isMain: index === 0 }));
    }

    const product = new Product({ name, description, shortDescription, category, brand, carType, partNumber, sortOrder, isFeatured, images });
    await product.save();
    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    console.error(error);
    if (req.files) req.files.forEach(file => deleteFile(file.path));
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Update product
router.put('/admin/:id', [auth, isAdmin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'محصول یافت نشد' });

    Object.assign(product, req.body);
    await product.save();
    await product.populate('category', 'name slug');

    res.json({ success: true, data: { product } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Delete product
router.delete('/admin/:id', [auth, isAdmin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'محصول یافت نشد' });

    if (product.images) product.images.forEach(img => deleteFile(`uploads/products/${img.url.replace('/uploads/products/', '')}`));

    await product.deleteOne();
    res.json({ success: true, message: 'محصول حذف شد' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Delete specific image
router.delete('/admin/:id/image/:imageIndex', [auth, isAdmin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'محصول یافت نشد' });

    const idx = parseInt(req.params.imageIndex);
    if (idx >= product.images.length) return res.status(400).json({ success: false, message: 'تصویر یافت نشد' });

    deleteFile(`uploads/products/${product.images[idx].url.replace('/uploads/products/', '')}`);
    const deleted = product.images.splice(idx, 1)[0];

    if (deleted.isMain && product.images.length > 0) product.images[0].isMain = true;
    await product.save();

    res.json({ success: true, message: 'تصویر حذف شد', data: { product } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

module.exports = router;
