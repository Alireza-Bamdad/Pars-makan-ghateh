const jwt = require('jsonwebtoken');
const User = require('../models/User.js')

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز - توکن یافت نشد'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز - کاربر یافت نشد'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر است'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'توکن منقضی شده است'
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'دسترسی غیرمجاز'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'دسترسی محدود - فقط ادمین‌ها'
    });
  }

  next();
};

// Middleware to check if user is super admin
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'دسترسی غیرمجاز'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'دسترسی محدود - فقط سوپر ادمین'
    });
  }

  next();
};

module.exports = { auth, isAdmin, isSuperAdmin };