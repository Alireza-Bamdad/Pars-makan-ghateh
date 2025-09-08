const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/products';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری با فرمت JPG, JPEG, PNG, WEBP مجاز هستند'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10//Maximum 10 files
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = upload.single('image');

// Middleware for multiple files upload
const uploadMultiple = upload.array('images', 10);

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم فایل بیش از حد مجاز است (حداکثر ۵ مگابایت)'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'تعداد فایل‌ها بیش از حد مجاز است (حداکثر ۱۰ فایل)'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'فیلد فایل غیرمنتظره'
      });
    }
  }
  
  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to get file URL
const getFileUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/products/${filename}`;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  deleteFile,
  getFileUrl
};