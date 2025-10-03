const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://185.8.174.232', 'http://www.parsmakanghateh.ir'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// تنظیم EJS و فایل‌های استاتیک
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/company-website')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // خروج از برنامه در صورت خطای دیتابیس
  });

// View Routes (باید قبل از API routes باشد)
app.use('/', require('./routes/views'));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    uploadsPath: path.join(__dirname, 'uploads'),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 Handler - فقط برای API routes
app.use('/api/*', (req, res) => {
  console.log('404 - API endpoint not found:', req.originalUrl);
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// جدید:
app.use('*', (req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>404</title>
      <style>
        body { font-family: Tahoma; text-align: center; padding: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        h1 { font-size: 120px; margin: 0; }
      </style>
    </head>
    <body>
      <h1>404</h1>
      <p>صفحه یافت نشد</p>
      <a href="/login" style="color: white;">بازگشت به لاگین</a>
    </body>
    </html>
  `);
});
  

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  // خطاهای Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: 'خطای اعتبارسنجی',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      success: false, 
      message: 'شناسه نامعتبر است'
    });
  }
  
  // خطاهای JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false, 
      message: 'توکن نامعتبر است'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false, 
      message: 'توکن منقضی شده است'
    });
  }
  
  // سایر خطاها
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'خطای سرور',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});


// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🖼️  Images available at: http://localhost:${PORT}/uploads/`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});