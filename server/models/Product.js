const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام محصول الزامی است'],
    trim: true,
    maxlength: [200, 'نام محصول نباید بیشتر از ۲۰۰ کاراکتر باشد']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'توضیحات محصول الزامی است'],
    trim: true,
    maxlength: [2000, 'توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'توضیحات کوتاه نباید بیشتر از ۳۰۰ کاراکتر باشد']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'دسته‌بندی محصول الزامی است']
  },
  // تصاویر محصول
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  // مشخصات فنی
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  // ویژگی‌های محصول
  features: [String],
  // وضعیت موجودی
  inStock: {
    type: Boolean,
    default: true
  },
  // وضعیت انتشار
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // اولویت نمایش
  sortOrder: {
    type: Number,
    default: 0
  },
  // آمار
  viewsCount: {
    type: Number,
    default: 0
  },
  // SEO
  metaTitle: {
    type: String,
    maxlength: [60, 'عنوان متا نباید بیشتر از ۶۰ کاراکتر باشد']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'توضیحات متا نباید بیشتر از ۱۶۰ کاراکتر باشد']
  },
  // تگ‌ها
  tags: [String]
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

// Function to create Persian slug
function createPersianSlug(text) {
  let slug = text
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Keep only Persian chars, letters, numbers, hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
  
  return slug || 'محصول-' + Date.now();
}

// Generate slug from name if not provided
productSchema.pre('save', async function(next) {
  if (!this.slug && this.name) {
    let baseSlug = createPersianSlug(this.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for uniqueness
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Update category products count when product is saved
productSchema.post('save', async function() {
  if (this.category) {
    try {
      const Category = require('./Category');
      const category = await Category.findById(this.category);
      if (category) {
        await category.updateProductsCount();
      }
    } catch (error) {
      console.error('Error updating category products count:', error);
    }
  }
});

// Update category products count when product is removed
productSchema.post('deleteOne', { document: true, query: false }, async function() {
  if (this.category) {
    try {
      const Category = require('./Category');
      const category = await Category.findById(this.category);
      if (category) {
        await category.updateProductsCount();
      }
    } catch (error) {
      console.error('Error updating category products count:', error);
    }
  }
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const mainImg = this.images.find(img => img.isMain);
  return mainImg ? mainImg : this.images[0];
});

// Method to increment view count
productSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  return this.save();
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 8) {
  return this.find({ 
    isFeatured: true, 
    isActive: true 
  })
  .populate('category', 'name slug')
  .sort({ sortOrder: 1, createdAt: -1 })
  .limit(limit);
};

// Static method to get products by category
productSchema.statics.getByCategory = function(categoryId, options = {}) {
  const { page = 1, limit = 12, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;
  
  return this.find({ 
    category: categoryId, 
    isActive: true 
  })
  .populate('category', 'name slug')
  .sort(sort)
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Product', productSchema);