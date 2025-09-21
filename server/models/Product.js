const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 15000 },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    partNumber: { type: String, required: true },
    brand: { type: String, required: true },
    carType: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        isMain: { type: Boolean, default: false }
      }
    ],
    sortOrder: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

function createPersianSlug(text) {
  let slug = text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'محصول-' + Date.now();
}

productSchema.pre('save', async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = createPersianSlug(this.name);
    let slug = baseSlug;
    let counter = 1;
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

productSchema.methods.incrementViews = function () {
  this.viewsCount += 1;
  return this.save();
};

productSchema.virtual('mainImage').get(function () {
  if (!this.images || this.images.length === 0) return null;
  const mainImg = this.images.find((img) => img.isMain);
  return mainImg || this.images[0];
});

module.exports = mongoose.model('Product', productSchema);
