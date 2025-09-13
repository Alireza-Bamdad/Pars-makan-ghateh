  const express = require('express');
  const jwt = require('jsonwebtoken');
  const { body, validationResult } = require('express-validator');
  const User = require('../models/User');
  const router = express.Router();

  // Helper function to generate JWT token
  const generateToken = (userId) => {
    return jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  };

  // @route   POST /api/auth/login
  // @desc    Admin login
  // @access  Public
  router.post('/login', [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('فرمت ایمیل صحیح نیست'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('رمز عبور باید حداقل ۶ کاراکتر باشد')
  ], async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده صحیح نیست',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'ایمیل یا رمز عبور اشتباه است'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'ایمیل یا رمز عبور اشتباه است'
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'ورود موفق',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'خطای سرور'
      });
    }
  });

  // @route   GET /api/auth/me
  // @desc    Get current user info
  // @access  Private
  router.get('/me', async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'توکن احراز هویت یافت نشد'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'کاربر یافت نشد'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin
          }
        }
      });

    } catch (error) {
      console.error('Auth me error:', error);
      res.status(401).json({
        success: false,
        message: 'توکن نامعتبر است'
      });
    }
  });

  // @route   POST /api/auth/change-password
  // @desc    Change password
  // @access  Private
  router.post('/change-password', [
    body('currentPassword')
      .notEmpty()
      .withMessage('رمز عبور فعلی الزامی است'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('رمز عبور جدید باید حداقل ۶ کاراکتر باشد')
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

      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'توکن احراز هویت یافت نشد'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'کاربر یافت نشد'
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Check current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'رمز عبور فعلی اشتباه است'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر کرد'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'خطای سرور'
      });
    }
  });

  module.exports = router;