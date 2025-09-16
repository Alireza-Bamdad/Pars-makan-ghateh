const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام دسته‌بندی الزامی است'],
    trim: true,
    maxlength: [100, 'نام دسته‌بندی نباید بیشتر از ۱۰۰ کاراکتر باشد']
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد']
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  productsCount: {
    type: Number,
    default: 0
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'عنوان متا نباید بیشتر از ۶۰ کاراکتر باشد']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'توضیحات متا نباید بیشتر از ۱۶۰ کاراکتر باشد']
  }
}, {
  timestamps: true
});

// Function to create Persian slug
function createPersianSlug(text) {
  let slug = text
    .trim()
    .replace(/\s+/g, '-')                      // فضاها را با خط تیره جایگزین کن
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')     // فقط حروف فارسی، انگلیسی، اعداد و خط تیره نگه دار
    .replace(/-+/g, '-')                       // چندین خط تیره را به یکی تبدیل کن
    .replace(/^-|-$/g, '');                    // خط تیره از ابتدا و انتها حذف کن
    
  return slug || 'دسته-بندی-' + Date.now();
}

// Generate slug from name before saving
categorySchema.pre('save', async function(next) {
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

// Update products count
categorySchema.methods.updateProductsCount = async function() {
  try {
    const Product = require('./Product');
    this.productsCount = await Product.countDocuments({ 
      category: this._id,
      isActive: true 
    });
    return this.save();
  } catch (error) {
    console.error('Error updating products count:', error);
    return this;
  }
};

// Static method to get active categories with products count
categorySchema.statics.getActiveWithCount = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $addFields: {
        productsCount: {
          $size: {
            $filter: {
              input: '$products',
              cond: { $eq: ['$$this.isActive', true] }
            }
          }
        }
      }
    },
    { $project: { products: 0 } },
    { $sort: { sortOrder: 1, name: 1 } }
  ]);
};

module.exports = mongoose.model('Category', categorySchema);